# Author: Cong Liu
# Last updated: 02-09-2022

rm(list=ls())
library(data.table)
library(ggplot2)
library(dplyr)
library(tidyr)
library(DBI)

# Connect to my-db as defined in /.ncats.cnf
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")

# hp name
res <- dbSendQuery(con, "
                   SELECT c.concept_code as concept_code, c.concept_name as concept_name
                   FROM concept c
                   WHERE c.domain_id = 'diseases';
                   ")
mondoNameDf = dbFetch(res) %>% as.data.table() # 
dbClearResult(res)

MondoIdForEvalDf = union_all(union_all(
  mondoNameDf %>% select(concept_code) %>% mutate(dataset_id = 1),
  mondoNameDf %>% select(concept_code) %>% mutate(dataset_id = 2)
),  mondoNameDf %>% select(concept_code) %>% mutate(dataset_id = 3))

mondoNameDf %>% pull(concept_code) %>% unique() %>% length() # 7619


# extract hit count.
res <- dbSendQuery(con, "
                   SELECT cc.dataset_id as dataset_id, c.concept_code as concept_code, 
                   cc.concept_count as concept_count FROM concept_counts cc 
                   INNER JOIN concept c ON c.concept_id = cc.concept_id
                   WHERE c.domain_id = 'diseases' and cc.concept_count >=10 and cc.dataset_id in ('1','2','3') 
                   GROUP BY c.concept_code, cc.dataset_id;
                   ")
mondoCount = dbFetch(res) %>% as_tibble()
dbClearResult(res)

# extract patient count
res = dbSendQuery(con, "SELECT * FROM patient_count WHERE dataset_id in (1,2,3)")
patientCount = dbFetch(res) %>% as_tibble()
dbClearResult(res)


mondoCount %>% pull(concept_code) %>% unique() %>% length() # 2531

hitCountDf = MondoIdForEvalDf %>% left_join(mondoCount) %>% left_join(patientCount)
hitCountDf = hitCountDf %>% replace(is.na(.), 0) %>% as.data.table() 
hitCountDf = hitCountDf %>% 
  mutate(prev = concept_count/count) %>% 
  mutate(prev_bin = cut(prev,breaks = c(0,5e-6,5e-5,5e-4,5e-3,5e-2,5e-1,1),include.lowest = T)) %>%
  group_by(dataset_id,prev_bin) %>% summarise(count_of_concepts = n_distinct(concept_code)) 

fig3a = hitCountDf %>% 
  ggplot(aes(fill=as.factor(dataset_id), y=count_of_concepts, x=prev_bin)) +
  geom_bar(position="dodge", stat="identity") + 
  xlab("Prevelence in the dataset") +
  ylab("Number of rare diseases") + 
  scale_fill_discrete(name="Dataset",
                      breaks=c("1", "2", "3"),
                      labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes"))+ 
  labs(title = "(A)") +
  theme(plot.title = element_text(hjust = 0.5))

# read phenotype.hpoa
# return tables 1
# disease_id, hp_id, freq, onset, evidence

# read MONDO owl
# return tables 2
# mondo_id, disease_id, inheri_mode,

# use ebi api
# example: https://www.ebi.ac.uk/ols/api/ontologies/ordo/terms?iri=http://www.orpha.net/ORDO/Orphanet_2137
# use has_point_prevalence_average_value
# example: "has_point_prevalence_average_value" : [ "42.9", "11.0", "4.0", "16.9", "23.9", "24.5", "10.7", "11.6", "23.5" ],
# use age onset
# example: "has_age_of_onset" : [ "http://www.orpha.net/ORDO/Orphanet_409949", "http://www.orpha.net/ORDO/Orphanet_409948", "http://www.orpha.net/ORDO/Orphanet_409947", "http://www.orpha.net/ORDO/Orphanet_409946" ],
# create a table 3
# obo_id, age, onset, 

# hitCountDf join table 1, 2, 3


