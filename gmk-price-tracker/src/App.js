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
import { Layout } from 'antd';

const basename = document.querySelector('base')?.getAttribute('href') ?? '/'

class App extends Component {
  constructor() {
    super();
    this.state = {
    }
  }

  render() {
    return (
      <Layout className="layout">
        <Router basename={basename}>
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