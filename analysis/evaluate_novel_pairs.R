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

graded = fread(file = "./novel_identified_DPA_sample_200_seed_1_for_review_graded.csv")

sum(graded %>% is.na())/(150*2)

graded_grid = graded %>% 
  group_by(confidence_count,confidence) %>% summarise(median_1 = mean(review_1,na.rm = T),
                                              median_2 = mean(review_2,na.rm = T),
                                              median_3 = mean(review_3,na.rm = T)) %>% 
  rowwise() %>% 
  mutate(mean_grade = mean(c(median_1,  median_3),na.rm = T)) %>% 
  select(confidence_count,confidence,mean_grade)
graded_grid %>% ggplot(aes(x = confidence_count,y = confidence,fill = mean_grade)) + 
  geom_tile() + 
  geom_tile(color = "black") +
  scale_fill_gradient(low = "white", high = "red") +
  coord_fixed() + theme_bw() +   
  labs(title = "(C)") + 
  xlab("Count of statistics surpass the confident thresholds") +
  ylab("Confident thresholds")

graded_lm = graded_grid
graded_lm$confidence = as.numeric(as.character(sub("%", "", graded_lm$confidence)))
anova(lm(mean_grade~confidence_count+confidence,data = graded_lm))
