# Author: Cong Liu

rm(list=ls())
library(data.table)

patient_count = fread("../../material/patient_count/patient_count.csv")
patient_count = patient_count[dataset_id == 2]
concept_pair = fread("../../material/concept_pair/concept_pair.csv")
concept_pair = concept_pair[dataset_id == 2]
concept_count = fread("../../material/concept_count/concept_count.csv")
concept_count = concept_count[dataset_id == 2]
colnames(concept_count)[2:3] = c("concept_id_1","concept_count_1")
concept_pair = merge(concept_pair,concept_count,by = c("dataset_id","concept_id_1"))
colnames(concept_count)[2:3] = c("concept_id_2","concept_count_2")
concept_pair = merge(concept_pair,concept_count,by = c("dataset_id","concept_id_2"))
concept_pair = merge(concept_pair,patient_count,by = c("dataset_id"))
concept_pair[,concept_count_1 := as.numeric(concept_count_1)]
concept_pair[,concept_count_2 := as.numeric(concept_count_2)]
concept_pair[,concept_pair_count := as.numeric(concept_pair_count)]
concept_pair[,count := as.numeric(patient_count)]
concept_pair[,patient_count:=NULL]
concept_pair[, e1 := concept_count_1 * concept_count_2/count]
concept_pair[, e2 := (count - concept_count_2) * concept_count_1 /count]
concept_pair[, e3 := (count - concept_count_1) * concept_count_2 /count]
concept_pair[, e4 := (count - concept_count_1) * (count - concept_count_2) /count]
# Error: vector memory exhausted (limit reached?)
# Save R_MAX_VSIZE = __GB as the first line of .Renviron using an appropriate number of GB
concept_pair[, o1 := concept_pair_count]
concept_pair[, o2 := concept_count_1 - concept_pair_count]
concept_pair[, o3 := concept_count_2 - concept_pair_count]
concept_pair[, o4 := count - concept_count_1 - concept_count_2 + concept_pair_count]
concept_pair[, chisquare := (o1-e1)^2/e1 + (o2-e2)^2/e2 + (o3-e3)^2/e3 + (o4-e4)^2/e4]
concept_pair[, odds_ratio := log(concept_pair_count/e1)]
concept_pair[, jaccard_index := concept_pair_count /(concept_count_1 + concept_count_2 - concept_pair_count)]
# about 5 mins
# save(concept_pair, file = "./concept_pair.rda")
# 
# concept_pair = get(load(file = "./concept_pair.rda"))
# 
# concept_pair %>% sample_n(10)
