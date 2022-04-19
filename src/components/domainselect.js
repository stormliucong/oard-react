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

class DomainSelectComp extends Component {

    state = {
        domainHelperOpen: false,
        rows:
            [
                {id : 1, domain: 'All', desc: 'return both HPO and MONDO terms'},
                {id : 2, domain: 'Phenotypes/HPO', desc: 'only return HPO terms'},
                {id : 3, domain: 'Diseases/Mondo', desc: 'only return MONDO terms'}
            ],
        columns:
            [
                { field: "domain", headerName: "Domain", width: 200 },
                { field: "desc", headerName: "Description", width: 500 },
            ]
    }

    handleDomainHelperOpen = () => {
        this.setState({ domainHelperOpen: true });
    }
    handleDomainHelperClose = () => {
        this.setState({ domainHelperOpen: false });
    }

    onDomainSelectChange = (e) => {
        this.setState({ domain: e.target.value })
        this.props.handleDomainSelectChange(e.target.value);
    }

    render() {

        return (
            <Grid item xs={12} md={6} lg={2}>
                <FormControl sx={{ display: 'flex' }} disabled={this.props.queryConceptList2.length != 0 || this.props.apiMethod == "singleConceptFreq" ? true : false}>
                <InputLabel>Domain</InputLabel>
                <Select
                    value={this.props.domain}
                    label="Domain"
                    onChange={this.onDomainSelectChange}
                >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="phenotypes">Phenotypes/HPO</MenuItem>
                    <MenuItem value="diseases">Diseases/Mondo</MenuItem>
                </Select>
            </FormControl>
            <Button sx={{ display: 'block', mt: 2 }} size="small" onClick={this.handleDomainHelperOpen}>
                    How to select domain?
                </Button>    
                <Dialog
                    fullWidth={true}
                    open={this.state.domainHelperOpen}
                    onClose={this.handleDomainHelperClose}
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

export default DomainSelectComp;