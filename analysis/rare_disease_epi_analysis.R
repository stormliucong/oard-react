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

########################################
# figure 3a
########################################
overallHitCountDf = hitCountDf %>% 
  mutate(prev = concept_count/count) %>% 
  mutate(prev_bin = cut(prev,breaks = c(0,5e-6,5e-5,5e-4,1),include.lowest = T)) %>%
  group_by(dataset_id,prev_bin) %>% summarise(count_of_concepts = n_distinct(concept_code)) 

fig3a = overallHitCountDf %>% 
  ggplot(aes(fill=as.factor(prev_bin), y=count_of_concepts, x=as.factor(dataset_id))) +
  geom_bar(position="dodge", stat="identity") + 
  xlab("Dataset") +
  ylab("Number of rare diseases") + 
  scale_x_discrete(name="Dataset",
                      breaks=c("1", "2", "3"),
                      labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes"))+ 
  scale_fill_discrete(name="EHR Prevalence",
                   breaks=c("[0,5e-06]", "(5e-06,5e-05]", "(5e-05,0.0005]","(0.0005,1]"),
                   labels=c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")) + 
  coord_flip() +
  labs(title = "(A)") +
  theme(plot.title = element_text(hjust = 0.5)) +
  theme(legend.position="top") 

########################################
# figure 3b
########################################
prev = fread("./orpha_prev.csv")
mondoXref = fread("./mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","class_id")
colnames(hitCountDf)[1] = c("MONDO_ID")
prevHitCount = hitCountDf %>% inner_join(mondoXref) %>% inner_join(prev) %>%
  mutate(prev = concept_count/count) %>% 
  mutate(prev_bin = cut(prev,breaks = c(0,5e-6,5e-5,5e-4,1),include.lowest = T)) %>%
  group_by(dataset_id,prev_bin,annotation_class) %>% 
  summarise(count_of_concepts = n_distinct(MONDO_ID)) %>% as_tibble() %>%
  mutate(dataset_id = as.factor(dataset_id))
levels(prevHitCount$prev_bin) = c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")
levels(prevHitCount$dataset_id) = c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")
prevHitCount = prevHitCount %>% mutate(annotation_class = replace(annotation_class, annotation_class == "6-9 / 10 000", "1-9 / 10 000"))
prevHitCount = prevHitCount %>% mutate(annotation_class = replace(annotation_class, annotation_class == "1-5 / 10 000", "1-9 / 10 000"))
prevHitCount = prevHitCount %>% filter(!annotation_class %in% c("Unknown_epidemiological_range",">1 / 1000"))
prevHitCount = prevHitCount %>% mutate(annotation_class = as.factor(annotation_class))
prevHitCount$annotation_class = factor(prevHitCount$annotation_class, levels = 
                                         c("<1 / 1 000 000", "1-9 / 1 000 000","1-9 / 100 000","1-9 / 10 000"))

fig3b = prevHitCount %>% 
  ggplot(aes(fill=as.factor(prev_bin), y=count_of_concepts, x=as.factor(annotation_class))) +
  geom_bar(position="fill", stat="identity") + 
  xlab("Point prevalence range in OAPHANET ") +
  ylab("Number of rare diseases") + 
  coord_flip() + facet_wrap(~dataset_id) +
  scale_fill_discrete(name="EHR Prevalence",
                      breaks=c("[0,5e-06]", "(5e-06,5e-05]", "(5e-05,0.0005]","(0.0005,1]"),
                      labels=c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")) + 
  labs(title = "(C)") +
  theme(plot.title = element_text(hjust = 0.5))

########################################
# figure 3c
########################################
inheritance = fread("./orpha_inheritance.csv")
mondoXref = fread("./mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","class_id")
colnames(hitCountDf)[1] = c("MONDO_ID")
inherHitCount = hitCountDf %>% inner_join(mondoXref) %>% inner_join(inheritance) %>%
  mutate(prev = concept_count/count) %>% 
  mutate(prev_bin = cut(prev,breaks = c(0,5e-6,5e-5,5e-4,1),include.lowest = T)) %>%
  group_by(dataset_id,prev_bin,annotation_class) %>% 
  summarise(count_of_concepts = n_distinct(MONDO_ID)) %>% as_tibble() %>%
  mutate(dataset_id = as.factor(dataset_id)) %>%
  mutate(annotation_class = as.factor(annotation_class))
levels(inherHitCount$prev_bin) = c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")
levels(inherHitCount$dataset_id) = c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")
levels(inherHitCount$annotation_class)
inherHitCount = inherHitCount %>% filter(!annotation_class %in% c("Y-linked","oligogenic","semi-dominant","no inheritance data available","unknown inheritance"))
# 
# inherHitCount$annotation_class = factor(inherHitCount$annotation_class, levels = c(
#   "antenatal","neonatal","infancy","childhood","adolescent","adult","elderly","all ages","no age of onset data available"
# ))
# levels(onsetHitCount$annotation_class)[9] = "no available"

fig3c = inherHitCount %>% 
  ggplot(aes(fill=as.factor(prev_bin), y=count_of_concepts, x=as.factor(annotation_class))) +
  geom_bar(position="fill", stat="identity") + 
  xlab("Inheritance mode in OAPHANET ") +
  ylab("Number of rare diseases") + 
  coord_flip() + facet_wrap(~dataset_id) +
  scale_fill_discrete(name="EHR Prevalence",
                      breaks=c("[0,5e-06]", "(5e-06,5e-05]", "(5e-05,0.0005]","(0.0005,1]"),
                      labels=c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")) + 
  labs(title = "(C)") +
  theme(plot.title = element_text(hjust = 0.5))

########################################
# figure 3d
########################################
onset = fread("./orpha_onset.csv")
mondoXref = fread("./mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","class_id")
colnames(hitCountDf)[1] = c("MONDO_ID")
onsetHitCount = hitCountDf %>% inner_join(mondoXref) %>% inner_join(onset) %>%
  mutate(prev = concept_count/count) %>% 
  mutate(prev_bin = cut(prev,breaks = c(0,5e-6,5e-5,5e-4,1),include.lowest = T)) %>%
  group_by(dataset_id,prev_bin,annotation_class) %>% 
  summarise(count_of_concepts = n_distinct(MONDO_ID)) %>% as_tibble() %>%
  mutate(dataset_id = as.factor(dataset_id)) %>%
  mutate(annotation_class = as.factor(annotation_class))
levels(onsetHitCount$prev_bin) = c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")
levels(onsetHitCount$dataset_id) = c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")
onsetHitCount$annotation_class = factor(onsetHitCount$annotation_class, levels = c(
  "antenatal","neonatal","infancy","childhood","adolescent","adult","elderly","all ages","no age of onset data available"
))
levels(onsetHitCount$annotation_class)[9] = "no available"

fig3d = onsetHitCount %>% 
  ggplot(aes(fill=as.factor(prev_bin), y=count_of_concepts, x=as.factor(annotation_class))) +
  geom_bar(position="fill", stat="identity") + 
  xlab("Onset age in OAPHANET ") +
  ylab("Number of rare diseases") + 
  coord_flip() + facet_wrap(~dataset_id) +
  scale_fill_discrete(name="EHR Prevalence",
                      breaks=c("[0,5e-06]", "(5e-06,5e-05]", "(5e-05,0.0005]","(0.0005,1]"),
                      labels=c("< 1/200,000", "< 1/20,000", "< 1/2,000", "> 1/2,000")) + 
  labs(title = "(D)") +
  theme(plot.title = element_text(hjust = 0.5))

require(gridExtra)
lay <- rbind(c(1,1,2,2),
             c(3,3,4,4))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
grid.arrange(fig3a, fig3b, fig3c, fig3d,layout_matrix = lay)