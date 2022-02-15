# Author: Cong Liu
# Last updated: 02-08-2022

rm(list=ls())
library(data.table)
library(ggplot2)
library(dplyr)
library(tidyr)
library(DBI)


generateChiStat = function(no_hits, hits,total_no_hits,total_hits){
  tableForChi = matrix(c(no_hits, hits,total_no_hits,total_hits),nrow=2)
  fisherStat = fisher.test(tableForChi)
  fisherOR = fisherStat$estimate
  fisherP = fisherStat$p.value
  fisherCI_low = fisherStat$conf.int[1]
  fisherCI_high = fisherStat$conf.int[2]
  return(data.frame(fisherOR,fisherP,fisherCI_low,fisherCI_high))
}

normFreq = function(x){
  if(!is.na(x)){
    if (str_detect(x, "[0-9]+%",negate = F)){
      return(as.numeric(sub("%", "", x))/100)
    }
    if (str_detect(x,"[0-9]+/[0-9]+",negate = F)){
      return(as.numeric(str_split(x,'/')[[1]][1])/as.numeric(str_split(x,'/')[[1]][2]))
    }
  }
  return(NA)
}

# Connect to my-db as defined in /.ncats.cnf
con <- dbConnect(RMariaDB::MariaDB(), group = "ncats")

