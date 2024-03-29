# Author: Cong Liu

rm(list=ls())
library(data.table)
library(ggplot2)
library(dplyr)
library(tidyr)
library(DBI)
library(stringr)
# library(ggvenn)
library(httr)
library(jsonlite)

####################################
# load concept pair association
####################################
source("./generate_pairwise_statistics.R")
# concept_pair = get(load(file = "./concept_pair.rda"))

concept_pair_stat = concept_pair[dataset_id == 2,.(concept_id_1,concept_id_2,chisquare,odds_ratio,jaccard_index)]

####################################
# read and process annotation file
####################################
hpo_anno = fread("./phenotype.hpoa")
hpo_anno = hpo_anno[Qualifier != "NOT"]
hpo_anno[, Source:= 'Curated in database']
pub_anno = fread("./pubcasefinder_dpa.csv")
pub_anno$disease_id = pub_anno$disease_id %>% str_replace("Orphanet","ORPHA") # Orphanet => ORPHA
colnames(pub_anno) = c('DatabaseID','HPO_ID')
pub_anno[, Source:= 'Identified in literature']
pair_anno = rbind(hpo_anno,pub_anno,fill = TRUE) %>% as.data.table()
mondoXref = fread("./mondo_xref.csv")
colnames(mondoXref) = c("MONDO_ID","DatabaseID")
mondoXref$DatabaseID = mondoXref$DatabaseID %>% str_replace("Orphanet","ORPHA") # Orphanet => ORPHA
pair_anno = merge(pair_anno,mondoXref,by = 'DatabaseID',all = F,allow.cartesian=T)
pair_anno[,pair_name := paste0(MONDO_ID,"-",HPO_ID)]


####################################
# map concept id and code
####################################
# Connect to my-db as defined in /.ncats.cnf
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
concept_pair_full_stat = merge(concept_pair_anno[,.(.N),by=.(concept_id_1,concept_id_2,Source)],concept_pair_stat,by = c("concept_id_1","concept_id_2"),all.x = F,all.y = T)
concept_pair_anno_dist = concept_pair_full_stat[!is.na(Source)]
concept_pair_anno_dist[,distribution := Source]
concept_pair_nonanno_dist = concept_pair_full_stat[is.na(Source) & concept_id_2 %in% unique(concept_pair_anno_dist$concept_id_2) & concept_id_1 < 90000000]
concept_pair_nonanno_dist[,distribution := "No prior annotations"]
concept_pair_dist = rbind(concept_pair_anno_dist,concept_pair_nonanno_dist)

##################
# fig 6a overall median boxplot
##################
dist6a = concept_pair_dist %>% 
  group_by(concept_id_2,distribution) %>%
  summarise(chisquare_m = median(chisquare),odds_ratio_m = median(odds_ratio),jaccard_index_m = median(jaccard_index) ) %>%
  mutate(chisquare_m = log(chisquare_m),jaccard_index_m = log(jaccard_index_m)) %>%
  gather(key = 'stat',value = value,chisquare_m,odds_ratio_m,jaccard_index_m) %>%
  mutate(stat = as.factor(stat)) %>% 
  mutate(distribution = as.factor(distribution))
levels(dist6a$stat) = c("Chi-squared (log)", "Jaccard index (log)", " Odds ratio (log)")

figa = dist6a %>%
  ggplot(aes(y = value,x = distribution,color = distribution)) + 
  geom_boxplot() + 
  facet_wrap(~stat, scales = "free") +
  labs(title = "(A)") +
  ylab("") + 
  xlab("") + 
  scale_color_viridis_d() +
  labs(color='Annotation status') +
  theme(plot.title = element_text(hjust = 0.5), legend.position = "right",axis.text.x = element_blank())

