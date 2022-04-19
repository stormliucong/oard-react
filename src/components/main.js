import React, { Component } from 'react';
import DsSelectComp from './datasetselect'
import DomainSelectComp from './domainselect'
import ReturnSelectComp from './returnselect'
import ServiceSelectComp from './serviceselect'
import MethodSelectComp from './methodselect'
import SearchBox1Comp from './searchbox1';
import SearchBox2Comp from './searchbox2';
import SubmitComp from "./submit";
import ResultComp from "./results";

import Grid from '@mui/material/Grid';



class MainComp extends Component {
    state = {
        queryConceptList1: [],
        queryConceptList2: [],
        dataset: "2",
        domain: "all",
        topN: "25",
        apiService: "frequencies",
        apiMethod: "mostFrequency",
        apiResultsDisplay: false,
        apiResults: [
            {
                "concept_code_2": "MONDO:0020128",
                "concept_id_2": 80020128,
                "concept_name_2": "motor neuron disease",
                "domain_id_2": "diseases",
                "vocabulary_id_2": "mondo",
                "ws_jaccard_index": 0.058781401498457474,
                "z_details": [
                    {
                        "concept_code_1": "HP:0001324",
                        "concept_id_1": 90001324,
                        "concept_name_1": "Muscle weakness",
                        "concept_pair_count": 1067,
                        "domain_id_1": "phenotypes",
                        "jaccard_index": 0.058781401498457474,
                        "vocabulary_id_1": "hpo",
                        "w": 1
                    }
                ]
            },
            {
                "concept_code_2": "HP:0025406",
                "concept_id_2": 90025406,
                "concept_name_2": "Asthenia",
                "domain_id_2": "phenotypes",
                "vocabulary_id_2": "hpo",
                "ws_jaccard_index": 0.05399218026545941,
                "z_details": [
                    {
                        "concept_code_1": "HP:0001324",
                        "concept_id_1": 90001324,
                        "concept_name_1": "Muscle weakness",
                        "concept_pair_count": 2099,
                        "domain_id_1": "phenotypes",
                        "jaccard_index": 0.05399218026545941,
                        "vocabulary_id_1": "hpo",
                        "w": 1
                    }
                ]
            },
            {
                "concept_code_2": "HP:0001260",
                "concept_id_2": 90001260,
                "concept_name_2": "Dysarthria",
                "domain_id_2": "phenotypes",
                "vocabulary_id_2": "hpo",
                "ws_jaccard_index": 0.05013278413094141,
                "z_details": [
                    {
                        "concept_code_1": "HP:0001324",
                        "concept_id_1": 90001324,
                        "concept_name_1": "Muscle weakness",
                        "concept_pair_count": 925,
                        "domain_id_1": "phenotypes",
                        "jaccard_index": 0.05013278413094141,
                        "vocabulary_id_1": "hpo",
                        "w": 1
                    }
                ]
            },
            {
                "concept_code_2": "MONDO:0004976",
                "concept_id_2": 80004976,
                "concept_name_2": "amyotrophic lateral sclerosis",
                "domain_id_2": "diseases",
                "vocabulary_id_2": "mondo",
                "ws_jaccard_index": 0.04871031746031746,
                "z_details": [
                    {
                        "concept_code_1": "HP:0001324",
                        "concept_id_1": 90001324,
                        "concept_name_1": "Muscle weakness",
                        "concept_pair_count": 982,
                        "domain_id_1": "phenotypes",
                        "jaccard_index": 0.04871031746031746,
                        "vocabulary_id_1": "hpo",
                        "w": 1
                    }
                ]
            }]
    }


    handleSearchBox1SelectChange = (newValue) => {
        if(!newValue.length){
            //reset
            this.setState({ queryConceptList1: [], queryConceptList2: [], apiService: "frequencies", apiMethod: "mostFrequency", topN: "25", apiResultsDisplay: false})
        }else{
            if(this.state.apiMethod == 'mostFrequency'){
                this.setState({ queryConceptList1: [...newValue], queryConceptList2: [], apiService: "frequencies", apiMethod: "singleConceptFreq", apiResultsDisplay: false})
            }else{
                this.setState({queryConceptList1: [...newValue], apiResultsDisplay: false})
            }
        }
        
    }

