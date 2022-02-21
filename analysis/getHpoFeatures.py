import os
import pickle as pkl
import pandas as pd
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk import pos_tag
import nltk
# nltk.download('averaged_perceptron_tagger')
from collections import OrderedDict
from lxml import etree
import re
import pandas as pd
import time
from bs4 import BeautifulSoup
import requests
import random

def string_replace(string):
    new_str = ""
    
    for l in string:
        
        if l == ",":
            current_char = ""
        elif l == " ":
            current_char = "+"
        else:
            current_char = l
            
        new_str += current_char
    
    return new_str

class HpoFeatures(object):
    def __init__(self,hpo_dir='/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/hpo'):
        self.hpo_dir = hpo_dir
        self.owl = os.path.join(hpo_dir,"hp.owl")
        self.obo = os.path.join(hpo_dir,"hp_2021_02_23.obo")
        self.ancestry = os.path.join(hpo_dir,"hp_2021_02_23_ancestry.pkl")
        self.name = os.path.join(hpo_dir,"hp_2021_02_23.names")
        self.annotation = os.path.join(hpo_dir,"phenotype.hpoa")
        self.parent_dict = self.getParentsDict()
        self.pattern_dict = self.getDesignPatternDict()
    
    def getNameLength(self,output="hp_2021_02_23.nameLength"):
        output = os.path.join(self.hpo_dir,output)
        with open(output,'w') as fw:
            with open(self.name,'r') as f:
                for line in f.readlines():
                    hp_id, hp_name = line.strip().split('\t')
                    fw.write('\t'.join([hp_id,hp_name,str(len(hp_name.split()))])+'\n')
        return 1

    def getCharLength(self,output="hp_2021_02_23.charLength"):
        output = os.path.join(self.hpo_dir,output)
        with open(output,'w') as fw:
            with open(self.name,'r') as f:
                for line in f.readlines():
                    hp_id, hp_name = line.strip().split('\t')
                    fw.write('\t'.join([hp_id,hp_name,str(len(hp_name))])+'\n')
        return 1

    def getHighFreqCount(self,topN = 1,output="hp_2021_02_23.tokenCount"):
        output = os.path.join(self.hpo_dir,output)

        token_freq_dict = {}
        stop_words = set(stopwords.words('english'))
        with open(self.name,'r') as f:
            for line in f.readlines():
                hp_id, hp_name = line.strip().split('\t')
                word_tokens = word_tokenize(hp_name)
                filtered_sentence = [w for w in word_tokens if not w in stop_words]
                for w in filtered_sentence:
                    if w not in token_freq_dict.keys():
                        token_freq_dict[w] = 0
                    token_freq_dict[w] += 1
    
        with open(output,'w') as fw:
            d_descending = OrderedDict(sorted(token_freq_dict.items(),key=lambda kv: kv[1], reverse=True))
            for w in d_descending.keys():
                fw.write('\t'.join([w,str(d_descending[w])])+'\n')
        return 1

    def getPosTag(self,output="hp_2021_02_23.posTag"):
        output = os.path.join(self.hpo_dir,output)
        with open(output,'w') as fw:
            with open(self.name,'r') as f:
                for line in f.readlines():
                    hp_id, hp_name = line.strip().split('\t')
                    word_tokens = word_tokenize(hp_name)
                    tags = pos_tag(word_tokens)
                    for tag in tags:
                        fw.write('\t'.join([hp_id,hp_name,tag[0].lower(),tag[1]])+'\n')
        return 1
    
    def getPatDesign(self,output="hp_2021_02_23.patDesign"):
        output = os.path.join(self.hpo_dir,output)
        with open(output,'w') as fw:
            with open(self.name,'r') as f:
                for line in f.readlines():
                    hp_id, hp_name = line.strip().split('\t')
                    if hp_id in self.pattern_dict.keys():
                        for pat in self.pattern_dict[hp_id]:
                            ontology, _ = pat.split('_')
                            fw.write('\t'.join([hp_id,hp_name,pat,ontology])+'\n')
        return 1

    def getDisToRoot(self,output="hp_2021_02_23.distanceToRoot",get_sys_class=True):
        output = os.path.join(self.hpo_dir,output)
        parent_dict = self.parent_dict 
        with open(output,'w') as fw:
            with open(self.name,'r') as f:
                for line in f.readlines():
                    hp_id, hp_name = line.strip().split('\t')
                    shortest_distance, system_class = self.getShortestPathToRoot(graph=parent_dict, node=hp_id)
                    if get_sys_class == True:
                        fw.write('\t'.join([hp_id,hp_name,str(shortest_distance),system_class])+'\n')
                    else:
                        fw.write('\t'.join([hp_id,hp_name,str(shortest_distance)])+'\n')
        return 1

    def getDesignPatternDict(self):
        owl = self.owl
        # build the parents dicts.
        pattern_dict = {}
        tree = etree.parse(owl)
        root = tree.getroot()
        id = ''
        label = ''
        synonym = ''
        i = 0
        for ele1 in root.findall('owl:Class', root.nsmap):
            abouts = ele1.attrib.values()
            for a in abouts:
                m = re.match('.+?(HP_\d+)$', a)
                if m:
                    id = m.group(1).replace("_",":")
                    pattern_dict[id] = []
                    for ele3 in ele1.findall('owl:equivalentClass',root.nsmap):
                        for tag in ele3.iter():
                            if len(tag.attrib.values()) > 0:
                                m = re.match('http://purl.obolibrary.org/obo/(.+?_\d+).*', tag.attrib.values()[0])
                                if m:
                                    p = m.group(1)
                                    pattern_dict[id].append(p)
            else:
                next
        return pattern_dict
        

        

    def getFreqAnnotation(self,output):
        pass
        return 1

    def getOnset(self):
        pass
        return 1
    
    def getPubmedCount(self,sleep_time=1,output="hp_2021_02_23.pubmedCount"):
        output = os.path.join(self.hpo_dir,output)
        hp_list = []
        disease_list = []
        search_results = []
        term_not_found_list = []
        count = 0
        with open(self.name,'r') as f:
            for line in f.readlines():
                hp_id, hp_name = line.strip().split('\t')
                disease = string_replace(hp_name)
                base_url = "https://pubmed.ncbi.nlm.nih.gov/?term=%28{d}%5BTitle%2FAbstract%5D%29+%5BTitle%2FAbstract%5D%29&filter=years.2010-2020"
                url = base_url.format(d=disease)
                response = requests.get(url)
                retry_count = 0
                while (response.status_code != 200 and retry_count < 2):
                    print("retry..." + disease)
                    response = requests.get(url)
                    retry_count = retry_count + 1 
                html = response.text
                soup = BeautifulSoup(html, 'html.parser')
                result = soup.select_one("#search-results > div.results-amount-container > div.results-amount > span")
                term_not_found_test = soup.select_one("#search-results > section > em.altered-search-explanation.query-error-message")
                hp_list.append(hp_id)
                disease_list.append(hp_name)
                if term_not_found_test is None:
                    term_not_found_list.append("False")
                else:
                    term_not_found_list.append("True")
                
                try:
                    result_num = result.text
                    search_results.append(result_num)
                except:
                    search_results.append(0)
                count = count + 1
                # time.sleep(random.uniform(0,1))
                time.sleep(0.2)
            data_df = pd.DataFrame({"hp_id":hp_list, "hp_name" : disease_list, "search_result" : search_results, "term_not_found" : term_not_found_list})
        data_df.to_csv(output,sep='\t', index=False)


    def getParentsDict(self):
        owl = self.owl
        # build the parents dicts.
        parents_dict = {}
        tree = etree.parse(owl)
        root = tree.getroot()
        id = ''
        label = ''
        synonym = ''
        i = 0
        for ele1 in root.findall('owl:Class', root.nsmap):
            abouts = ele1.attrib.values()
            for a in abouts:
                m = re.match('.+?(HP_\d+)$', a)
                if m:
                    id = m.group(1).replace("_",":")
                    parents_dict[id] = []
                    for ele3 in ele1.findall('rdfs:subClassOf', root.nsmap):
                        parents = ele3.attrib.values()
                        for p in parents:
                            m = re.match('.+?(HP_\d+)$', p)
                            if m:
                                p = m.group(1)
                                pid = p.replace("_",":")
                                parents_dict[id].append(pid)
            else:
                next
        return parents_dict
    
    def getShortestPathToRoot(self, graph, node,end='HP:0000118'):
        
            visited = [] # List to keep track of visited nodes.
            queue = []     #Initialize a queue
            visited.append(node)
            queue.append([node])
            while queue:
                path = queue.pop(0)
                node = path[-1]
                print (node, end = " ") 
                if (len(graph[node])) > 0: # remove iso and ALL like nodes.
                    for pid in graph[node]:
                            
                        if pid not in visited:
                            new_path = list(path)
                            system_class = new_path[-1]
                            new_path.append(pid)
                            queue.append(new_path)

                        if pid == end:
                            print("Shortest path = ", *new_path)
                            return len(new_path), system_class
                        visited.append(pid)
                else:
                    return 0, 'ALL'

if __name__ == '__main__':
    print("--- build new hpo feature instanace ---")
    hpoFeatures = HpoFeatures(hpo_dir='/phi_home/cl3720/phi/EHR-based-HPO-freq-resource/03-data/raw/hpo')
    print("--- get token count --- ")
    # hpoFeatures.getNameLength()
    # print("--- get string length --- ")
    # hpoFeatures.getCharLength()
    # print("--- get high freq count --- ")
    # hpoFeatures.getHighFreqCount()
    # print("--- get pos tag --- ")
    # hpoFeatures.getPosTag()
    # print("--- get dis to root and system class ")
    # hpoFeatures.getDisToRoot()
    # hpoFeatures.getPatDesign()
    start_time = time.time() # timing
    hpoFeatures.getPubmedCount()
    print("--- %s seconds ---" % (time.time() - start_time))