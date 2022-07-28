import React, { Component } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';




class ServiceSelectComp extends Component {

    state = {
        serviceHelperOpen: false
    }

    handleServiceHelperOpen = () => {
        this.setState({ serviceHelperOpen: true });
    }
    handleServiceHelperClose = () => {
        this.setState({ serviceHelperOpen: false });
    }

    onServiceSelectChange = (e) => {
        this.props.handleServiceSelectChange(e.target.value);
    }

    render() {
        return (
            <Grid item xs={12} md={6} lg={2}>


                <FormControl sx={{ display: 'flex' }}>
                    <InputLabel>Service </InputLabel>

                    <Select
                        value={this.props.apiService}
                        label="service"
                        displayEmpty
                        onChange={this.onServiceSelectChange}
                    >
                        <MenuItem value="frequencies">frequencies</MenuItem>
                        <MenuItem value="association" sx={{
                            display: this.props.queryConceptList1.length ? "inline" : "none"
                        }}>association</MenuItem>
                    </Select>
                </FormControl>
                <Button sx={{ display: 'block', mt: 2 }} size="small" onClick={this.handleServiceHelperOpen}>
                    How to select service?
                </Button>
                <Dialog
                    fullWidth={true}
                    open={this.state.serviceHelperOpen}
                    onClose={this.handleServiceHelperClose}
                >
                    <DialogContent>
                        <b> Frequencies</b>: OARD will return single or concept pair counts and frequencies; <b> Association</b>: OARD will return asssociations based on statistics.
                    </DialogContent>
                </Dialog>
            </Grid>




        )
    }
}

export default ServiceSelectComp;
