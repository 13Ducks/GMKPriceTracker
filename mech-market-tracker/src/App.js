import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import './App.css';

class HomePage extends Component {
  constructor() {
    super();
    this.state = {
    }
  }


  render() {
    return (
      <div className='app'>
        <Link to='/products/mizu/'>
          <button type="button">
            GMK Mizu
          </button>
        </Link>

      </div>
    );
  }
}

function ProductPage() {
  return <h2>products soon</h2>;
}

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
            <ProductPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>

      </Router>
    );
  }
}
export default App;