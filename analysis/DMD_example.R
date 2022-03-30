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
topHpo

topHpo %>% write.csv(file = "./DMD_top_HPO_oddsRatio.csv")

q = "juvenile dermatomyositis"
url = "https://rare.cohd.io/api/vocabulary/findConceptByName"
res = GET(url, query = list(q = q, domain_id = "diseases"))
concept_id = fromJSON(rawToChar(res$content))$results$concept_id
url = "https://rare.cohd.io/api/association/obsExpRatio"
res = GET(url, query = list(concept_id_1 = concept_id, dataset_id = i, domain_id = "phenotypes", top_n = 9999))
topHpo = fromJSON(rawToChar(res$content))$results[,c(1,3,6)]
dim(topHpo)

topHpo = topHpo1 topHpo2