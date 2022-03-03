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
figa = graded_grid %>% ggplot(aes(x = confidence_count,y = confidence,fill = mean_grade)) + 
  geom_tile() + 
  geom_tile(color = "black") +
  scale_fill_gradient(low = "white", high = "red") +
  coord_fixed() + theme_bw() +   
  labs(title = "(A)") + 
  xlab("Count of statistics surpass the confident thresholds") +
  ylab("Confident thresholds")

graded_lm = graded_grid
graded_lm$confidence = as.numeric(as.character(sub("%", "", graded_lm$confidence)))
anova(lm(mean_grade~confidence_count+confidence,data = graded_lm))


# DMD
dmd_reviewed = fread(file = "./novel_identified_DMD_example.csv")
graded = fread(file = "./novel_identified_DMD_wkc_graded.csv")
colnames(graded) = c("concept_name_2","grade")
dmd_grade = merge(dmd_reviewed,graded)

dmd_grade_summary = dmd_grade %>% group_by(confidence,confidence_count) %>% summarise(count_pair = length(grade), positive_pair = sum(grade)) %>%
  mutate(positive_rate = positive_pair/count_pair)

dmd_grade_summary_lg_2 = dmd_grade_summary %>% filter(confidence_count >= 2) %>% group_by(confidence) %>% summarise(count_pair = sum(count_pair), positive_pair = sum(positive_pair)) %>%
  mutate(positive_rate = positive_pair/count_pair)

figb = dmd_grade_summary_lg_2 %>% 
  ggplot(aes(x = confidence,y = positive_rate)) + 
  geom_bar(stat = "identity") +
  labs(title = "(B)") + 
  xlab("Confident thresholds") +
  ylab("Precision based on clinical review")



require(gridExtra)
lay <- rbind(c(1,1,2,2))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
fig4a = fig4a + labs(title = "(A) OARD count") + theme(plot.title = element_text(hjust = 0.5))  
fig4b = fig4b + labs(title = "(B) Raw OARD")+ theme(plot.title = element_text(hjust = 0.5)) 
fig4c = fig4c + labs(title = "(C) Raw hierachical OARD" )+ theme(plot.title = element_text(hjust = 0.5)) 
fig4d = fig4d + labs(title = "(D) Raw hierachical OARD + single count > 10")+ theme(plot.title = element_text(hjust = 0.5)) 
grid.arrange(figa, figb, layout_matrix = lay)

  