##################
# fig 6b p-value rank
##################
concept_pair_full_stat = merge(concept_pair_anno[Source=='Curated in database' | Source=='Identified in literature'][,.(.N),by=.(concept_id_1,concept_id_2)],concept_pair_stat,by = c("concept_id_1","concept_id_2"),all.x = F,all.y = T)
concept_pair_anno_dist = concept_pair_full_stat[!is.na(N)]
concept_pair_anno_dist[,distribution := "annotated"]
concept_pair_nonanno_dist = concept_pair_full_stat[is.na(N) & concept_id_2 %in% unique(concept_pair_anno_dist$concept_id_2) & concept_id_1 < 90000000]
concept_pair_nonanno_dist[,distribution := "not_annotated"]
concept_pair_dist = rbind(concept_pair_anno_dist,concept_pair_nonanno_dist)

wilcox_chisquare = concept_pair_dist[,if (.N > 100L) .(p = wilcox.test(chisquare ~ distribution,
                                                                       exact = FALSE,alternative = "greater")$p.value),by = concept_id_2]
wilcox_odds_ratio = concept_pair_dist[,if (.N > 100L) .(p = wilcox.test(odds_ratio ~ distribution,
                                                                        exact = FALSE,alternative = "greater")$p.value),by = concept_id_2]
wilcox_jaccard_index = concept_pair_dist[,if (.N > 100L) .(p = wilcox.test(jaccard_index ~ distribution,
                                                                           exact = FALSE,alternative = "greater")$p.value),by = concept_id_2]

wilcox_chisquare[,stat := "Chi-squared"]
wilcox_odds_ratio[,stat := "Odds ratio"]
wilcox_jaccard_index[,stat := "Jaccard index"]
wilcox_p = rbind(wilcox_chisquare,wilcox_odds_ratio,wilcox_jaccard_index)
figb = wilcox_p %>% 
  ggplot(aes(x = "", y = -log10(p),color = as.factor(stat))) +
  geom_hline(yintercept = -log10(0.05), color = "grey40", linetype = "dashed") + 
  geom_point(alpha = 0.75,position = "jitter") +
  facet_wrap(~stat, scales = "free") + 
  labs(title = "(B)") +
  xlab("") + 
  scale_color_viridis_d() +
  theme(plot.title = element_text(hjust = 0.5), legend.position = "none")

wilcox_p[,.(sum(p < 0.05)/length(p)),by=stat]
##################
# fig 6c delta value by Evidence
##################

dist6b = merge(concept_pair_dist,concept_pair_anno[Source=='Curated in database' | Source=='Identified in literature'][,.(concept_id_1,concept_id_2,Evidence)],all.x = T)
dist6b_annotated = dist6b[!is.na(Evidence)]
dist6b_annotated = dist6b_annotated %>% group_by(concept_id_2,Evidence) %>%
  summarise(chisquare_m = median(log(chisquare)),odds_ratio_m = median(odds_ratio),jaccard_index_m = median(log(jaccard_index)) ) %>%
  as.data.table()
dist6b_notannotated = dist6b[is.na(Evidence)]
dist6b_notannotated = dist6b_notannotated %>% group_by(concept_id_2) %>%
  summarise(chisquare_m_n = median(log(chisquare)),odds_ratio_m_n = median(odds_ratio),jaccard_index_m_n = median(log(jaccard_index)) ) %>%
  as.data.table()
dist6b = merge(dist6b_annotated, dist6b_notannotated, by=c('concept_id_2'))
dist6b[,chisquare_d := chisquare_m - chisquare_m_n]
dist6b[,odds_ratio_d := odds_ratio_m - odds_ratio_m_n]
dist6b[,jaccard_index_d := jaccard_index_m - jaccard_index_m_n]

dist6b = dist6b %>% 
  gather(key = 'stat',value = value,chisquare_d,odds_ratio_d,jaccard_index_d) %>%
  select(concept_id_2,Evidence,stat,value) %>%
  mutate(stat = as.factor(stat))
