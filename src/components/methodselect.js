import React, { Component } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


class MethodSelectComp extends Component {

    state = {
        methodHelperOpen: false,
        apiMethod: "mostFrequency",
        rows:
            [
                { id: 1, method: 'singleConceptFreq', desc: 'return clinical frequency of individual concepts' },
                { id: 2, method: 'pairedConceptFreq', desc: 'return clinical frequency of a pair of concepts' },
                { id: 3, method: 'mostFrequency', desc: 'return most frequent single concepts (or concept pairs if one concept 1 is provided)' },
                { id: 4, method: 'chiSquare', desc: 'return chi-square analysis of paired concepts (or top largest chi-square concept pairs if one or more concept 1 are provided' },
                { id: 5, method: 'obsExpRatio', desc: 'return observed count / expected count of paired concepts (or top largest obsExpRatio concept pairs if one or more concept 1 are provided'},
                { id: 6, method: 'relativeFrequency', desc: 'return relative frequency of a pair of concepts (or top largest relativeFrequency concept pairs if one or more concept 1 are provided' },
                { id: 7, method: 'jaccardIndex', desc: 'return Jaccard index of a pair of concepts (or top largest jaccardIndex concept pairs if one or more concept 1 are provided' },

            ],
        columns:
            [
                { field: "method", headerName: "Method", width: 200 },
                { field: "desc", headerName: "Description", width: 1000 },
            ]
    }

    handleMethodHelperOpen = () => {
        this.setState({ methodHelperOpen: true });
    }
    handleMethodHelperClose = () => {
        this.setState({ methodHelperOpen: false });
    }

    onMethodSelectChange = (e) => {
        this.props.handleMethodSelectChange(e.target.value);
    }

    render() {
        if (this.props.apiService == 'frequencies') {
            var methodSelectOption =
                <Select
                    value={this.props.apiMethod}
                    label="method"
                    onChange={this.onMethodSelectChange}
                >

                    <MenuItem sx={{ display: (this.props.queryConceptList1.length && !this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="singleConceptFreq">singleConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.props.queryConceptList1.length && this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="pairedConceptFreq">pairedConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.props.queryConceptList1.length <= 1 && !this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="mostFrequency">{this.props.queryConceptList1.length == 0 ? "mostFrequency (single)" : "mostFrequency (pair)"}</MenuItem>
                </Select>;

        } else {
            var methodSelectOption =
                <Select
                    value={this.props.apiMethod}
                    label="method"
                    onChange={this.onMethodSelectChange}
                >
                    <MenuItem value="chiSquare">chiSquare</MenuItem>
                    <MenuItem value="obsExpRatio">obsExpRatio</MenuItem>
                    <MenuItem value="relativeFrequency">relativeFrequency</MenuItem>
                    <MenuItem value="jaccardIndex">jaccardIndex</MenuItem>
                </Select>;
        }

        return (
            <Grid item xs={12} md={6} lg={2}>
                <FormControl sx={{ display: 'flex' }}>
                    <InputLabel>Method</InputLabel>
                    {methodSelectOption}
                </FormControl>
                <Button sx={{ display: 'block', mt: 2 }} size="small" onClick={this.handleMethodHelperOpen}>
                    How to select method?
                </Button>
                <Dialog
                    fullWidth={true}
                    open={this.state.methodHelperOpen}
                    onClose={this.handleMethodHelperClose}
                >
                    <DialogContent>
                            <div style={{ height: 500, width: "100%" }}>
                                <DataGrid rows={this.state.rows} columns={this.state.columns} />
                            </div >
                        </DialogContent>
                </Dialog>
            </Grid>




        )
    }
}

export default MethodSelectComp;