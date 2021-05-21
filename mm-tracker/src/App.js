import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase.js';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

class App extends Component {
  constructor() {
    super();
    this.state = {
      setname: '',
      categoryname: '',
      items: [],
      averageMonths: []
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(e) {
    this.setState({
      [e.target.name]: e.target.value
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    let newItems = [];
    let sortingMonths = {};
    let averageMonths = [];
    const db = firebase.firestore();
    db.collection("gmk").doc(this.state.setname).collection('sales')
      .orderBy("date").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(doc.id, " => ", doc.data());
          let newData = doc.data();
          newData.id = doc.id;
          let dateConvert = newData.date.toDate();
          let key = [dateConvert.getFullYear(), dateConvert.getMonth()]
          newData.date = dateConvert.toString();
          if (newData.category == this.state.categoryname) {
            if (sortingMonths[key]) {
              sortingMonths[key].push(newData.price);
            } else {
              sortingMonths[key] = [newData.price];
            }
          }
          newItems.push(newData);


        });
        console.log(sortingMonths);
        for (let key in sortingMonths) {
          if (sortingMonths.hasOwnProperty(key)) {
            const average = sortingMonths[key].reduce((acc, c) => acc + c, 0) / sortingMonths[key].length;
            averageMonths.push({
              month: key,
              average: average,
              quantity: sortingMonths[key].length,
            });
          }

        }
        this.setState({
          currentItem: '',
          items: newItems,
          averageMonths: averageMonths
        });
        console.log(this.state)
      });
  }


  render() {
    let data = [];
    for (let i in this.state.averageMonths) {
      let ob = this.state.averageMonths[i]
      data.push({
        name: ob.month,
        avg: ob.average,
      })
    }

    return (
      <div className='app'>
        <header>
          <div className='wrapper'>
            <h1>Loser's Club</h1>
          </div>
        </header>
        <LineChart
          width={500}
          height={300}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="linear" dataKey="avg" stroke="#82ca9d" />
        </LineChart>
        <div className='container'>

          <section className='add-item'>
            <form onSubmit={this.handleSubmit}>
              <input type="text" name="setname" placeholder="What set" onChange={this.handleChange} value={this.state.setname} />
              <input type="text" name="categoryname" placeholder="What category" onChange={this.handleChange} value={this.state.categoryname} />
              <button>Add Item</button>
            </form>
          </section>
          <section className='display-item'>
            <div className="wrapper">
              <ul>

                {this.state.averageMonths.map((item) => {
                  return (
                    <li key={item.month}>
                      <h3>{item.month}</h3>
                      <p>average: {item.average}</p>
                    </li>
                  )
                })}
                {this.state.items.map((item) => {
                  return (
                    <li key={item.id}>
                      <h3>{item.category}</h3>
                      <p>link: {item.link}</p>
                      <p>price: {item.price}</p>
                      <p>date: {item.date}</p>
                      <p>sets: {item.sets}</p>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
export default App;