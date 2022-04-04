library(httr)
library(jsonlite)
library(data.table)

q = "Duchenne muscular dystrophy"
url = "https://rare.cohd.io/api/vocabulary/findConceptByName"
res = GET(url, query = list(q = q, domain_id = "diseases"))
concept_id = fromJSON(rawToChar(res$content))$results$concept_id

i =2
url = "https://rare.cohd.io/api/association/obsExpRatio"
res = GET(url, query = list(concept_id_1 = concept_id, dataset_id = i, domain_id = "phenotypes", top_n = 9999))
topHpo = fromJSON(rawToChar(res$content))$results[,c(1,3,6)]
dim(topHpo)
topHpoDMD = as.data.table(topHpo)
topHpoDMD[, disease:= q]

q = "juvenile dermatomyositis"
url = "https://rare.cohd.io/api/vocabulary/findConceptByName"
res = GET(url, query = list(q = q, domain_id = "diseases"))
concept_id = fromJSON(rawToChar(res$content))$results$concept_id
url = "https://rare.cohd.io/api/association/obsExpRatio"
res = GET(url, query = list(concept_id_1 = concept_id, dataset_id = i, domain_id = "phenotypes", top_n = 9999))
topHpo = fromJSON(rawToChar(res$content))$results[,c(1,3,6)]
dim(topHpo)
topHpoJDM = as.data.table(topHpo)
topHpoJDM[, disease:= q]

rbind(topHpoDMD,topHpoJDM) %>% fwrite(file="topHPO_DMD_JDM.csv")

# load wkc reviewed results.

dmd_reviewed = fread("./dmd_wkc_reviewed.csv")
colnames(dmd_reviewed) = c("hp_id","hp_name","ln_ratio","clinical","is_dmd","is_jdm")
dmd_reviewed[is_dmd & ln_ratio > 5 & clinical == 1]
dmd_reviewed[is_dmd & ln_ratio > 5]


library(ggplot2)
library(dplyr)

# plot figure 7a
dmd_reviewed_summary = dmd_reviewed[is_dmd==TRUE] %>% 
  mutate(ln_ratio_category_0 = ln_ratio > 0) %>% 
  mutate(ln_ratio_category_1 = ln_ratio > 1) %>% 
  mutate(ln_ratio_category_2 = ln_ratio > 2) %>% 
  mutate(ln_ratio_category_3 = ln_ratio > 3) %>% 
  mutate(ln_ratio_category_4 = ln_ratio > 4) %>% 
  mutate(ln_ratio_category_5 = ln_ratio > 5) %>% 
  mutate(ln_ratio_category_6 = ln_ratio > 6)
  
dmd_reviewed_precision =
  dmd_reviewed_summary %>% group_by(ln_ratio_category_0) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_0) %>% mutate(`log OR >` = 0) %>% select(`log OR >`,precision) %>% 
  rbind(
    dmd_reviewed_summary %>% group_by(ln_ratio_category_1) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_1) %>% mutate(`log OR >` = 1) %>% select(`log OR >`,precision)
  ) %>%
  rbind(
    dmd_reviewed_summary %>% group_by(ln_ratio_category_2) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_2) %>% mutate(`log OR >` = 2) %>% select(`log OR >`,precision)
  ) %>%
  rbind(
    dmd_reviewed_summary %>% group_by(ln_ratio_category_3) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_3) %>% mutate(`log OR >` = 3) %>% select(`log OR >`,precision)
  ) %>%
  rbind(
    dmd_reviewed_summary %>% group_by(ln_ratio_category_4) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_4) %>% mutate(`log OR >` = 4) %>% select(`log OR >`,precision)
  ) %>%
  rbind(
    dmd_reviewed_summary %>% group_by(ln_ratio_category_5) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% filter(ln_ratio_category_5) %>% mutate(`log OR >` = 5) %>% select(`log OR >`,precision)
  )

fig1 = dmd_reviewed_precision %>% ggplot(aes(x = as.factor(`log OR >`), y = precision)) + geom_bar(stat = "identity") + ylim(c(0,1)) + xlab("log OR >")



# plot figure 7b
dmd_reviewed
# library(VennDiagram)
library(ggvenn)
set1 = dmd_reviewed[is_dmd == TRUE] %>% pull(hp_id)
set2 = dmd_reviewed[is_jdm == TRUE] %>% pull(hp_id)
x = list(`DMD` = set1, `JDM` = set2)
fig2 = ggvenn(
  x
)

# plot figure 7c
dmd_jdm_summary = 
  dmd_reviewed[is_dmd==TRUE & is_jdm ==FALSE] %>% group_by(is_dmd) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% mutate(category = 'DMD only') %>% select(category,precision) %>%
  rbind(
    dmd_reviewed[is_dmd==TRUE & is_jdm ==TRUE] %>% group_by(is_dmd) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% mutate(category = 'DMD and JDM') %>% select(category,precision)
  ) %>% 
  rbind(
    dmd_reviewed[is_dmd==FALSE & is_jdm ==TRUE] %>% group_by(is_dmd) %>% summarise(precision = sum(clinical)/length(ln_ratio)) %>% mutate(category = 'JDM only') %>% select(category,precision)
  )
fig3 = dmd_jdm_summary %>% ggplot(aes(x = category, y = precision)) + geom_bar(stat = "identity") + ylim(c(0,1)) + xlab("category")

# grid
require(gridExtra)
lay <- rbind(c(1,1,1),c(2,2,3))
fig1 = fig1 + labs(title = "(A)") + theme(plot.title = element_text(hjust = 0.5))  
fig2 = fig2 + labs(title = "(B)")+ theme(plot.title = element_text(hjust = 0.5)) 
fig3 = fig3 + labs(title = "(C)" )+ theme(plot.title = element_text(hjust = 0.5)) 
grid.arrange(fig1, fig2, fig3,layout_matrix = lay)


  