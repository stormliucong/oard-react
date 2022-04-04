# Author: Cong Liu

####################################
# load concept pair association
####################################
source("./generate_pairwise_statistics.R") # only get CUIMC/Notes data to save memory.
# concept_pair = get(load(file = "./concept_pair.rda"))

concept_pair_stat = concept_pair[dataset_id == 2,.(concept_id_1,concept_id_2,chisquare,odds_ratio,jaccard_index)]

library(dplyr)
library(data.table)
library(tidyr)
library(DBI)
library(stringr)
# library(ggvenn)
library(httr)
library(jsonlite)
library(ggplot2)

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
concept_pair_stat = concept_pair_stat[concept_id_1 < 90000000 & concept_id_2 > 90000000] # disease - phenotype pair only.
# generate quantile for concept_id_1.
# use disease specific quantile if observed pair > 10
concept_pair_stat_lg_10 = merge(concept_pair_stat[,.(.N),by=concept_id_1][N >= 10][,.(concept_id_1)], concept_pair_stat,all.y = F,all.x = T, by = "concept_id_1")
concept_pair_stat_lg_10 = melt(concept_pair_stat_lg_10,measure.vars = c("chisquare","odds_ratio","jaccard_index"),variable.name = "stat", value.name = "association")
concept_pair_count_lg_10_anno_levels = concept_pair_stat_lg_10[,as.list(quantile(association, probs = c(0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9))),by=.(concept_id_1,stat)]
concept_pair_count_lg_10_anno_levels = melt(concept_pair_count_lg_10_anno_levels,measure.vars = c("0%","10%","20%","30%","40%","50%","60%","70%","80%","90%"),variable.name = "confidence",value.name = "association_threshold")
concept_pair_stat_lg_10 = merge(concept_pair_stat_lg_10,concept_pair_count_lg_10_anno_levels,by = c("concept_id_1","stat"),all.x = F,all.y = F,allow.cartesian=TRUE)
# use a general quantile if observed pair < 10
# concept_pair_stat_sm_10 = merge(concept_pair_stat[,.(.N),by=concept_id_1][N < 10][,.(concept_id_1)], concept_pair_stat,all.y = F,all.x = T, by = "concept_id_1")
# concept_pair_stat_sm_10 = melt(concept_pair_stat_sm_10,measure.vars = c("chisquare","odds_ratio","jaccard_index"),variable.name = "stat", value.name = "association")
# concept_pair_count_sm_10_anno_levels = concept_pair_stat_sm_10[,as.list(quantile(association, probs = c(0,0.25,0.5,0.75,1))),by=.(stat)]
# concept_pair_count_sm_10_anno_levels = melt(concept_pair_count_sm_10_anno_levels,measure.vars = c("0%","25%","50%","75%","100%"),variable.name = "confidence",value.name = "association_threshold")
# concept_pair_stat_sm_10 = merge(concept_pair_stat_sm_10,concept_pair_count_sm_10_anno_levels,by = c("stat"),all.x = F,all.y = F,allow.cartesian=TRUE)
# generate category
concept_pair_stat_lg_10[,threshold_count := association >= association_threshold]
concept_pair_bin_lg_10 = concept_pair_stat_lg_10[,.(category=sum(threshold_count)),by = .(concept_id_1,concept_id_2,stat)]
# merge
concept_pair_bin_anno_lg_10 = merge(concept_pair_anno[,.(.N),by=.(concept_id_1,concept_id_2)],concept_pair_bin_lg_10,by = c("concept_id_1","concept_id_2"),all.x = F,all.y = T)
concept_pair_bin_anno_lg_10[,annotated := !is.na(N)]
concept_pair_bin_anno_count_lg_10 = concept_pair_bin_anno_lg_10[,.(.N),by=.(category,stat,annotated)]
concept_pair_bin_anno_count_lg_10 = dcast(concept_pair_bin_anno_count_lg_10,category + stat ~ annotated, value.var = "N")
concept_pair_bin_anno_count_lg_10 %>% ggplot(aes(x=as.factor(category),y=`TRUE`,fill=stat)) + geom_bar(stat="identity",position = "dodge")

################################
# sample from each quantile
################################
set.seed(1)
disease_sample_400 = concept_pair_bin_anno_lg_10[annotated==FALSE,.(pairs_count = length(unique(concept_id_2))),by=(concept_id_1)][order(-pairs_count)][pairs_count > 1000][sample(.N,400)]
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
disease_sample_400 = merge(disease_sample_400,concept_name,all.y = F,by='concept_id_1')
disease_sample_100_1 = disease_sample_400[1:100]
disease_sample_100_2 = disease_sample_400[101:200]
disease_sample_100_3 = disease_sample_400[201:300]
disease_sample_100_4 = disease_sample_400[301:400]