levels(dist6b$stat) = c("Chi-squared (log)", "Jaccard index (log)", " Odds ratio (log)")
# IEA (inferred from electronic annotation)
# PCS published clinical study
# TAS “traceable author statement”,
figc = dist6b %>%
  ggplot(aes(y = value,color = Evidence, x= "")) + 
  geom_boxplot() + 
  ylab("Delta") + 
  facet_wrap(~stat, scales = "free") + 
  labs(title = "(C)") +
  xlab("") + 
  scale_color_viridis_d() +
  theme(plot.title = element_text(hjust = 0.5), legend.position = "right")

##################
# fig 6d delta value by Frequency
##################


dist6c = merge(concept_pair_dist,concept_pair_anno[Source=='Curated in database' | Source=='Identified in literature'][,.(concept_id_1,concept_id_2,Frequency)],all.x = T)
dist6c_annotated = dist6c[Frequency %in% c("HP:0040284", "HP:0040282", "HP:0040281", "HP:0040283")]
dist6c_annotated = dist6c_annotated %>% group_by(concept_id_2,Frequency) %>%
  summarise(chisquare_m = median(log(chisquare)),odds_ratio_m = median(odds_ratio),jaccard_index_m = median(log(jaccard_index)) ) %>%
  as.data.table()
dist6c_notannotated = dist6c[is.na(Frequency)]
dist6c_notannotated = dist6c_notannotated %>% group_by(concept_id_2) %>%
  summarise(chisquare_m_n = median(log(chisquare)),odds_ratio_m_n = median(odds_ratio),jaccard_index_m_n = median(log(jaccard_index)) ) %>%
  as.data.table()
dist6c = merge(dist6c_annotated, dist6c_notannotated, by=c('concept_id_2'))
dist6c[,chisquare_d := chisquare_m - chisquare_m_n]
dist6c[,odds_ratio_d := odds_ratio_m - odds_ratio_m_n]
dist6c[,jaccard_index_d := jaccard_index_m - jaccard_index_m_n]

dist6c = dist6c %>% 
  gather(key = 'stat',value = value,chisquare_d,odds_ratio_d,jaccard_index_d) %>%
  select(concept_id_2,Frequency,stat,value) %>%
  mutate(stat = as.factor(stat)) %>%
  mutate(Frequency = as.factor(Frequency))
levels(dist6c$stat) = c("Chi-squared (log)", "Jaccard index (log)", " Odds ratio (log)")
levels(dist6c$Frequency) = c("Very frequent","Frequent","Occasional","Very rare")
figd = dist6c %>%
  ggplot(aes(y = value,color = Frequency, x= "")) + 
  geom_boxplot() + 
  ylab("Delta") + 
  facet_wrap(~stat, scales = "free") + 
  labs(title = "(D)") +
  xlab("") + 
  scale_color_viridis_d() +
  theme(plot.title = element_text(hjust = 0.5), legend.position = "right")


require(gridExtra)
lay <- rbind(c(1,1,2,2),
             c(3,3,4,4))
grid.arrange(figa, figb, figc, figd,layout_matrix = lay)



# rank sum test.
for_rs_test = concept_pair_dist %>% 
  group_by(concept_id_2,distribution) %>%
  summarise(chisquare_m = median(chisquare),odds_ratio_m = median(odds_ratio),jaccard_index_m = median(jaccard_index) ) %>%
  as.data.table() %>% dcast(concept_id_2~distribution,value.var=c("chisquare_m","odds_ratio_m","jaccard_index_m"))
x = for_rs_test[,chisquare_m_annotated]
y = for_rs_test[,chisquare_m_not_annotated]
wilcox.test(x, y, paired = TRUE, alternative = "greater")
x = for_rs_test[,odds_ratio_m_annotated]
y = for_rs_test[,odds_ratio_m_not_annotated]
wilcox.test(x, y, paired = TRUE, alternative = "greater")
x = for_rs_test[,jaccard_index_m_annotated]
y = for_rs_test[,jaccard_index_m_not_annotated]
wilcox.test(x, y, paired = TRUE, alternative = "greater")



