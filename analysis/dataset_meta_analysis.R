# Author: Cong Liu
# Last updated: 02-15-2022

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
library(stringr)

dt_meta = fread("./dataset_meta_20220203.csv")
dt_meta$subclass_category = str_trim(dt_meta$subclass_category)


dt_meta1a = dt_meta %>% 
  filter(subpopulation %in% c("age","all")) %>%
  mutate(dataset_id = paste0(clinical_site,"/",source)) %>%
  select(dataset_id,subclass_category,pt_count,concept_count,concept_pair_count) %>%
  gather(key = target, value = count,pt_count, concept_count, concept_pair_count,factor_key = T) %>%
  mutate(subclass_category = factor(subclass_category,levels = c(
    "all","hierachical","adult (18-99)","teenage (2-17)","kid (3-11)","neonates (0-2)"
  )))
levels(dt_meta1a$target) = c("Total patient count","Total concept count","Total concept pair count")
dt_meta1a$dataset_id = factor(dt_meta1a$dataset_id,levels = c("cuimc/ohdsi","cuimc/notes","chop/notes"))

fig1a = dt_meta1a %>%
  ggplot(aes(x=subclass_category,fill=dataset_id,y=count)) +
  geom_bar(position = "dodge",stat = "identity") +
  facet_grid(~target,scales = "free") +
  labs(title = "(A)") +
  scale_fill_discrete(name="Dataset",
                       breaks=c("cuimc/ohdsi", "cuimc/notes", "chop/notes"),
                       labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes")) + 
  
  theme(plot.title = element_text(hjust = 0.5)) +
  xlab("") +
  ylab("") +
  coord_flip() +
  theme(legend.position="top")



dt_meta1b = dt_meta %>% 
  filter(subpopulation %in% c("specialist")) %>%
  mutate(dataset_id = paste0(clinical_site,"/",source)) %>%
  select(dataset_id,subclass_category,pt_count,concept_count,concept_pair_count) %>%
  gather(key = target, value = count,pt_count, concept_count, concept_pair_count,factor_key = T)
levels(dt_meta1b$target) = c("Total patient count","Total concept count","Total concept pair count")
dt_meta1b$dataset_id = factor(dt_meta1b$dataset_id,levels = c("cuimc/ohdsi","cuimc/notes","chop/notes"))

fig1b = dt_meta1b %>%
  ggplot(aes(x=subclass_category,fill=dataset_id,y=count)) +
  geom_bar(position = "dodge",stat = "identity") + coord_flip() +
  facet_grid(~target,scales = "free") +
  labs(title = "(B)") +
  theme(plot.title = element_text(hjust = 0.5)) +
  scale_fill_discrete(name="Dataset",
                      breaks=c("cuimc/ohdsi", "cuimc/notes", "chop/notes"),
                      labels=c("CUIMC/OHDSI", "CUIMC/Notes", "CHOP/Notes"),drop = FALSE) + 
  xlab("") +
  ylab("count") +
  theme(legend.position="none")


require(gridExtra)
lay <- rbind(c(1),
             c(1),
             c(2),
             c(2),
             c(2))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
grid.arrange(fig1a, fig1b,layout_matrix = lay)





