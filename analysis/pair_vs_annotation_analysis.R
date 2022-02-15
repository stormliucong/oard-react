# Author: Cong Liu
# Last updated: 02-14-2022

rm(list=ls())
library(data.table)
library(ggplot2)
library(dplyr)
library(tidyr)
library(DBI)
library(stringr)
library(ggvenn)
library(httr)
library(jsonlite)


####################################
# read and process annotation file
####################################
hpo_anno = fread("./phenotype.hpoa")
mondoXref = fread("./mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","DatabaseID")
mondoXref$DatabaseID = mondoXref$DatabaseID %>% str_replace("Orphanet","ORPHA") # Orphanet => ORPHA
pair_anno = hpo_anno %>% inner_join(mondoXref) %>% as.data.table()
pair_anno = pair_anno %>% filter(Qualifier != "NOT")
pair_anno = pair_anno %>% mutate(pair_name = paste0(MONDO_ID,"-",HPO_ID))


# Connect to my-db as defined in /.ncats.cnf
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")

####################################
# Figure 4a Venn Diagram for overlap
####################################

# extract pair count.
res <- dbSendQuery(con, "
                   SELECT cpc.dataset_id as dataset_id, 
                   c1.concept_code as MONDO_ID,    
                   c2.concept_code as HPO_ID, 
                   cpc.concept_count as pair_count FROM concept_pair_counts cpc 
                   INNER JOIN concept c1 ON c1.concept_id = cpc.concept_id_1
                   INNER JOIN concept c2 ON c2.concept_id = cpc.concept_id_2
                   WHERE c1.domain_id = 'diseases' and c2.domain_id = 'phenotypes' 
                   and cpc.dataset_id in ('1','2','3') 
                   ")
pairCount = dbFetch(res) %>% as.data.table()
dbClearResult(res)


# extract single count.
res <- dbSendQuery(con, "
                   SELECT cc.dataset_id as dataset_id, c.concept_code as concept_code, 
                   cc.concept_count as concept_count FROM concept_counts cc 
                   INNER JOIN concept c ON c.concept_id = cc.concept_id 
                   WHERE cc.dataset_id in ('1','2','3') ;
                   ")
singleCount = dbFetch(res) %>% as.data.table()
dbClearResult(res)
pairCount = pairCount %>% mutate(pair_name = paste0(MONDO_ID,"-",HPO_ID))
pair_dt1 = pairCount %>% filter(dataset_id == 1)
pair_dt2 = pairCount %>% filter(dataset_id == 2)

vennListA = list(
  `HPO annotation` = pair_anno$pair_name,
  `CUIMC/Notes` = pair_dt2$pair_name
)

fig4a = ggvenn(vennListA,
       fill_color = c("#0073C2FF", "#EFC000FF", "#868686FF", "#CD534CFF"),
       stroke_size = 0.5, set_name_size = 4)

####################################
# Figure 4b Venn Diagram for overlap 
# including < 10 concept
####################################
raw_concept_pair = fread("../../material/concept_pair/concept_pair.csv")
raw_concept_pair_2 = raw_concept_pair %>% filter(dataset_id == 2)
# extract concept hp mondo mapping
res <- dbSendQuery(con, "
                   SELECT 
                   c.concept_code as concept_code,    
                   c.concept_id as concept_id,
                   c.domain_id
                   FROM concept c
                   ")
concept = dbFetch(res) %>% as.data.table()
dbClearResult(res)
pairRawCount = raw_concept_pair_2 %>% 
  left_join(concept,by = c("concept_id_1"="concept_id")) %>%
  filter(domain_id == 'diseases') %>%
  mutate(MONDO_ID = concept_code) %>% 
  select(MONDO_ID,concept_pair_count,concept_id_2) %>%
  left_join(concept,by = c("concept_id_2"= "concept_id")) %>%
  filter(domain_id == 'phenotypes') %>%
  mutate(HPO_ID = concept_code) %>% 
  select(MONDO_ID,HPO_ID, concept_pair_count)

pairRawCount = pairRawCount %>% mutate(pair_name = paste0(MONDO_ID,"-",HPO_ID))
vennListB = list(
  `HPO annotation` = pair_anno$pair_name,
  `CUIMC/Notes` = pairRawCount$pair_name
)
fig4b = ggvenn(vennListB,
               fill_color = c("#0073C2FF", "#EFC000FF", "#868686FF", "#CD534CFF"),
               stroke_size = 0.5, set_name_size = 4)

####################################
# Figure 4c Venn Diagram for overlap 
# including < 10 concept + hierachical match
####################################

raw_concept_pair = fread("../../material/concept_pair/concept_pair.csv")
raw_concept_pair_299 = raw_concept_pair %>% filter(dataset_id == 299)
# extract concept hp mondo mapping
res <- dbSendQuery(con, "
                   SELECT 
                   c.concept_code as concept_code,    
                   c.concept_id as concept_id,
                   c.domain_id
                   FROM concept c
                   ")
concept = dbFetch(res) %>% as.data.table()
dbClearResult(res)
pairRawHierCount = raw_concept_pair_299 %>% 
  left_join(concept,by = c("concept_id_1"="concept_id")) %>%
  filter(domain_id == 'diseases') %>%
  mutate(MONDO_ID = concept_code) %>% 
  select(MONDO_ID,concept_pair_count,concept_id_2) %>%
  left_join(concept,by = c("concept_id_2"= "concept_id")) %>%
  filter(domain_id == 'phenotypes') %>%
  mutate(HPO_ID = concept_code) %>% 
  select(MONDO_ID,HPO_ID, concept_pair_count)

pairRawHierCount = pairRawHierCount %>% mutate(pair_name = paste0(MONDO_ID,"-",HPO_ID))
vennListC = list(
  `HPO annotation` = pair_anno$pair_name,
  `CUIMC/Notes` = pairRawHierCount$pair_name
)
fig4c = ggvenn(vennListC,
               fill_color = c("#0073C2FF", "#EFC000FF", "#868686FF", "#CD534CFF"),
               stroke_size = 0.5, set_name_size = 4)

####################################
# Figure 4d Venn Diagram for overlap 
# with > 10 single concept count only
####################################

pair_anno_hpo_const = pair_anno %>% inner_join(singleCount %>% select("concept_code"),by = c("MONDO_ID"="concept_code"))
pair_anno_mondo_const = pair_anno %>% inner_join(singleCount %>% select("concept_code"),by = c("HPO_ID"="concept_code"))

vennListD = list(
  `HPO annotation` = intersect(pair_anno_hpo_const$pair_name,pair_anno_mondo_const$pair_name),
  `CUIMC/Notes` = pairRawHierCount$pair_name
)
fig4d = ggvenn(vennListD,
            fill_color = c("#0073C2FF", "#EFC000FF", "#868686FF", "#CD534CFF"),
            stroke_size = 0.5, set_name_size = 4)


require(gridExtra)
lay <- rbind(c(1,1,2,2),
             c(3,3,4,4))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
fig4a = fig4a + labs(title = "(A) OARD count") + theme(plot.title = element_text(hjust = 0.5))  
fig4b = fig4b + labs(title = "(B) Raw OARD")+ theme(plot.title = element_text(hjust = 0.5)) 
fig4c = fig4c + labs(title = "(C) Raw hierachical OARD" )+ theme(plot.title = element_text(hjust = 0.5)) 
fig4d = fig4d + labs(title = "(D) Raw hierachical OARD + single count > 10")+ theme(plot.title = element_text(hjust = 0.5)) 
grid.arrange(fig4a, fig4b, fig4c,fig4d,layout_matrix = lay)










