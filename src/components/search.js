import React, { Component } from 'react';
import axios from 'axios';
import { Container, Form, Row, Col, Button } from 'react-bootstrap';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { Box } from '@mui/system';
import '../autocomplete.css'



class SearchComp extends Component {

    state = { text: '', sugList: [{ "name": "Abnormality of the musculature", "id": "HP:0003011", "childrenCount": 612, "ontologyId": "HP:0003011", "synonym": "Muscular abnormality" }, { "name": "Muscle weakness", "id": "HP:0001324", "childrenCount": 67, "ontologyId": "HP:0001324", "synonym": "Muscular weakness" }, { "name": "Skeletal muscle atrophy", "id": "HP:0003202", "childrenCount": 33, "ontologyId": "HP:0003202", "synonym": "Muscular atrophy" }], conceptList: [] }

    handleChange = (event) => {
        const InputText = event.target.value
        console.log(InputText)
        this.setState({ text: InputText })
        if (InputText.length > 2) {
            this.loadConcepts()
            console.log(this.state.sugList)
        }
    }

    handleSuggest = (i) => {
        console.log(this.state)
        const concept = this.state.sugList[i]
        this.setState({ text: '' })
        // this.setState(prevState => ({
        //     conceptList: [...prevState.conceptList, {name: concept.first_name, email: concept.email}]
        // }))

        this.setState({ conceptList: [...this.state.conceptList, concept] })
        this.setState({ sugList: [] })
    }

    handleRemove = (i) => {
        this.setState({
            conceptList: this.state.conceptList.filter((_, index) => {
                return i !== index
            })
        });
    }

    handleSubmit = (event) => {
        event.preventDefault()
        this.handleSearch(this.state.value)
    }
    loadConcepts = async () => {
        const query = this.state.text
        const response = await axios.get('https://hpo.jax.org/api/hpo/search', {
            params: {
                q: query
            }
        });
        const example = { "terms": [{ "name": "Abnormality of the musculature", "id": "HP:0003011", "childrenCount": 612, "ontologyId": "HP:0003011", "synonym": "Muscular abnormality" }, { "name": "Muscle weakness", "id": "HP:0001324", "childrenCount": 67, "ontologyId": "HP:0001324", "synonym": "Muscular weakness" }, { "name": "Skeletal muscle atrophy", "id": "HP:0003202", "childrenCount": 33, "ontologyId": "HP:0003202", "synonym": "Muscular atrophy" }, { "name": "Spasticity", "id": "HP:0001257", "childrenCount": 22, "ontologyId": "HP:0001257", "synonym": "Muscular spasticity" }, { "name": "Abnormal soft palate morphology", "id": "HP:0100736", "childrenCount": 18, "ontologyId": "HP:0100736", "synonym": "Abnormality of the muscular palate" }, { "name": "Skeletal muscle hypertrophy", "id": "HP:0003712", "childrenCount": 15, "ontologyId": "HP:0003712", "synonym": "Muscular hypertrophy" }, { "name": "Hypotonia", "id": "HP:0001252", "childrenCount": 13, "ontologyId": "HP:0001252", "synonym": "Muscular hypotonia" }, { "name": "Abnormal synaptic transmission at the neuromuscular junction", "id": "HP:0003398", "childrenCount": 13, "ontologyId": "HP:0003398", "synonym": null }, { "name": "Fatigable weakness", "id": "HP:0003473", "childrenCount": 9, "ontologyId": "HP:0003473", "synonym": "Proximal muscle weakness due to defect at the neuromuscular junction" }, { "name": "Distal amyotrophy", "id": "HP:0003693", "childrenCount": 9, "ontologyId": "HP:0003693", "synonym": "Distal muscular atrophy" }], "termsTotalCount": 60, "termsOffset": 0, "diseases": [{ "db": "ORPHA", "dbName": "Alpha-dystroglycan-related  Limb-girdle Muscular Dystrophy R16", "dbRef": "280333", "diseaseId": "ORPHA:280333" }, { "db": "ORPHA", "dbName": "Alpha-sarcoglycan-related  Limb-girdle Muscular Dystrophy R3", "dbRef": "62", "diseaseId": "ORPHA:62" }, { "db": "OMIM", "dbName": "Amino Aciduria With Mental Deficiency, Dwarfism, Muscular Dystrophy,osteoporosis, And Acidosis", "dbRef": "204730", "diseaseId": "OMIM:204730" }, { "db": "ORPHA", "dbName": "Anoctamin-5-related  Limb-girdle Muscular Dystrophy R12", "dbRef": "206549", "diseaseId": "ORPHA:206549" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Congenital Benign Spinal Muscular Atrophy", "dbRef": "1216", "diseaseId": "ORPHA:1216" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Emery-dreifuss Muscular Dystrophy", "dbRef": "98853", "diseaseId": "ORPHA:98853" }, { "db": "ORPHA", "dbName": "Autosomal Dominant Limb-girdle Muscular Dystrophy Type 1a", "dbRef": "266", "diseaseId": "ORPHA:266" }, { "db": "ORPHA", "dbName": "Autosomal Recessive Emery-dreifuss Muscular Dystrophy", "dbRef": "98855", "diseaseId": "ORPHA:98855" }, { "db": "ORPHA", "dbName": "Becker Muscular Dystrophy", "dbRef": "98895", "diseaseId": "ORPHA:98895" }, { "db": "ORPHA", "dbName": "Beta-sarcoglycan-related  Limb-girdle Muscular Dystrophy R4", "dbRef": "119", "diseaseId": "ORPHA:119" }], "diseasesTotalCount": 190, "diseasesOffset": 0, "genes": [], "genesTotalCount": 0, "genesOffset": 0 }
        this.setState({ sugList: response.data.terms})
    }

