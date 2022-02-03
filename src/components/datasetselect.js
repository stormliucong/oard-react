import React, { Component } from 'react';
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { render } from "@testing-library/react";
import axios from 'axios';
import { csv } from 'csvtojson';
import DsHelperComp from './datasethelper'
import InfoIcon from '@mui/icons-material/Info';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CloseIcon from '@mui/icons-material/Close';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Container from '@mui/material/Container';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';



class DsSelectComp extends Component {
  state = {
    dtHelperOpen: false,
    dataset: "1",
    rows: null,
    columns:
      [
        { field: "id", hide: true },
        { field: "dataset_id", headerName: "dataset_id", width: 100 },
        { field: "clinical_site", headerName: "clinical_site", width: 150 },
        { field: "source", headerName: "source", width: 150 },
        { field: "subclass_category", headerName: "subclass_category", width: 150 },
      ]
  }
  

  getFile = async () => {
    try {
      // generate a request
      var getUrl = window.location;
      var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
      const ax = axios.create({
        baseURL: baseUrl
      })
      let res1 = await ax.get('/dataset.csv');
      // convert the csv to json with the package
      csv({
        noheader: false,
        output: "csv"
      })
        .fromString(res1.data)
        .then((csvRow) => {
          console.log(csvRow);
          // add the JSON to the state
          this.setState({
            rows: csvRow.map((row, i) => {
              return {
                "id": i,
                "dataset_id": row[0],
                "clinical_site": row[1],
                "source": row[2],
                "subclass_category": row[3]
              }
            }
            )
          })
        })
      } catch (err) {
      console.error(err);
    }
  }

    handleDtHelperOpen = () => {
        this.setState({ dtHelperOpen: true });
    }
    handleDtHelperClose = () => {
        this.setState({ dtHelperOpen: false });
    }

    onDatasetSelectChange = (e) =>{
        this.setState({dataset: e.target.value})
        this.props.handleDatasetSelectChange(e.target.value);

    }


  //load only once.
  componentDidMount(){
    this.getFile();
  }
  render() {
   
    return (
        <FormControl sx={{ display: 'flex' }}>

        <InputLabel>Dataset<InfoIcon onClick={this.handleDtHelperOpen}></InfoIcon></InputLabel>
        <Dialog
            fullWidth={true}
            open={this.state.dtHelperOpen}
            onClose={this.handleDtHelperClose}
        >
            <DialogTitle id="alert-dialog-title">
            {"Use data select Helper"}
            </DialogTitle>
             <DialogContent>         
                    <DsHelperComp rows={this.state.rows} columns={this.state.columns} />
            </DialogContent></Dialog>
        
        <Select
            value={this.state.dataset}
            label="Dataset"
            onChange={this.onDatasetSelectChange}
        >
            {
                this.state.rows && 
                this.state.rows.map((row, i) =>
                    <MenuItem key={i} value={row.dataset_id}>{row.dataset_id}</MenuItem>
                )
                

            }

        </Select>
    </FormControl>
    );
  }
}

export default DsSelectComp;