# pip install sparql-client
import sparql

# First you open a connection to the endpoint:
# endpoint = ''
# s = sparql.Service(endpoint, "utf-8", "GET")

# Retrieve a list of phenotypes which are associated with a disease with OMIM ID 100050.
q = '''
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX oa: <http://www.w3.org/ns/oa#>
PREFIX mim: <http://identifiers.org/mim/>
 
SELECT ?hpo FROM <https://pubcasefinder.dbcls.jp/rdf> WHERE{
  ?an rdf:type oa:Annotation ;
      oa:hasTarget mim:100050 ;
      oa:hasBody ?hpo.
}
'''
endpoint = 'https://integbio.jp/rdf/sparql'
result = sparql.query(endpoint, q)
for row in result:
    print(row)


