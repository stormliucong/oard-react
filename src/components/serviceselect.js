import React, { Component } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';


class ServiceSelectComp extends Component {

    state = {
        serviceHelperOpen: false,
        apiService: "frequencies",
        rows:
            [
                { id: 1, service: 'frequencies', desc: 'return absoulte count and frequencies.' },
                { id: 2, service: 'association', desc: 'return statistic based associations.' },
            ],
        columns:
            [
                { field: "service", headerName: "Service", width: 200 },
                { field: "desc", headerName: "Description", width: 500 },
            ]
    }

    handleServiceHelperOpen = () => {
        this.setState({ serviceHelperOpen: true });
    }
    handleServiceHelperClose = () => {
        this.setState({ serviceHelperOpen: false });
    }

    onServiceSelectChange = (e) => {
        this.setState({ apiService: e.target.value })
        this.props.handleServiceSelectChange(e.target.value);
    }

    render() {
        return (
            <FormControl sx={{ display: 'flex' }}>
                <InputLabel>Service<InfoIcon onClick={this.handleServiceHelperOpen}></InfoIcon></InputLabel>
                <Dialog
                    fullWidth={true}
                    open={this.state.serviceHelperOpen}
                    onClose={this.handleServiceHelperClose}
                >
                    <DialogTitle id="alert-dialog-title">
                        {"Use service select Helper"}
                    </DialogTitle>
                    <DialogContent>
                        <div style={{ height: 500, width: "100%" }}>
                            <DataGrid rows={this.state.rows} columns={this.state.columns} />
                        </div >
                    </DialogContent>
                </Dialog>
                <Select
                    value={this.props.queryConceptList1.length ? this.state.apiService : "frequencies"}
                    label="service"
                    onChange={this.onServiceSelectChange}
                >
                    <MenuItem value="frequencies">frequencies</MenuItem>
                    <MenuItem value="association" sx={{
                        display: this.props.queryConceptList1.length ? "inline" : "none"
                    }}>association</MenuItem>
                </Select>
            </FormControl>



        )
    }
}

export default ServiceSelectComp;