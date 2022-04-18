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


class MethodSelectComp extends Component {

    state = {
        methodHelperOpen: false,
        apiMethod: "association",
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

    handleMethodHelperOpen = () => {
        this.setState({ methodHelperOpen: true });
    }
    handleMethodHelperClose = () => {
        this.setState({ methodHelperOpen: false });
    }

    onMethodSelectChange = (e) => {
        this.setState({ apiMethod: e.target.value })
        this.props.handleMethodSelectChange(e.target.value);
    }

    render() {
        if (this.props.apiService == 'frequencies') {
            var methodSelectOption =
                <Select
                    value={this.state.apiMethod}
                    label="method"
                    onChange={this.onMethodSelectChange}
                >

                    <MenuItem sx={{ display: (this.props.queryConceptList1.length && !this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="singleConceptFreq">singleConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.props.queryConceptList1.length && this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="pairedConceptFreq">pairedConceptFreq</MenuItem>
                    <MenuItem sx={{ display: (this.props.queryConceptList1.length <= 1 && !this.props.queryConceptList2.length) ? "block" : "none" }}
                        value="mostFrequency">mostFrequency</MenuItem>
                </Select>;

        } else {
            var methodSelectOption =
                <Select
                    value={this.state.apiMethod}
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
            <FormControl sx={{ display: 'flex' }}>
                <InputLabel>Service<InfoIcon onClick={this.handleMethodHelperOpen}></InfoIcon></InputLabel>
                <Dialog
                    fullWidth={true}
                    open={this.state.methodHelperOpen}
                    onClose={this.handleMethodHelperClose}
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
                {methodSelectOption}
            </FormControl>



        )
    }
}

export default MethodSelectComp;