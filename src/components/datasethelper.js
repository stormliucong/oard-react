import React, { Component } from 'react';
import { DataGrid} from "@mui/x-data-grid";


class DsHelperComp extends Component {
  // state = {
  //   rows: null,
  //   columns:
  //     [
  //       { field: "id", hide: true },
  //       { field: "dataset_id", headerName: "dataset_id", width: 100 },
  //       { field: "clinical_site", headerName: "clinical_site", width: 150 },
  //       { field: "source", headerName: "source", width: 150 },
  //       { field: "subclass_category", headerName: "subclass_category", width: 150 },
  //     ]
  // }
  

  // getFile = async () => {
  //   try {
  //     // generate a request
  //     const ax = axios.create({
  //       baseURL: 'http://localhost:3000/'
  //     })
  //     let res1 = await ax.get('/dataset.csv');
  //     // convert the csv to json with the package
  //     csv({
  //       noheader: false,
  //       output: "csv"
  //     })
  //       .fromString(res1.data)
  //       .then((csvRow) => {
  //         console.log(csvRow);
  //         // add the JSON to the state
  //         this.setState({
  //           rows: csvRow.map((row, i) => {
  //             return {
  //               "id": i,
  //               "dataset_id": row[0],
  //               "clinical_site": row[1],
  //               "source": row[2],
  //               "subclass_category": row[3]
  //             }
  //           }
  //           )
  //         })
  //       })
  //     } catch (err) {
  //     console.error(err);
  //   }
  // }

  // //load only once.
  // componentDidMount(){
  //   this.getFile();
  // }
  render() {
    console.log(this.props.rows)
   
    return (
      <div style={{ height: 500, width: "100%" }}>
        <DataGrid rows={this.props.rows} columns={this.props.columns} />
      </div >
    );
  }
}

export default DsHelperComp;