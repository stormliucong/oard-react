import React from "react";
import './App.css'
import AppBarComp from './components/appbar'
import MainComp from './components/main'
import CardComp from "./components/card";
import { Grid } from '@mui/material';

function App() {
  return (
    <React.Fragment>
        <AppBarComp />
        <CardComp />
        <MainComp />
    </React.Fragment>
  );
}

export default App;
