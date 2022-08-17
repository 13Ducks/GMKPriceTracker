import React, { Component } from 'react';
import {
  HashRouter as Router,
  Switch,
  Route,
} from "react-router-dom";

import './App.css';
import HomePage from './Home.js'
import ProductPage from './Product.js';
import NavBar from './NavBar';
import { Layout } from 'antd';

class App extends Component {
  constructor() {
    super();
    this.state = {
    }
  }

  render() {
    return (
      <Layout className="layout">
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
      </Layout>
    );
  }
}
export default App;