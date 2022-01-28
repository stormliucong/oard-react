import React from "react";
import './App.css'
import NavBarComp from './components/navbar'
import MainComp from './components/main'
import IntroComp from "./components/intro";

function App() {
  return (
    <React.Fragment>
      <NavBarComp />
      <IntroComp />
      <MainComp />
    </React.Fragment>
  );
}

export default App;
