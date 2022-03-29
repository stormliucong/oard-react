# Author: Cong Liu

rm(list=ls())
library(dplyr)
library(data.table)
library(tidyr)
library(DBI)
library(stringr)
# library(ggvenn)
library(httr)
library(jsonlite)

####################################
# load concept pair association
####################################
source("./generate_pairwise_statistics.R") # only get CUIMC/Notes data to save memory.
# concept_pair = get(load(file = "./concept_pair.rda"))

concept_pair_stat = concept_pair[dataset_id == 2,.(concept_id_1,concept_id_2,chisquare,odds_ratio,jaccard_index)]

####################################
# read and process annotation file
####################################
hpo_anno = fread("../../material/phenotype.hpoa")
mondoXref = fread("../../material/mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","DatabaseID")
mondoXref$DatabaseID = mondoXref$DatabaseID %>% str_replace("Orphanet","ORPHA") # Orphanet => ORPHA
pair_anno = merge(hpo_anno,mondoXref,allow.cartesian=TRUE) %>% as.data.table()
pair_anno = pair_anno[Qualifier != "NOT"]
pair_anno[,pair_name := paste0(MONDO_ID,"-",HPO_ID)]

####################################
# map concept id and code
####################################
# Connect to ncats as defined in ~/.my.cnf
# Must use ~/.my.cnf to store t
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")
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
mondo_code = concept[domain_id == 'diseases']
colnames(mondo_code)[1] = 'MONDO_ID'
mondo_code = mondo_code[,.(MONDO_ID,concept_id)]
concept_pair_anno = merge(pair_anno,mondo_code,by = "MONDO_ID")
colnames(concept_pair_anno)[dim(concept_pair_anno)[2]] = 'concept_id_1'
hpo_code = concept[domain_id != 'diseases']
colnames(hpo_code)[1] = 'HPO_ID'
hpo_code = hpo_code[,.(HPO_ID,concept_id)]
concept_pair_anno = merge(concept_pair_anno,hpo_code,by = "HPO_ID")
colnames(concept_pair_anno)[dim(concept_pair_anno)[2]] = 'concept_id_2'

####################################
# generate annotated dist
####################################
concept_pair_full_stat = merge(concept_pair_anno[,.(.N),by=.(concept_id_1,concept_id_2)],concept_pair_stat,by = c("concept_id_1","concept_id_2"),all.x = F,all.y = T)
concept_pair_anno_dist = concept_pair_full_stat[!is.na(N)]
concept_pair_anno_dist[,distribution := "annotated"]
concept_pair_nonanno_dist = concept_pair_full_stat[is.na(N) & concept_id_2 %in% unique(concept_pair_anno_dist$concept_id_2) & concept_id_1 < 90000000]
concept_pair_nonanno_dist[,distribution := "not_annotated"]
concept_pair_dist = rbind(concept_pair_anno_dist,concept_pair_nonanno_dist)


##################
# derive confident level
##################
# get backgroud
concept_pair_count_lg_10 = concept_pair_anno_dist[,.(.N),by=concept_id_2][N >= 10]
concept_pair_count_lg_10_anno_dist = merge(concept_pair_count_lg_10[,.(concept_id_2)], concept_pair_anno_dist,all.y = F,all.x = T, by = "concept_id_2")
concept_pair_count_lg_10_anno_dist = melt(concept_pair_count_lg_10_anno_dist,measure.vars = c("chisquare","odds_ratio","jaccard_index"),variable.name = "stat", value.name = "association")
concept_pair_count_lg_10_anno_levels = concept_pair_count_lg_10_anno_dist[,as.list(quantile(association, probs = seq(0.5, 0.9, 0.1))),by=.(concept_id_2,stat)]
concept_pair_count_lg_10_anno_levels = melt(concept_pair_count_lg_10_anno_levels,measure.vars = c("50%","60%","70%","80%","90%"),variable.name = "confidence",value.name = "association_threshold")
concept_pair_count_sm_10 = concept_pair_anno_dist[,.(.N),by=concept_id_2][N < 10]
concept_pair_count_sm_10_anno_dist = merge(concept_pair_count_sm_10[,.(concept_id_2)], concept_pair_anno_dist,all.y = F,all.x = T, by = "concept_id_2")
concept_pair_count_sm_10_anno_dist = melt(concept_pair_count_sm_10_anno_dist,measure.vars = c("chisquare","odds_ratio","jaccard_index"),variable.name = "stat", value.name = "association")
concept_pair_count_sm_10_anno_levels = concept_pair_count_sm_10_anno_dist[,as.list(quantile(association, probs = seq(0.5, 0.9, 0.1))),by=.(concept_id_2,stat)]
concept_pair_count_sm_10_anno_levels = melt(concept_pair_count_sm_10_anno_levels,measure.vars = c("50%","60%","70%","80%","90%"),variable.name = "confidence",value.name = "association_threshold")
concept_pair_count_sm_10_anno_levels = concept_pair_count_sm_10_anno_levels[,.(association_threshold = median(association_threshold)),by=.(stat,confidence)]

