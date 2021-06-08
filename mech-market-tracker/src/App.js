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
import db from './firebase.js';

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
  const { path, url } = useRouteMatch();
  return (
    <div>
      <Switch>
        <Route exact path={path}>
          <h3>Please select a product.</h3>
        </Route>
        <Route path={`${path}/:productID`}>
          <Product />
        </Route>
      </Switch>
    </div>
  );
}

function Product() {

  const { productID } = useParams();
  let gmkID = "gmk " + productID

  console.log("outside firebase " + Date.now())
  db.collection("gmk").doc(gmkID).collection('sales')
    .orderBy("date").get().then(querySnapshot => {
      console.log("inside firebase " + Date.now())

      querySnapshot.forEach(doc => {
        let newData = doc.data();
        console.log(newData, doc.id)
      })
    })

  return (
    <div>
      {gmkID}
    </div>
  );
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