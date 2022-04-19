import React, { Component } from 'react';
import InfoIcon from '@mui/icons-material/Info';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

class ReturnSelectComp extends Component {

    state = {
        returnHelperOpen: false
    }

    handleReturnHelperOpen = () => {
        this.setState({ returnHelperOpen: true });
    }
    handleReturnHelperClose = () => {
        this.setState({ returnHelperOpen: false });
    }

    onReturnSelectChange = (e) => {
        this.props.handleReturnSelectChange(e.target.value);
    }

    render() {

        return (
            <Grid item xs={12} md={6} lg={2}>
                <FormControl sx={{ display: 'flex' }} disabled={this.props.queryConceptList2.length != 0 || this.props.apiMethod == "singleConceptFreq" ? true : false}>
                    <InputLabel>Return</InputLabel>
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
                        value={this.props.topN}
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
                <Button sx={{ display: 'block', mt: 2 }} size="small" onClick={this.handleReturnHelperOpen}>
                    How to select return?
                </Button>    
                <Dialog
                    fullWidth={true}
                    open={this.state.returnHelperOpen}
                    onClose={this.handleReturnHelperClose}
                >
                    <DialogContent>
                        Return top N results when no concept 2 list is provided. When concept 2 is provided, this parameter is disabled.
                    </DialogContent>
                </Dialog>
            </Grid>


        )
    }
}

export default ReturnSelectComp;