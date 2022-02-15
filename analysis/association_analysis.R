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

# extract single count

