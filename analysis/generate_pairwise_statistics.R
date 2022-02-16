# Author: Cong Liu

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

patient_count = fread("../../material/patient_count/patient_count.csv")
concept_pair = fread("../../material/concept_pair/concept_pair.csv")
concept_count = fread("../../material/concept_count/concept_count.csv")
colnames(concept_count)[2:3] = c("concept_id_1","concept_count_1")
concept_pair = merge(concept_pair,concept_count,by = c("dataset_id","concept_id_1"))
colnames(concept_count)[2:3] = c("concept_id_2","concept_count_2")
concept_pair = merge(concept_pair,concept_count,by = c("dataset_id","concept_id_2"))
concept_pair = merge(concept_pair,patient_count,by = c("dataset_id"))
concept_pair[, e1 := (as.numeric(concept_count_1) * concept_count_2)/count]
concept_pair[, e2 := count - as.numeric(concept_count_1)* concept_count_2/count]
concept_pair[, e3 := as.numeric(concept_count_2) * (count - concept_count_2)/count]
concept_pair[, e4 := (as.numeric(count) - concept_count_2) * (count - concept_count_2)/count]
concept_pair[, o1 := concept_pair_count]
concept_pair[, o2 := concept_count_1 - concept_pair_count]
concept_pair[, o3 := concept_count_2 - concept_pair_count]
concept_pair[, o4 := count - concept_count_1 - concept_count_2 + concept_pair_count]
concept_pair[, chisquare := (o1-e1)^2/e1 + (o2-e2)^2/e2 + (o3-e3)^2/e3 + (o4-e4)^2/e4]
concept_pair[, odds_ratio := log(concept_pair_count/e1)]
concept_pair[, jaccard_index := concept_pair_count /(concept_count_1 + concept_count_2 - concept_pair_count)]

save(concept_pair, file = "./concept_pair.rda")


