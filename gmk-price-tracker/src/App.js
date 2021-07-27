import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import './App.css';
import HomePage from './Home.js'
import ProductPage from './Product.js';
import NavBar from './NavBar';

class App extends Component {
  constructor() {
    super();
    this.state = {
    }
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route path="/products">
            <NavBar />
            <ProductPage />
          </Route>
          <Route path="/">
            <NavBar />
            <HomePage />
          </Route>
        </Switch>

      </Router>
    );
  }
}
export default App;