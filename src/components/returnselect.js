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


class ReturnSelectComp extends Component {

    state = {
        returnHelperOpen: false,
        topN: "25",
    }

    handleReturnHelperOpen = () => {
        this.setState({ returnHelperOpen: true });
    }
    handleReturnHelperClose = () => {
        this.setState({ returnHelperOpen: false });
    }

    onReturnSelectChange = (e) => {
        this.setState({ topN: e.target.value })
        this.props.handleReturnSelectChange(e.target.value);
    }

    render() {

        return (
            <FormControl sx={{ display: 'flex' }}>
                <InputLabel>Return<InfoIcon onClick={this.handleReturnHelperOpen}></InfoIcon></InputLabel>
                <Dialog
                    fullWidth={true}
                    open={this.state.returnHelperOpen}
                    onClose={this.handleReturnHelperClose}
                >
                    <DialogTitle id="alert-dialog-title">
                        {"return top ranked results"}
                    </DialogTitle>
                </Dialog>

                    <Select
                        value={this.state.topN}
                        label="Top N"
                        onChange={this.onReturnSelectChange}
                    >
                        <MenuItem value="10">10</MenuItem>
                        <MenuItem value="25">25</MenuItem>
                        <MenuItem value="50">50</MenuItem>
                        <MenuItem value="100">100</MenuItem>
                        <MenuItem value="100">500</MenuItem>
                    </Select>
            </FormControl>

        )
    }
}

export default ReturnSelectComp;