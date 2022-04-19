import React, { Component } from 'react';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import axios from 'axios';
import FormHelperText from '@mui/material/FormHelperText';

class SubmitComp extends Component {

    state = {
        submitError: '',
        submitHelperText : ''
    }

    handleSubmit = async () => {
        var conceptIdList1 = []
        var conceptIdList2 = []
        if (this.props.queryConceptList1.length && !this.state.submitError) {
            const queryList1 = this.props.queryConceptList1.map((concept) => concept.id)
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
        if (this.props.queryConceptList2.length && !this.state.submitError) {
            const queryList2 = this.props.queryConceptList2.map((concept) => concept.id)
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
            if (this.props.domain === 'all') {
                var response = await axios.get('https://rare.cohd.io//api/' + this.props.apiService + '/' + this.props.apiMethod, {
                    params: {
                        dataset_id: parseInt(this.props.dataset),
                        concept: conceptIdList1.join(';'),
                        concept_id: conceptIdList1.join(';'),
                        concept_id_1: conceptIdList1.join(';'),
                        concept_id_2: conceptIdList2.join(';'),
                        top_n: parseInt(this.props.topN)
                    }
                });
            } else {
                var response = await axios.get('https://rare.cohd.io//api/' + this.props.apiService + '/' + this.props.apiMethod, {
                    params: {
                        dataset_id: parseInt(this.props.dataset),
                        concept: conceptIdList1.join(';'),
                        concept_id: conceptIdList1.join(';'),
                        concept_id_1: conceptIdList1.join(';'),
                        concept_id_2: conceptIdList2.join(';'),
                        top_n: parseInt(this.props.topN),
                        domain_id: this.props.domain
                    }
                });
            }
            this.props.handleSubmitChange(response.data.results)
        }
    }

    render() {

        return (
            <Grid item container xs={12} md={6} lg={2} justifyContent="center">
                <FormControl error={this.state.submitError} sx={{ display: 'flex' }}>
                    <Button variant="contained" onClick={this.handleSubmit} size="large">Submit</Button>
                    <FormHelperText>{this.state.submitHelperText}</FormHelperText>
                </FormControl>
            </Grid>
        )

    }
}
export default SubmitComp;