concept_pair_nonanno_dist = concept_pair_full_stat[is.na(N) & concept_id_1 %in% unique(concept_pair_anno_dist$concept_id_1) & concept_id_2 > 90000000]
concept_pair_nonanno_dist = melt(concept_pair_nonanno_dist,measure.vars = c("chisquare","odds_ratio","jaccard_index"),variable.name = "stat", value.name = "association")
concept_pair_count_lg_10_merge = merge(concept_pair_nonanno_dist,concept_pair_count_lg_10_anno_levels,by = c("concept_id_2","stat"),all.x = F,all.y = F,allow.cartesian=TRUE)
concept_pair_count_sm_10_merge = merge(concept_pair_nonanno_dist[!concept_id_2 %in% unique(concept_pair_count_lg_10_anno_levels$concept_id_2)],concept_pair_count_sm_10_anno_levels,by = c("stat"),all.x = F,all.y = F,allow.cartesian=TRUE)
concept_pair_count_merge = rbind(concept_pair_count_lg_10_merge,concept_pair_count_sm_10_merge)
concept_pair_count_merge = concept_pair_count_merge[,.(confidence_count = sum(association > association_threshold )),by=.(confidence,concept_id_2,concept_id_1)]
concept_pair_count_confidence = concept_pair_count_merge[,.(count = .N),by=.(confidence,confidence_count)]
confidence_nonannootated_dt = dcast(concept_pair_count_confidence, confidence ~ confidence_count, value.var = c("count"))


# sample
set.seed(1)
concept_pair_count_merge_sample = concept_pair_count_merge[confidence_count > 0,.SD[sample(.N, min(10,.N))],by = .(confidence_count,confidence)]
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")
res <- dbSendQuery(con, "
SELECT 
c.concept_name,
c.concept_id
FROM concept c
")
concept_name = dbFetch(res) %>% as.data.table()
dbClearResult(res)
colnames(concept_name) = c("concept_name_1","concept_id_1")
concept_pair_count_merge_sample = merge(concept_pair_count_merge_sample,concept_name,all.y = F,by='concept_id_1')
colnames(concept_name) = c("concept_name_2","concept_id_2")
concept_pair_count_merge_sample = merge(concept_pair_count_merge_sample,concept_name,all.y = F,by='concept_id_2')

concept_pair_count_merge_sample %>% fwrite(file = "./novel_identified_DPA_sample_200_seed_1.csv")


# DMD
concept_pair_count_merge_example = concept_pair_count_merge[concept_id_1 == 80010679]
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")
res <- dbSendQuery(con, "
                   SELECT 
                   c.concept_name,
                   c.concept_id
                   FROM concept c
                   ")
concept_name = dbFetch(res) %>% as.data.table()
dbClearResult(res)
colnames(concept_name) = c("concept_name_1","concept_id_1")
concept_pair_count_merge_example = merge(concept_pair_count_merge_example,concept_name,all.y = F,by='concept_id_1')
colnames(concept_name) = c("concept_name_2","concept_id_2")
concept_pair_count_merge_example = merge(concept_pair_count_merge_example,concept_name,all.y = F,by='concept_id_2')

concept_pair_count_merge_example %>% fwrite(file = "./novel_identified_DMD_example.csv")