# hp name
res <- dbSendQuery(con, "
                   SELECT c.concept_code as hp_id, c.concept_name as hp_name
                   FROM concept c
                   WHERE c.domain_id = 'phenotypes'
                   ")
hpoNameDf = dbFetch(res) %>% as.data.table()
dbClearResult(res)


# total concept
hpIdForEvalDf = fread("./hpo_max_rows.csv")[,1]
colnames(hpIdForEvalDf) = 'hp_id'
hpIdForEvalDf = union_all(union_all(
  hpIdForEvalDf %>% mutate(dataset_id = 1),
  hpIdForEvalDf %>% mutate(dataset_id = 2)
),  hpIdForEvalDf %>% mutate(dataset_id = 3))

# extract hit count.
res <- dbSendQuery(con, "
                   SELECT cc.dataset_id as dataset_id, c.concept_code as hp_id, 
                   cc.concept_count as hpo_count FROM concept_counts cc 
                   INNER JOIN concept c ON c.concept_id = cc.concept_id
                   WHERE c.domain_id = 'phenotypes' and cc.concept_count >=10 and cc.dataset_id in ('1','2','3') 
                   GROUP BY c.concept_code, cc.dataset_id;
                   ")
hpoCount = dbFetch(res) %>% as_tibble()
dbClearResult(res)

hpoCount %>% pull(hp_id) %>% unique() %>% length()
# 7046

hpoCount %>% group_by(dataset_id) %>% summarise(count = n_distinct(hp_id)) # 
# # A tibble: 3 x 2
# dataset_id count
# <int> <int>
# 1          1   634
# 2          2  5968
# 3          3  5819

###########################
# Fig 2a hit count distribution.
###########################
hitCountDf = hpIdForEvalDf %>% left_join(hpoCount)
hitCountDf = hitCountDf %>% replace(is.na(.), 0) %>% as.data.table()
fig2a = hitCountDf %>% 
  mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  group_by(dataset_id,hpo_count_bin) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  mutate(dataset = as.factor(dataset_id)) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  ggplot(aes(fill=dataset, y=count_of_hpos, x=number_of_pts)) +
  geom_bar(position="dodge", stat="identity") + 
  xlab("Number of patients in the dataset") +
  ylab("Number of HPO concepts") + 
  scale_fill_discrete(name="Dataset",
                      breaks=c("1", "2", "3"),
                      labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes"))+ 
  labs(title = "(A)") +
  theme(plot.title = element_text(hjust = 0.5))


###########################
# Fig 2b subclass v.s. hpo_count
###########################
disToRootDf = fread("./hp_2021_02_23.distanceToRoot")
colnames(disToRootDf) = c('hp_id','hp_name','dist_to_root','sub_class')
subClassName = disToRootDf[,.(sub_class)] %>% unique() %>% inner_join(hpoNameDf[,.(hp_id,hp_name)],by=c("sub_class"='hp_id'))
subHitCountDf = hitCountDf %>% inner_join(disToRootDf[,.(hp_id,sub_class)] %>% unique()) %>% 
  inner_join(subClassName,by=c("sub_class"="sub_class")) %>%
  group_by(hp_name,dataset_id) %>% summarise(no_hits = sum(hpo_count == 0), 
                                             hits = sum(hpo_count > 0)) %>%
  mutate(ratio = hits/(no_hits+hits))
fig2b = subHitCountDf %>%
  ggplot(aes(y=ratio,x=hp_name,group = as.factor(dataset_id))) + 
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  xlab("") +
  ylab("Ratio of HPO concepts >= 10 pts") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(10, 100, 1000)) + 
  labs(title = "(B)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + coord_flip()


###########################
# Fig 2c dist to root v.s. hpo_count
###########################
disToRootDf = fread("./hp_2021_02_23.distanceToRoot")
colnames(disToRootDf) = c('hp_id','hp_name','dist_to_root','sub_class')
rootHitCountDf = hitCountDf %>% inner_join(disToRootDf %>% select(hp_id,dist_to_root) %>% distinct()) %>%
  filter(dist_to_root != 0) %>% mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  mutate(dist_to_root = dist_to_root - 1) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  group_by(dataset_id,number_of_pts,dist_to_root) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  spread(number_of_pts, count_of_hpos,fill = 0) %>%
  mutate(hits = `< 10`, no_hits = `>= 10`) %>%  
  mutate(ratio = `>= 10` / (`< 10` + `>= 10`)) %>%
  select(dataset_id, dist_to_root, hits, no_hits, ratio) %>% as_tibble()
fig2c = rootHitCountDf %>%
  ggplot(aes(y=ratio,x=as.numeric(dist_to_root), group = as.factor(dataset_id))) + 
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  xlab("Distance to root") +
  ylab("") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(10, 100, 1000)) + 
  scale_x_continuous(breaks = seq(2, 12, by = 2),labels = seq(2, 12, by = 2),limits = c(1,12)) + 
  scale_y_continuous(breaks = seq(0, 1, by = 0.25),labels = seq(0, 1, by = 0.25),limits = c(0,1)) +
  labs(title = "(C)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + 
  theme(legend.position="none")

###########################
# Fig 2d token count v.s. hpo_count
###########################
# token count v.s. hit count
tokenLenDf = fread("./hp_2021_02_23.nameLength")
colnames(tokenLenDf) = c('hp_id','hp_name','token_count')
tokenLenDf = tokenLenDf %>% group_by(hp_id) %>% summarise(min_token_count = min(token_count))
tokenHitCountDf = hitCountDf %>% inner_join(tokenLenDf) %>% 
  mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  group_by(dataset_id,number_of_pts,min_token_count) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  spread(number_of_pts, count_of_hpos,fill = 0) %>%
  mutate(hits = `< 10`, no_hits = `>= 10`) %>%  
  mutate(ratio = `>= 10` / (`< 10` + `>= 10`)) %>%
  select(dataset_id, min_token_count, hits, no_hits, ratio) %>% as_tibble()

fig2d = tokenHitCountDf %>%
  ggplot(aes(y=ratio,x=as.numeric(min_token_count), group = as.factor(dataset_id))) + 
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  xlab("Number of tokens") +
  ylab("") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(10, 100, 1000)) + 
  scale_x_continuous(breaks = seq(2, 10, by = 2),labels = seq(2, 10, by = 2),limits = c(1,10)) + 
  scale_y_continuous(breaks = seq(0, 1, by = 0.25),labels = seq(0, 1, by = 0.25),limits = c(0,1)) + 
  labs(title = "(D)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + 
  theme(legend.position="none")

###########################
# Fig 2e Avg string length v.s. hpo_count
###########################
charLenDf = fread("hp_2021_02_23.charLength")
colnames(charLenDf) = c('hp_id','hp_name','string_length')
tokenLenDf = fread("./hp_2021_02_23.nameLength")
colnames(tokenLenDf) = c('hp_id','hp_name','token_count')
charLenDf = charLenDf %>% inner_join(tokenLenDf) %>% mutate(avg_string_length = string_length/token_count) %>%
  group_by(hp_id) %>% summarise(min_avg_string_length = min(avg_string_length))
stringHitCountDf = hitCountDf %>% inner_join(charLenDf) %>% 
  mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  mutate(min_avg_string_length_bin = cut(min_avg_string_length,breaks = c(0,6,7,8,9,10,Inf),include.lowest = F)) %>%
  group_by(dataset_id,number_of_pts,min_avg_string_length_bin) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  spread(number_of_pts, count_of_hpos,fill = 0) %>%
  mutate(hits = `< 10`, no_hits = `>= 10`) %>%  
  mutate(ratio = `>= 10` / (`< 10` + `>= 10`)) %>%
  select(dataset_id, min_avg_string_length_bin, hits, no_hits, ratio) %>% as_tibble()

fig2e = stringHitCountDf %>%
  ggplot(aes(y=ratio,x=as.factor(min_avg_string_length_bin), group = as.factor(dataset_id))) + 
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  xlab("String length") +
  ylab("") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(10, 100, 1000)) + 
  scale_y_continuous(breaks = seq(0, 1, by = 0.25),labels = seq(0, 1, by = 0.25),limits = c(0,1)) +
  labs(title = "(E)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + 
  theme(legend.position="none")


###########################
# Fig 2f POS v.s. hpo_count
###########################
posTagDf = fread("./hp_2021_02_23.posTag")
colnames(posTagDf) = c('hp_id','hp_name','token','pos_tag')
posTagTop = posTagDf %>% group_by(pos_tag) %>% summarise(count = n()) %>% arrange(desc(count)) %>% head(n=7)
posTagDfSub = posTagDf %>% inner_join(posTagTop) %>% select(hp_id, pos_tag)
posHitCountDf = hitCountDf %>% inner_join(posTagDfSub) %>% 
  mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  group_by(dataset_id,number_of_pts,pos_tag) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  spread(number_of_pts, count_of_hpos,fill = 0) %>%
  mutate(hits = `< 10`, no_hits = `>= 10`) %>%  
  mutate(ratio = `>= 10` / (`< 10` + `>= 10`)) %>%
  select(dataset_id, pos_tag, hits, no_hits, ratio) %>% as_tibble()

fig2f = posHitCountDf %>%
  ggplot(aes(y=ratio,x=as.factor(pos_tag), group = as.factor(dataset_id))) + 
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  xlab("POS") +
  ylab("") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(1000,10000,100000)) + 
  scale_y_continuous(breaks = seq(0, 1, by = 0.25),labels = seq(0, 1, by = 0.25),limits = c(0,1)) +
  labs(title = "(F)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + 
  theme(legend.position="none")

###########################
# Fig 2g Design Pattern v.s. hpo_count
###########################
patternDf = fread("./hp_2021_02_23.patDesign")
colnames(patternDf) = c('hp_id','hp_name','pat','ontology')
ontologyTop = patternDf %>% group_by(ontology) %>% summarise(count = n()) %>% arrange(desc(count)) %>% head(n=8)
patternDfSub = patternDf %>% inner_join(ontologyTop) %>% select(hp_id,ontology)

patternHitCountDf = hitCountDf %>% inner_join(patternDfSub) %>% 
  mutate(hpo_count_bin = cut(hpo_count,breaks = c(-Inf,9,Inf),include.lowest = F)) %>%
  mutate(number_of_pts = recode_factor(hpo_count_bin, "(-Inf,9]" = "< 10", "(9, Inf]" = ">= 10")) %>%
  group_by(dataset_id,number_of_pts,ontology) %>% summarise(count_of_hpos = n_distinct(hp_id)) %>%
  spread(number_of_pts, count_of_hpos,fill = 0) %>%
  mutate(hits = `< 10`, no_hits = `>= 10`) %>%  
  mutate(ratio = `>= 10` / (`< 10` + `>= 10`)) %>%
  select(dataset_id, ontology, hits, no_hits, ratio) %>% as_tibble()

fig2g = patternHitCountDf %>%
  ggplot(aes(y=ratio,x=as.factor(ontology), group = as.factor(dataset_id))) + 
  geom_point(aes(shape = as.factor(dataset_id), color = as.factor(dataset_id), size = no_hits+hits)) +
  geom_line(aes(linetype=as.factor(dataset_id),color = as.factor(dataset_id))) +
  xlab("Design ontology") +
  ylab("") + 
  scale_shape_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_linetype_discrete(name="Dataset",
                          breaks=c(1, 2, 3),
                          labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_color_discrete(name="Dataset",
                       breaks=c(1, 2, 3),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  scale_size_continuous(name = "# of total concepts", breaks = c(1000,10000,100000)) + 
  scale_y_continuous(breaks = seq(0, 1, by = 0.25),labels = seq(0, 1, by = 0.25),limits = c(0,1)) +
  labs(title = "(G)",color = "Dataset", shape  = "Dataset", linetype = "Dataset", size = "# of total concepts") +
  theme(plot.title = element_text(hjust = 0.5)) + 
  theme(legend.position="none")


require(gridExtra)
lay <- rbind(c(1,1,2,2,2),
             c(3,4,5,6,7))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
grid.arrange(fig2a, fig2b, fig2c, fig2d, fig2e, fig2f, fig2g,layout_matrix = lay)

