import React, { Component } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import '../autocomplete.css'
import Container from '@mui/material/Container';



class FormComp extends Component {

    state = {
        queryText: '',
        querySugList: [
            {
                "name": "Abnormality of the musculature",
                "id": "HP:0003011",
                "childrenCount": 612,
                "ontologyId": "HP:0003011",
                "synonym": "Muscular abnormality"
            },
            {
                "name": "Muscle weakness",
                "id": "HP:0001324",
                "childrenCount": 67,
                "ontologyId": "HP:0001324",
                "synonym": "Muscular weakness"
            },
            {
                "name": "Skeletal muscle atrophy",
                "id": "HP:0003202",
                "childrenCount": 33,
                "ontologyId": "HP:0003202",
                "synonym": "Muscular atrophy"
            }],
        queryConceptList1: [],
        queryConceptList2: [],
        dataset: "1",
        domain: "phenotypes",
        topN: "25",
        datasetSelectDialogOpen: false,        
    }


    loadConcepts = async () => {
        const query = this.state.queryText
        console.log(query)
        const response = await axios.get('https://hpo.jax.org/api/hpo/search', {
            params: {
                q: query
            }
        });
        const example = { "terms": [{ "name": "Abnormality of the musculature", "id": "HP:0003011", "childrenCount": 612, "ontologyId": "HP:0003011", "synonym": "Muscular abnormality" }, { "name": "Muscle weakness", "id": "HP:0001324", "childrenCount": 67, "ontologyId": "HP:0001324", "synonym": "Muscular weakness" }, { "name": "Skeletal muscle atrophy", "id": "HP:0003202", "childrenCount": 33, "ontologyId": "HP:0003202", "synonym": "Muscular atrophy" }, { "name": "Spasticity", "id": "HP:0001257", "childrenCount": 22, "ontologyId": "HP:0001257", "synonym": "Muscular spasticity" }, { "name": "Abnormal soft palate morphology", "id": "HP:0100736", "childrenCount": 18, "ontologyId": "HP:0100736", "synonym": "Abnormality of the muscular palate" }, { "name": "Skeletal muscle hypertrophy", "id": "HP:0003712", "childrenCount": 15, "ontologyId": "HP:0003712", "synonym": "Muscular hypertrophy" }, { "name": "Hypotonia", "id": "HP:0001252", "childrenCount": 13, "ontologyId": "HP:0001252", "synonym": "Muscular hypotonia" }, { "name": "Abnormal synaptic transmission at the neuromuscular junction", "id": "HP:0003398", "childrenCount": 13, "ontologyId": "HP:0003398", "synonym": null }, { "name": "Fatigable weakness", "id": "HP:0003473", "childrenCount": 9, "ontologyId": "HP:0003473", "synonym": "Proximal muscle weakness due to defect at the neuromuscular junction" }, { "name": "Distal amyotrophy", "id": "HP:0003693", "childrenCount": 9, "ontologyId": "HP:0003693", "synonym": "Distal muscular atrophy" }], "termsTotalCount": 60, "termsOffset": 0, "diseases": [{ "db": "ORPHA", "dbName": "Alpha-dystroglycan-related  Limb-girdle Muscular Dystrophy R16", "dbRef": "280333", "diseaseId": "ORPHA:280333" }, { "db": "ORPHA", "dbName": "Alpha-sarcoglycan-related  Limb-girdle Muscular Dystrophy R3", "dbRef": "62", "diseaseId": "ORPHA:62" }, { "db": "OMIM", "dbName": "Amino Aciduria With Mental Deficiency, Dwarfism, Muscular Dystrophy,osteoporosis, And Acidosis", "dbRef": "204730", "diseaseId": "OMIM:204730" }, { "db": "ORPHA", "dbName": "Anoctamin-5-related  Limb-girdle Muscular Dystrophy R12", "dbRef": "206549", "diseaseId": "ORPHA:206549" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Congenital Benign Spinal Muscular Atrophy", "dbRef": "1216", "diseaseId": "ORPHA:1216" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Emery-dreifuss Muscular Dystrophy", "dbRef": "98853", "diseaseId": "ORPHA:98853" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Limb-girdle Muscular Dystrophy Type 1a", "dbRef": "266", "diseaseId": "ORPHA:266" }, { "db": "ORPHA", "dbName": "Autosomal Recessive Emery-dreifuss Muscular Dystrophy", "dbRef": "98855", "diseaseId": "ORPHA:98855" }, { "db": "ORPHA", "dbName": "Becker Muscular Dystrophy", "dbRef": "98895", "diseaseId": "ORPHA:98895" }, { "db": "ORPHA", "dbName": "Beta-sarcoglycan-related  Limb-girdle Muscular Dystrophy R4", "dbRef": "119", "diseaseId": "ORPHA:119" }], "diseasesTotalCount": 190, "diseasesOffset": 0, "genes": [], "genesTotalCount": 0, "genesOffset": 0 }
        this.setState({ querySugList: response.data.terms })
    }

    handleDialogClose = (event, reason) => {
        if (reason !== 'backdropClick') {
            this.setState({ datasetSelectDialogOpen: false });
        }
    }

    render() {
        return (
            <Box>
                <Box sx={{padding:2}}>
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
                                console.log('new value', newValue)
                                this.setState({ queryConceptList1: [...newValue] })
                                // console.log(this.state.conceptList)
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <div className="hpid">{option.id} </div> <div className="hpname">{option.name}</div>
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
                <Box sx={{padding:2}}>
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
                                console.log('new value', newValue)
                                this.setState({ queryConceptList2: [...newValue] })
                                // console.log(this.state.conceptList)
                            }}
                            renderOption={(props, option) => (
                                <Box component="li" {...props}>
                                    <div className="hpid">{option.id} </div> <div className="hpname">{option.name}</div>
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
                <Box sx={{padding:2, textAlign: 'center'}} >
                <Container sx={{ display: 'flex'}}>
                <Grid item lg={3}>        
                    <InputLabel>Dataset</InputLabel>
                    <Select sx={{width:200}}
                        value={this.state.dataset}
                        label="Dataset"
                        onChange={(event) => this.setState({ dataset: event.target.value })
                        }
                    >
                        <MenuItem value="1">1 - CUIMC/OHDSI</MenuItem>
                        <MenuItem value="2">2 - CHOP/Notes</MenuItem>
                        <MenuItem value="3">3 - CUIMC/Solr</MenuItem>
                    </Select>
                    </Grid>
                    <Grid item lg={3}>   
                    <InputLabel>Domain</InputLabel>
                    <Select sx={{width:200}}
                        value={this.state.domain}
                        label="Domain"
                        onChange={(event) => this.setState({ domain: event.target.value })
                        }
                    >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="phenotypes">Phenotypes/HPO</MenuItem>
                        <MenuItem value="diseases">Diseases/Mondo</MenuItem>
                    </Select>
                    </Grid>

                    <Grid item lg={3}>   
                    <InputLabel>Display Top </InputLabel>
                    <Select sx={{width:200}}
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
                    </Grid>
                    </Container>
                </Box>
            </Box>
        );
    }
}

export default FormComp;