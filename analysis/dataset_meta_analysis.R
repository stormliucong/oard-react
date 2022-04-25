# Author: Cong Liu
# Last updated: 04-25-2022

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
library(RColorBrewer)
library(scales)

options( scipen = 1 )


dt_meta = fread("./dataset_meta_20220203.csv")
dt_meta$subclass_category = str_trim(dt_meta$subclass_category)


dt_meta1a = dt_meta %>% 
  filter(subpopulation %in% c("age","all")) %>%
  mutate(dataset_id = paste0(clinical_site,"/",source)) %>%
  select(dataset_id,subclass_category,pt_count,concept_count,concept_pair_count) %>%
  gather(key = target, value = count,pt_count, concept_count, concept_pair_count,factor_key = T) %>%
  mutate(subclass_category = factor(subclass_category,levels = c(
    "all","hierachical","adulthood (18-99)","adolescence (12-17)","childhood (3-11)","neonatal & early life (0-2)"
  )))
levels(dt_meta1a$target) = c("Total patient count","Total concept count","Total concept pair count")
dt_meta1a$dataset_id = factor(dt_meta1a$dataset_id,levels = c("cuimc/omop","cuimc/notes","chop/notes"))

fig1a = dt_meta1a %>%
  ggplot(aes(x=subclass_category,fill=dataset_id,y=count)) +
  geom_bar(position = "dodge",stat = "identity") +
  facet_grid(~target,scales = "free") +
  labs(title = "(A)") + scale_fill_viridis_d(name="Dataset",
                                             breaks=c("cuimc/omop", "cuimc/notes", "chop/notes"),
                                             labels=c("CUIMC/OMOP", "CUIMC/Notes", "CHOP/Notes")) +
  theme(plot.title = element_text(hjust = 0.5)) +
  scale_y_continuous(labels = scales::comma) +
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
dt_meta1b$dataset_id = factor(dt_meta1b$dataset_id,levels = c("cuimc/omop","cuimc/notes","chop/notes"))

fig1b = dt_meta1b %>%
  ggplot(aes(x=subclass_category,fill=dataset_id,y=count)) +
  geom_bar(position = "dodge",stat = "identity") + coord_flip() +
  facet_grid(~target,scales = "free") +
  labs(title = "(B)") +
  theme(plot.title = element_text(hjust = 0.5)) +
  scale_fill_viridis_d(name="Dataset",
                      breaks=c("cuimc/omop", "cuimc/notes", "chop/notes"),
                      labels=c("CUIMC/OMOP", "CUIMC/Notes", "CHOP/Notes"),drop = FALSE) + 
  xlab("") +
  ylab("count") +
  scale_y_continuous(labels = scales::comma) +
  theme(legend.position="none")


require(gridExtra)
lay <- rbind(c(1),
             c(1),
             c(2),
             c(2),
             c(2))
# grid.arrange(fig2a, fig2b, fig2c, fig2d, ncol = 2)
grid.arrange(fig1a, fig1b,layout_matrix = lay)





