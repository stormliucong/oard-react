import React, { Component } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import Button from '@mui/material/Button';
import SinelgResultDisplayComp from './singleresult'
import DsHelperComp from './datasethelper'
import { Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';



class MainComp extends Component {
    state = {
        queryText: '',
        querySugList: [
            {
                "name": "Abnormality of the musculature",
                "id": "HP:0003011",
                "group": "HPO PHENOTYPE"
            },
            {
                "name": "Muscle weakness",
                "id": "HP:0001324",
                "group": "HPO PHENOTYPE"

            },
            {
                "name": "Skeletal muscle atrophy",
                "id": "HP:0003202",
                "group": "HPO PHENOTYPE"
            }],
        queryConceptList1: [],
        queryConceptList2: [],
        dtHelperOpen: false,
        dataset: "1",
        domain: "phenotypes",
        topN: "25",
        apiService: "frequencies",
        apiMethod: "mostFrequency",
        apiResultsDisplayService: "frequencies",
        apiResultsDisplayMethod: "mostFrequency",
        apiSelectableMethod: ['singleConceptFreq', 'pairedConceptFreq', 'mostFrequency'],
        apiResultsDisplay: false,
        submitError: false,
        submitHelperText: '',
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


    loadConceptsEbi = async () => {
        const query = this.state.queryText
        console.log(query)
        var response = await axios.get('https://www.ebi.ac.uk/ols/api/select', {
            params: {
                q: query,
                ontology: 'mondo,hp',
                rows: 50
            }
        });
        this.setState({ querySugList: [] })
        var resultList = response.data.response.docs
        if (resultList.length > 0) {
            resultList.forEach((doc) => {
                var term = {}
                if (doc.obo_id.startsWith('MONDO:') || doc.obo_id.startsWith('HP:')) {

                    term.group = doc.obo_id.startsWith('MONDO:') ? 'MONDO DISEASE' : 'HPO Phenotype'
                    term.label = doc.label
                    term.id = doc.obo_id
                    const idExist = this.state.querySugList.find(element => {
                        if (element.id === term.id) {
                            return true;
                        }
                    });
                    if (idExist === undefined) {
                        this.setState({ querySugList: [...this.state.querySugList, term] })
                    }
                }
            });
        }
    }

    processResponse = (response) => {
        return response.data.terms
    }

    loadConcepts = async () => {
        const query = this.state.queryText
        console.log(query)
        var response = await axios.get('https://hpo.jax.org/api/hpo/search', {
            params: {
                q: query,
            }
        });
        var list = this.processResponse(response)
        console.log(list)
        this.setState({ querySugList: list })
    }

    handleDialogClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            this.setState({ datasetSelectDialogOpen: false });
        }
    }

    handleDtHelperOpen = () => {
        this.setState({ dtHelperOpen: true });
    }
    handleDtHelperClose = () => {
        this.setState({ dtHelperOpen: false });
    }


    handleSubmit = async () => {
        var conceptIdList1 = []
        var conceptIdList2 = []
        console.log(this.state.apiMethod)
        // this.setState({
        //     submitHelperText: this.state.apiMethod === '' ? 'No method provided!' : '',
        //     submitError: this.state.apiMethod === '' ? true : false
        // })
        if (this.state.queryConceptList1.length && !this.state.submitError) {
            const queryList1 = this.state.queryConceptList1.map((concept) => concept.id)
            var response1 = await axios.get('https://rare.cohd.io//api/vocabulary/findConceptByCode', {
                params: {
                    q: queryList1.join(';'),
                }
            });
            conceptIdList1 = response1.data.results.map((result) => result.concept_id)
            this.setState({
                submitHelperText: conceptIdList1.length ? '' : 'No concept found in OARD database for query concept 1!',
                submitError: conceptIdList1.length ? false : true
            })
        }
        if (this.state.queryConceptList2.length && !this.state.submitError) {
            const queryList2 = this.state.queryConceptList2.map((concept) => concept.id)
            var response2 = await axios.get('https://rare.cohd.io//api/vocabulary/findConceptByCode', {
                params: {
                    q: queryList2.join(';'),
                }
            });
            conceptIdList2 = response2.data.results.map((result) => result.concept_id)
            this.setState({
                submitHelperText: conceptIdList2.length ? '' : 'No concept found in OARD database for query concept 2!',
                submitError: conceptIdList2.length ? false : true
            })
        }

        if (!this.state.submitError) {
            if (this.state.domain === 'all') {
                var response = await axios.get('https://rare.cohd.io//api/' + this.state.apiService + '/' + this.state.apiMethod, {
                    params: {
                        dataset_id: parseInt(this.state.dataset),
                        concept: conceptIdList1.join(';'),
                        concept_id: conceptIdList1.join(';'),
                        concept_id_1: conceptIdList1.join(';'),
                        concept_id_2: conceptIdList2.join(';'),
                        top_n: parseInt(this.state.topN)
                    }
                });
            } else {
                var response = await axios.get('https://rare.cohd.io//api/' + this.state.apiService + '/' + this.state.apiMethod, {
                    params: {
                        dataset_id: parseInt(this.state.dataset),
                        concept: conceptIdList1.join(';'),
                        concept_id: conceptIdList1.join(';'),
                        concept_id_1: conceptIdList1.join(';'),
                        concept_id_2: conceptIdList2.join(';'),
                        top_n: parseInt(this.state.topN),
                        domain_id: this.state.domain
                    }
                });
            }

            this.setState({
                apiResults: response.data.results,
                apiResultsDisplayService: this.state.apiService,
                apiResultsDisplayMethod: this.state.apiMethod,
                apiResultsDisplay: true
            })
        }
    }

    render() {


        if (this.state.apiService == 'frequencies') {
            var methodSelectOption =
                <Select
                    value={this.state.apiMethod}
                    label="method"
                    onChange={(event) => this.setState({ apiMethod: event.target.value })
                    }
                >

                    <MenuItem sx={{ display: (this.state.queryConceptList1.length && !this.state.queryConceptList2.length) ? "block" : "none" }}
                        value="singleConceptFreq">singleConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.state.queryConceptList1.length && this.state.queryConceptList2.length) ? "block" : "none" }}
                        value="pairedConceptFreq">pairedConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.state.queryConceptList1.length <= 1 && !this.state.queryConceptList2.length) ? "block" : "none" }}
                        value="mostFrequency">mostFrequency</MenuItem>
                </Select>;

        } else {
            var methodSelectOption =
                <Select
                    value={this.state.apiMethod}
                    label="method"
                    onChange={(event) => {
                        this.setState({ apiMethod: event.target.value });
                        // if(this.state.apiMethod !== ''){
                        //     this.handleSubmit()
                        // }
                    }
                    }
                >
                    <MenuItem value="chiSquare">chiSquare</MenuItem>
                    <MenuItem value="obsExpRatio">obsExpRatio</MenuItem>
                    <MenuItem value="relativeFrequency">relativeFrequency</MenuItem>
                    <MenuItem value="jaccardIndex">jaccardIndex</MenuItem>
                </Select>;
        }

        return (
            <Grid container justifyContent="center">
                <Box sx={{ padding: 2 }}>
                    <Box sx={{ padding: 2 }}>
                        <Autocomplete
                            disablePortal
                            multiple
                            id="combo-box-demo"
                            getOptionLabel={(option) => option.name}
                            options={this.state.querySugList}
                            filterOptions={(x) => x}
                            //user input in the box
                            onInputChange={(event, newInputValue) => {
                                console.log(newInputValue)
                                this.setState({ queryText: newInputValue })
                                if (newInputValue.length > 2) {
                                    this.loadConcepts()
                                    console.log(this.state.querySugList)
                                }
                            }}
                            // user select from suggestion list
                            onChange={(event, newValue) => {
                                const concept = newValue
                                this.setState({ queryConceptList1: [...newValue] })
                                // console.log(this.state.conceptList)
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{
                                        border: 0,
                                        fontSize: 'smaller'
                                    }}> {option.name} </Box>
                                    <Box sx={{
                                        border: 0,
                                        fontWeight: 'light',
                                        textAlign: 'left',
                                        fontStyle: 'oblique',
                                        color: 'grey',
                                        m: 2,
                                        fontSize: 'smaller'
                                    }}>{option.id}</Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Query Concept List 1"
                                    placeholder="add more"
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{ padding: 2 }}>
                        <Autocomplete
                            disablePortal
                            multiple
                            id="combo-box-demo"
                            getOptionLabel={(option) => option.name}
                            options={this.state.querySugList}
                            filterOptions={(x) => x}
                            //user input in the box
                            onInputChange={(event, newInputValue) => {
                                console.log(newInputValue)
                                this.setState({ queryText: newInputValue })
                                if (newInputValue.length > 2) {
                                    this.loadConcepts()
                                    console.log(this.state.querySugList)
                                }
                            }}
                            // user select from suggestion list
                            onChange={(event, newValue) => {
                                const concept = newValue
                                this.setState({ queryConceptList2: [...newValue] })
                                // console.log(this.state.conceptList)
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <Box sx={{
                                        border: 0,
                                        fontSize: 'smaller'
                                    }}> {option.name} </Box>
                                    <Box sx={{
                                        border: 0,
                                        fontWeight: 'light',
                                        textAlign: 'left',
                                        fontStyle: 'oblique',
                                        color: 'grey',
                                        m: 2,
                                        fontSize: 'smaller'
                                    }}>{option.id}</Box>
                                </Box>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    variant="standard"
                                    label="Query Concept List 2"
                                    placeholder="add more"
                                />
                            )}
                        />
                    </Box>
                    <Box sx={{ padding: 2, textAlign: 'center' }} >
                        <Container sx={{ display: 'flex' }}>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>

                                <InputLabel>Dataset<InfoIcon onClick={this.handleDtHelperOpen}></InfoIcon></InputLabel>
                                <Dialog
                                    fullWidth={true}
                                    open={this.state.dtHelperOpen}
                                    onClose={this.handleDtHelperClose}
                                >
                                    <DialogTitle id="alert-dialog-title">
                                    {"Use data select Helper"}
                                    </DialogTitle>
                                     <DialogContent>
                                    <DsHelperComp />
                                    </DialogContent></Dialog>
                                
                                <Select
                                    value={this.state.dataset}
                                    label="Dataset"
                                    onChange={(event) => this.setState({ dataset: event.target.value })
                                    }
                                >


                                    <MenuItem value="1">1 - CUIMC/OHDSI</MenuItem>
                                    <MenuItem value="2">2 - CHOP/Notes</MenuItem>
                                    <MenuItem value="3">3 - CUIMC/Solr</MenuItem>
                                </Select>
                            </FormControl>
                            
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                                <InputLabel>Domain</InputLabel>
                                <Select
                                    value={this.state.domain}
                                    label="Domain"
                                    onChange={(event) => this.setState({ domain: event.target.value })
                                    }
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="phenotypes">Phenotypes/HPO</MenuItem>
                                    <MenuItem value="diseases">Diseases/Mondo</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>

                                <InputLabel>Return </InputLabel>
                                <Select
                                    value={this.state.topN}
                                    label="Top N"
                                    onChange={(event) => this.setState({ topN: event.target.value })
                                    }
                                >
                                    <MenuItem value="10">10</MenuItem>
                                    <MenuItem value="25">25</MenuItem>
                                    <MenuItem value="50">50</MenuItem>
                                    <MenuItem value="100">100</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                                <InputLabel>Service</InputLabel>
                                <Select
                                    value={this.state.queryConceptList1.length ? this.state.apiService : "frequencies"}
                                    label="service"
                                    onChange={(event) => this.setState({
                                        apiService: event.target.value,
                                        apiMethod: event.target.value == 'frequencies' ? 'mostFrequency' : 'jaccardIndex'
                                    })
                                    }
                                >
                                    <MenuItem value="frequencies">frequencies</MenuItem>
                                    <MenuItem value="association" sx={{
                                        display: this.state.queryConceptList1.length ? "inline" : "none"
                                    }}>association</MenuItem>
                                </Select>
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 120 }}>
                                <InputLabel>Method</InputLabel>
                                {methodSelectOption}
                            </FormControl>
                            <FormControl sx={{ m: 1, minWidth: 120 }} error={this.state.submitError}>
                                <Button onClick={this.handleSubmit} size="large" sx={{ textAlign: 'right-center', float: 'right', height: 57 }}>Submit</Button>
                                <FormHelperText>{this.state.submitHelperText}</FormHelperText>
                            </FormControl>
                        </Container>
                    </Box>
                </Box>
                <Box sx={{ padding: 2 }}>
                    <List component="nav" aria-label="mailbox folders">
                        {this.state.apiResultsDisplay &&
                            <ListSubheader>
                                {this.state.apiResults.length} Results returned
                            </ListSubheader>
                        }
                        {this.state.apiResultsDisplay &&
                            this.state.apiResults.map((result, i) =>
                                <SinelgResultDisplayComp key={i} result={result} service={this.state.apiResultsDisplayService} method={this.state.apiResultsDisplayMethod}>{i}</SinelgResultDisplayComp>
                            )
                        }
                    </List>
                </Box>




            </Grid>
        );
    }
}

export default MainComp;