    handleSearchBox2SelectChange = (newValue) =>{
        if(this.state.apiService == "frequencies"){
            if(!newValue.length){
                this.setState({queryConceptList2: [], apiMethod: "singleConceptFreq", apiResultsDisplay: false})
            }else{
                this.setState({queryConceptList2: [...newValue], apiMethod: "pairedConceptFreq", apiResultsDisplay: false})
            }
        }else{
            this.setState({queryConceptList2: [...newValue], apiResultsDisplay: false})
        }
    }

    handleDatasetSelectChange = (ds) => {
        this.setState({dataset: ds, apiResultsDisplay: false})
    }

    handleDomainSelectChange = (domain) => {
        this.setState({domain: domain, apiResultsDisplay: false})
    }

    handleReturnSelectChange = (topN) => {
        this.setState({topN: topN, apiResultsDisplay: false})
    }

    handleServiceSelectChange = (service) => {
        if (service == "frequencies" ){
            if(!this.state.queryConceptList2.length){
                this.setState({apiService: "frequencies", apiMethod: "singleConceptFreq", apiResultsDisplay: false})
            }else{
                this.setState({apiService: "frequencies", apiMethod: "pairedConceptFreq", apiResultsDisplay: false})
            }
        }else{
            this.setState({apiService: "association", apiMethod: "obsExpRatio", apiResultsDisplay: false})
        }
    }

    handleMethodSelectChange = (method) => {
        this.setState({apiMethod: method, apiResultsDisplay: false})  
    }

    handleSubmitChange = (results) => {
        this.setState({
            apiResults: results, 
            apiResultsDisplay: true
        })
    }


    render() {

        return (
            <Grid container xs={12} spacing={2} justifyContent="center" p={10}>

                {/* form */}
                <Grid container item xs={12} spacing={5}  justifyContent="space-around">
                    {/* search box 1 */}
                    <SearchBox1Comp handleSearchBox1SelectChange={this.handleSearchBox1SelectChange} queryConceptList1={this.state.queryConceptList1} />
                    

                    {/* search box 2 */}
                    <SearchBox2Comp handleSearchBox2SelectChange={this.handleSearchBox2SelectChange} queryConceptList1={this.state.queryConceptList1} queryConceptList2={this.state.queryConceptList2} />
                    

                    {/* service selection */}
                    <ServiceSelectComp handleServiceSelectChange={this.handleServiceSelectChange} apiService={this.state.apiService} queryConceptList1={this.state.queryConceptList1}/>

                    {/* method selection */}
                    <MethodSelectComp handleMethodSelectChange={this.handleMethodSelectChange} apiService={this.state.apiService} apiMethod={this.state.apiMethod} queryConceptList1={this.state.queryConceptList1} queryConceptList2={this.state.queryConceptList2}/>  

                    {/* dataset selection */}
                    <DsSelectComp handleDatasetSelectChange={this.handleDatasetSelectChange} dataset={this.state.dataset}/>
                    

                    {/* domain selection */}
                    <DomainSelectComp handleDomainSelectChange={this.handleDomainSelectChange} domain={this.state.domain} apiMethod={this.state.apiMethod} queryConceptList2={this.state.queryConceptList2} />

                    {/* return selection */}
                    <ReturnSelectComp handleReturnSelectChange={this.handleReturnSelectChange} topN={this.state.topN} apiMethod={this.state.apiMethod} queryConceptList2={this.state.queryConceptList2} />

                    {/* submit button */}
                    <SubmitComp handleSubmitChange={this.handleSubmitChange} dataset={this.state.dataset} domain={this.state.domain} topN={this.state.topN} apiService={this.state.apiService} apiMethod={this.state.apiMethod} queryConceptList1={this.state.queryConceptList1} queryConceptList2={this.state.queryConceptList2}/>
                </Grid>

                {/* results */}
                <Grid item container xs={12}  justifyContent="space-around">
                    <ResultComp apiResults={this.state.apiResults} apiResultsDisplay={this.state.apiResultsDisplay} apiMethod={this.state.apiMethod} apiService={this.state.apiService} />                    
                </Grid>
            </Grid>
        );
    }
}

export default MainComp;