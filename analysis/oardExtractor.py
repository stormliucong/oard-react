from owlready2 import *
import re
from queue import Queue
import pandas as pd
import requests
url = "https://www.ebi.ac.uk/ols/api/ontologies/ordo/terms"

onto = get_ontology("file:///phi_home/cl3720/phi/EHR-based-HPO-freq-resource/02-scripts/WorkflowForOardDataSet/vocabulary-resources/TerminologyCodeBase/ordo_orphanet.owl").load()
obo = onto.get_namespace("http://purl.obolibrary.org/obo/")
ORDO = onto.get_namespace("http://www.orpha.net/ORDO/")
oboInOwl = onto.get_namespace("http://www.geneontology.org/formats/oboInOwl")

clinical_entities = ORDO.Orphanet_C001.descendants()
# ORDO.Orphanet_2102.get_class_properties()
# C016 - inheritance
# C017 - onset
# C025 - point prev

orphanet_inheritance_list = []
orphanet_onset_list = []
orphanet_prev_list = []
value_list = []
for entity in clinical_entities:
    inheritance_list = list(entity.Orphanet_C016) # convert to list to use json_normalize in pd.
    onset_list = list(entity.Orphanet_C017) 
    prev_list = list(entity.Orphanet_C025)
    class_id = entity.name.replace('_', ':')
    value_list.extend(inheritance_list)
    value_list.extend(onset_list)
    value_list.extend(prev_list)

    orphanet_inheritance_list.append({'class_id': class_id, 'inheritance_list' : inheritance_list })
    orphanet_onset_list.append({'class_id': class_id, 'onset_list': onset_list})
    orphanet_prev_list.append({'class_id': class_id, 'prev_list': prev_list})

val_list = []
for val in set(value_list):
    val_class = ORDO[val.split('/')[-1]]
    class_name = val_class.label[0]
    val_list.append({'val': val, 'annotation_class': class_name})

val_df = pd.json_normalize(val_list)
orphanet_inheritance_df = pd.json_normalize(orphanet_inheritance_list).explode('inheritance_list').merge(val_df,left_on='inheritance_list',right_on='val')[['class_id','annotation_class']]
orphanet_onset_df = pd.json_normalize(orphanet_onset_list).explode('onset_list').merge(val_df,left_on='onset_list',right_on='val')[['class_id','annotation_class']]
orphanet_prev_df = pd.json_normalize(orphanet_prev_list).explode('prev_list').merge(val_df,left_on='prev_list',right_on='val')[['class_id','annotation_class']]
orphanet_inheritance_df.to_csv('/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/orpha/orpha_inheritance.csv',index=None)
orphanet_onset_df.to_csv('/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/orpha/orpha_onset.csv',index=None)
orphanet_prev_df.to_csv('/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/orpha/orpha_prev.csv',index=None)
