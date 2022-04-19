import React, { Component } from 'react';
import axios from 'axios';
import { csv } from 'csvtojson';
import DsHelperComp from './datasethelper'
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';


class DsSelectComp extends Component {
  state = {
    dtHelperOpen: false,
    rows: null,
    columns:
      [
        { field: "id", hide: true },
        { field: "short_name", headName: "dataset_name", hide: true },
        { field: "dataset_id", headerName: "dataset_id", width: 100 },
        { field: "clinical_site", headerName: "clinical_site", width: 100 },
        { field: "source", headerName: "source", width: 100 },
        { field: "subpopulation", headerName: "subpopulation", width: 150 },
        { field: "subclass_category", headerName: "subclass_category", width: 300 },
      ]
  }


  getFile = async () => {
    try {
      // generate a request
      var getUrl = window.location;
      var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
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
                "short_name": row[0] + '-' + row[4] + ' (' + row[1] + '/' + row[2] + ')',
                "dataset_id": row[0],
                "clinical_site": row[1],
                "source": row[2],
                "subpopulation": row[3],
                "subclass_category": row[4]
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

  onDatasetSelectChange = (e) => {
    this.props.handleDatasetSelectChange(e.target.value);

  }


  //load only once.
  componentDidMount() {
    this.getFile();
  }
  render() {

    return (
      <Grid item xs={12} md={6} lg={2}>
        <FormControl sx={{ display: 'flex' }}>

          <InputLabel>Dataset</InputLabel>
          <Select
            value={this.props.dataset}
            label="Dataset"
            onChange={this.onDatasetSelectChange}
          >
            {
              this.state.rows &&
              this.state.rows.map((row, i) =>
                <MenuItem key={i} value={row.dataset_id}>{row.short_name}</MenuItem>
              )


            }

          </Select>
        </FormControl>
        <Button sx={{ display: 'block', mt: 2 }} size="small" onClick={this.handleDtHelperOpen}>
          How to select dataset?
        </Button>
        <Dialog
          fullWidth={true}
          open={this.state.dtHelperOpen}
          onClose={this.handleDtHelperClose}
        >
          <DialogContent>
            <DsHelperComp rows={this.state.rows} columns={this.state.columns} />
          </DialogContent></Dialog>
      </Grid>

    );
  }
}

export default DsSelectComp;