    render() {
        return (
            <Container>
                <Autocomplete
                    disablePortal
                    multiple
                    id="combo-box-demo"
                    getOptionLabel={(option) => option.name}
                    options={this.state.sugList}
                    filterOptions={(x) => x}
                    sx={{ width: 300 }}
                    onInputChange={(event, newInputValue) => {
                        console.log(newInputValue)
                        if (newInputValue.length > 2) {
                            this.state.text = newInputValue
                            this.loadConcepts()
                            console.log(this.state.sugList)
                        }
                    }}
                    onChange={(event, newValue) => {
                        const concept = newValue
                        this.setState({ conceptList: [...newValue] })
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
                          label="Phenotypes"
                          placeholder="add more"
                        />
                      )}
                />
                {/* {this.state.conceptList && this.state.conceptList.map((c, i) =>
                        <Row key={i}><Col>{c.id}</Col><Col>{c.name}</Col><Col><Button onClick={() => this.handleRemove(i)}>Remove</Button></Col></Row>
                    )
                } */}

                {/* <Form className="justify-content-center">
                    <div className="input" >
                        <input type='text' className="form-control mr-sm-2" 
                        placeholder='type a term' 
                        value={this.state.text} aria-label="Search" 
                        onChange={this.handleChange} 
                        onBlur={() => {
                            setTimeout(() =>{
                                this.setState({ sugList: [] })
                                this.setState({ text: '' })
                            },100
                            )

                        }} />
                    </div>
                    {this.state.sugList && this.state.sugList.map((s, i) =>
                        <div key={i} className='suggestion input' onClick={() => this.handleSuggest(i)}>{s.id} | {s.name}</div>
                    )
                    }
                    {this.state.conceptList && this.state.conceptList.map((c, i) =>
                        <Row key={i}><Col>{c.id}</Col><Col>{c.name}</Col><Col><Button onClick={() => this.handleRemove(i)}>Remove</Button></Col></Row>
                    )
                    }
                </Form> */}

            </Container>
        );
    }
}

export default SearchComp;