# sample disease
disease_sample_100_1 %>% fwrite(file = "./disease_sample_100_1.csv")
disease_sample_100_2 %>% fwrite(file = "./disease_sample_100_2.csv")
disease_sample_100_3 %>% fwrite(file = "./disease_sample_100_3.csv")
disease_sample_100_4 %>% fwrite(file = "./disease_sample_100_4.csv")

# sample pairs by category
colnames(concept_name) = c("concept_name_2","concept_id_2")

disease_concept_pair_sample = merge(concept_pair_bin_anno_lg_10[stat == "odds_ratio"],disease_sample_100_1)[category > 5,.SD[sample(.N, 5)],by = .(concept_id_1,category)]
disease_concept_pair_sample = merge(disease_concept_pair_sample,concept_name,all.y = F,by='concept_id_2')
disease_concept_pair_sample %>% fwrite(file = "./pair_sample_100_1.csv")
disease_concept_pair_sample = merge(concept_pair_bin_anno_lg_10[stat == "odds_ratio"],disease_sample_100_2)[category > 5,.SD[sample(.N, 5)],by = .(concept_id_1,category)]
disease_concept_pair_sample = merge(disease_concept_pair_sample,concept_name,all.y = F,by='concept_id_2')
disease_concept_pair_sample %>% fwrite(file = "./pair_sample_100_2.csv")
disease_concept_pair_sample = merge(concept_pair_bin_anno_lg_10[stat == "odds_ratio"],disease_sample_100_3)[category > 5,.SD[sample(.N, 5)],by = .(concept_id_1,category)]
disease_concept_pair_sample = merge(disease_concept_pair_sample,concept_name,all.y = F,by='concept_id_2')
disease_concept_pair_sample %>% fwrite(file = "./pair_sample_100_3.csv")
disease_concept_pair_sample = merge(concept_pair_bin_anno_lg_10[stat == "odds_ratio"],disease_sample_100_4)[category > 5,.SD[sample(.N, 5)],by = .(concept_id_1,category)]
disease_concept_pair_sample = merge(disease_concept_pair_sample,concept_name,all.y = F,by='concept_id_2')
disease_concept_pair_sample %>% fwrite(file = "./pair_sample_100_4.csv")

# review results.
sampled_review = fread("./sampled_pair_review.csv")
sampled_review = sampled_review %>%  mutate(quantile = case_when(
  category == 6 ~ "50-60%",
  category == 7 ~ "60-70%",
  category == 8 ~ "70-80%",
  category == 9 ~ "80-90%",
  category == 10 ~ "90-100%"
))
# fig 1
fig1 = sampled_review[,.(count=.N),by=.(confidence)] %>% 
  mutate(prop = round(count / sum(count) *100,1)) %>%
  mutate(ypos = cumsum(prop)+ 0.5*prop) %>%
  ggplot(aes(x="", y=count, fill=as.factor(confidence))) +
  geom_bar(stat="identity", width=1) +
  geom_text(aes(label = prop), position = position_stack(vjust = 0.5), color = "white", size=5) +
  scale_fill_viridis_d(name="Confidence level",
                       breaks=c(0,1,2,3),
                       labels=c("definitely wrong", "likely to be correct", "very likely to be correct", "definitely correct")) + 
  coord_polar("y", start=0) + 
  theme_void() # remove background, grid, numeric labels

# fig 2
mean_score_category = sampled_review[,.(mean_confidecne = mean(confidence)),by=quantile]
fig2 = mean_score_category %>% ggplot(aes(x = quantile,y = mean_confidecne)) + geom_bar(stat = "identity") + ylab("Mean clinical confidence")
cor.test(sampled_review$category, sampled_review$confidence, method=c("pearson"))

# fig 3
sampled_review_stat = merge(sampled_review,concept_pair_stat)
fig3 = sampled_review_stat %>% ggplot(aes(x = as.factor(confidence),fill = as.factor(confidence), y = odds_ratio)) + geom_boxplot() +
  ylab("log odds ratio") + 
  xlab("") + theme(axis.text.x = element_blank(), legend.position = "none") + 
  scale_fill_viridis_d(name="Confidence level",
                       breaks=c(0,1,2,3),
                       labels=c("definitely wrong", "likely to be correct", "very likely to be correct", "definitely correct"))

# grid
require(gridExtra)
lay <- rbind(c(1,1,3),c(2,2,2))
fig1 = fig1 + labs(title = "(A)") + theme(plot.title = element_text(hjust = 0.5))  
fig2 = fig2 + labs(title = "(B)")+ theme(plot.title = element_text(hjust = 0.5)) 
fig3 = fig3 + labs(title = "(C)" )+ theme(plot.title = element_text(hjust = 0.5)) 
grid.arrange(fig1, fig2, fig3,layout_matrix = lay)
