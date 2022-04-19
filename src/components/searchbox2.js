import React, { Component } from 'react';
import axios from 'axios';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';

class SearchBox2Comp extends Component {

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
        queryConceptList2: []
    }

    loadConceptsEbi = async (q) => {
        const query = q
        console.log(query)
        var response = await axios.get('https://www.ebi.ac.uk/ols/api/select', {
            params: {
                q: query,
                rows: 50,
                ontology: 'hp,omim,mondo,ordo'
            }
        });
        // this.setState({ querySugList: [] })
        var resultList = response.data.response.docs
        console.log(resultList)
        var terms = []
        var idCheck = {}
        if (resultList.length > 0) {
            resultList.forEach((doc) => {
                // console.log(doc)
                if(doc.obo_id  !== undefined){
                    if (doc.obo_id.startsWith('MONDO:') || doc.obo_id.startsWith('HP:') || doc.obo_id.startsWith('Orphanet:') || doc.obo_id.startsWith('OMIM:')) {
                        
                        // term.group = doc.obo_id.startsWith('MONDO:') ? 'MONDO DISEASE' : 'HPO Phenotype'
                        var label = doc.label
                        var id = doc.obo_id
                        if(idCheck[id] === undefined){
                            idCheck[id] = 1
                            terms.push({"id": id, "name": label})
                        }
                    }
                }
                
            });
        }
        this.setState({ querySugList: terms })
    }

    onSearchBox1Change = (event, newValue) => {
        this.setState({ queryConceptList2: [...newValue] })
        this.props.handleSearchBox2SelectChange(newValue)
    }

    

    render() {
        return (
                <Autocomplete
                    sx={{ display: 'flex' }}
                    disablePortal
                    multiple
                    id="combo-box-demo"
                    getOptionLabel={(option) => option.name + " [" + option.id + "]"}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    options={this.state.querySugList}
                    filterOptions={(x) => x}
                    //user input in the box
                    onInputChange={(event, newInputValue) => {
                        this.setState({ queryText: newInputValue })
                        if (newInputValue.length > 2) {
                            this.loadConceptsEbi(newInputValue)
                        }
                    }}
                    // user select from suggestion list
                    onChange={this.onSearchBox2Change}
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
                            label="Query Concept List 2 (Leave blank for most frequent single concept)"
                            placeholder="add more"
                        />
                    )}
                />


        )
    }
}
export default SearchBox2Comp;