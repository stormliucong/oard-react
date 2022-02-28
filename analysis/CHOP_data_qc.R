library(data.table)
library(dplyr)

ulms_count = fread("../../material/CHOP/umls_concept_count_chop.tsv")
ulms_pair_count = fread("../../material/CHOP/umls_concept_pair_count_chop.tsv")
colnames(ulms_count) = c("cui_1","cui_1_count_by_single")
colnames(ulms_pair_count) = c("cui_1","cui_2","pair_count")
# check if this is a triangle for pair
ulms_pair_count[cui_1 == 'C1852539' & cui_2 == 'C0151526']
ulms_pair_count[cui_1 == 'C0151526' & cui_2 == 'C1852539']
# confirmed it is not a triangle.
# diagnol is available.
ulms_pair_count[cui_1 == 'C0151526' & cui_2 == 'C0151526']
ulms_pair_count_not_diag = ulms_pair_count[cui_1 != cui_2]
cui_1_count_by_pair_sum = ulms_pair_count_not_diag[,.(cui_1_count_by_pairsum = sum(pair_count)),by=cui_1]
cui_1_count_by_diag = ulms_pair_count[cui_1 == cui_2,.(cui_1,pair_count)]
cui_1_count_by_diag[,cui_1] %>% unique() %>% length() # 7210
colnames(cui_1_count_by_diag)[2] = c("cui_1_count_by_diag")
ulms_count[,cui_1] %>% unique() %>% length() # 9149
cui_1_count_by_diag[,cui_1] %>% unique() %>% length() # 7210
cui_1_count_by_pair_sum[,cui_1] %>% unique() %>% length() # 7210

compare_count = merge(merge(cui_1_count_by_diag,ulms_count),cui_1_count_by_pair_sum)
compare_count[cui_1_count_by_diag != cui_1_count_by_single] # 0
compare_count[cui_1_count_by_pairsum < cui_1_count_by_single] # 0

compare_count_pair_count = merge(ulms_pair_count,compare_count,by = "cui_1")
compare_count_pair_count[pair_count > cui_1_count_by_diag] # 0 
      