# pip install sparql-client
import sparql
import re
import pandas as pd

q = '''
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX obo: <http://purl.obolibrary.org/obo/>
PREFIX ordo: <http://www.orpha.net/ORDO/>
PREFIX bibo: <http://purl.org/ontology/bibo/>
PREFIX owl: <http://www.w3.org/2002/07/owl#>

SELECT DISTINCT ?an FROM <https://pubcasefinder.dbcls.jp/rdf> WHERE{
  ?an rdf:type oa:Annotation ;
      oa:hasTarget ?disease ;
      oa:hasBody ?hpo ;
      dcterms:source [      
          dcterms:references ?paper;
          dcterms:creator "Database Center for Life Science"; 
      ] .
  ?paper rdf:type bibo:Article ;
         rdfs:seeAlso ?pubmed . 
} 
'''
endpoint = 'https://integbio.jp/rdf/sparql'
result = sparql.query(endpoint, q)
dpa_list = []
for row in result:
    iri = row[0].value
    iri_list = iri.split("/")
    disease = iri_list[-2].split(":")
    phenotype = iri_list[-1].split(":")

    if disease[1] == 'ORDO':
        disease_id = 'ORPHA:' + disease[2]
    elif disease[1] == 'OMIM':
        disease_id = 'OMIM:' + disease[2]
    else:
        disease_id = None
    
    if phenotype[1] == 'HP':
        phenotype_id = 'HP:' + phenotype[2]
    else:
        phenotype_id = None

    if disease_id is not None and phenotype_id is not None:
        dpa_list.append({'disease_id': disease_id, 'hp_id': phenotype_id})

df = pd.DataFrame(dpa_list)
df.to_csv('./analysis/pubcasefinder_dpa.csv',index=None)
