library(httr)
library(jsonlite)

url = "https://rare.cohd.io/api/vocabulary/findConceptByName"
res = GET(url, query = list(q = "Duchenne muscular dystrophy", domain_id = "diseases"))
concept_id = fromJSON(rawToChar(res$content))$results$concept_id

url = "https://rare.cohd.io/api/association/obsExpRatio"
res = GET(url, query = list(concept_id_1 = concept_id, dataset_id = 2, domain_id = "phenotypes", top_n = 200))
topHpo = fromJSON(rawToChar(res$content))$results[,c(1,3,6)]
