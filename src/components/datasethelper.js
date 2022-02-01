import * as React from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

var csv = require("csvtojson");

// function csvJSON(csv){
//   console.log(csv)

//   var lines=csv.split("\n");

//   var result = [];

//   // NOTE: If your columns contain commas in their values, you'll need
//   // to deal with those before doing the next step 
//   // (you might convert them to &&& or something, then covert them back later)
//   // jsfiddle showing the issue https://jsfiddle.net/
//   var headers=lines[0].split(",");

//   for(var i=1;i<lines.length;i++){

//       var obj = {};
//       var currentline=lines[i].split(",");

//       for(var j=0;j<headers.length;j++){
//           obj['id'] = i;
//           obj[headers[j]] = currentline[j];
//       }

//       result.push(obj);

//   }
//   console.log(result)

//   //return result; //JavaScript object
//   return JSON.stringify(result); //JSON
// }
// const rows = csv().fromFile('/dataset.csv');
// console.log(rows)

const rows = [
  { id: 1, dataset_id: "1", clinical_site: "cuimc", source: "ohdsi", subclass_category: 'all' },
  { id: 2, dataset_id: "2", clinical_site: "cuimc", source: "ohdsi", subclass_category: 'all' },
  { id: 3, dataset_id: "3", clinical_site: "chop", source: "notes", subclass_category: 'all' },
  { id: 4, dataset_id: "10", clinical_site: "cuimc", source: "ohdsi", subclass_category: 'neonates (0-2)' },
  { id: 5, dataset_id: "11", clinical_site: "cuimc", source: "ohdsi", subclass_category: 'kid (3-11)' },
  { id: 6, dataset_id: "12", clinical_site: "cuimc", source: "ohdsi", subclass_category: 'teenage (2-17)' }
]

const columns = [
  { field: "id", hide: true },
  { field: "dataset_id",headerName: "dataset_id",width: 100 },
  { field: "clinical_site",headerName: "clinical_site",width: 150 },
  { field: "source",headerName: "source",width: 150 },
  { field: "subclass_category",headerName: "subclass_category",width: 150 },
];

export default function DsHelperComp() {
  return (
    <div style={{ height: 500, width: "100%" }}>
      <DataGrid rows={rows} columns={columns} />
    </div>
  );
}