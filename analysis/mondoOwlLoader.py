from owlready2 import *
import re
from queue import Queue
from GraphUtils import *
import pandas as pd

onto = get_ontology("http://purl.obolibrary.org/obo/mondo.owl").load()
obo = onto.get_namespace("http://purl.obolibrary.org/obo/")
ontology_classes = obo.MONDO_0000001.descendants()

def getDbXref(ontology_classes):
    mondo_xref_list = []
    for current_class in ontology_classes:
        if current_class.hasDbXref:
            class_id = current_class.name.replace('_', ':')
            xref_list = current_class.hasDbXref
            for xref in xref_list:
                mondo_xref_list.append({'class_id': class_id, 'xref_list': xref})
    return pd.json_normalize(mondo_xref_list)

getDbXref(ontology_classes).to_csv('/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/mondo/mondo_xref.csv',index=None)
