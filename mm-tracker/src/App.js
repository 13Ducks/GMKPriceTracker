import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import db from './firebase.js';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function CustomTooltip({ payload, label, active }) {
  if (active && payload) {
    let p = [];
    const categories = ['base', 'bundle', 'single', 'other']
    for (let i in payload[0].payload) {
      if (categories.includes(i)) {
        p.push(<p className='tooltip-content'>{i}: ${Math.round(payload[0].payload[i])}, {payload[0].payload[(i + "_q")]} units</p>)
      }

    }
    return (
      <div className='custom-toolip'>
        <p className='tooltip-label'>{label}</p>
        {p}
      </div>
    );
  }

  return null;
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      setname: '',
      categoryname: '',
      items: [],
      averageMonths: [],
      categoryMonths: {},
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
    let sortByCategory = {};
    let sortingMonths = {};
    let averageMonths = [];
    let categoryMonths = {};
    // GOAL IS TO BE ABLE TO GET LAYERED OBJECT OF CATEGORY -> MONTH
    db.collection("gmk").doc(this.state.setname).collection('sales')
      .orderBy("date").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          let newData = doc.data();
          newData.id = doc.id;
          let dateConvert = newData.date.toDate();
          let key = [dateConvert.getFullYear(), dateConvert.getMonth()]

          if (sortByCategory[key]) {
            let c = sortByCategory[key]
            if (c[newData.category]) {
              c[newData.category].push(newData.price)
            } else {
              c[newData.category] = [newData.price];
            }
          } else {
            sortByCategory[key] = { [newData.category]: [newData.price] }
          }

          console.log(sortByCategory)



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

        for (let keyMonth in sortByCategory) {
          if (sortByCategory.hasOwnProperty(keyMonth)) {
            let o = sortByCategory[keyMonth];

            let a = [];
            for (let keyCategory in o) {
              if (o.hasOwnProperty(keyCategory)) {
                const average = o[keyCategory].reduce((acc, c) => acc + c, 0) / o[keyCategory].length;
                a.push({
                  category: keyCategory,
                  average: average,
                  quantity: o[keyCategory].length,
                });
              }
            }
            categoryMonths[keyMonth] = a;
          }
        }

        this.setState({
          items: newItems,
          averageMonths: averageMonths,
          categoryMonths: categoryMonths,
        });
        console.log(this.state)
      });
  }


  render() {
    let data = [];
    for (let i in this.state.categoryMonths) {
      let arr = this.state.categoryMonths[i]
      let newData = { name: i };
      for (let j in arr) {
        let v = arr[j];
        newData[v.category] = v.average
        newData[(v.category + "_q")] = v.quantity
      }


      data.push(newData)
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
          height={500}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line type="linear" dataKey="base" stroke="#4053d3" />
          <Line type="linear" dataKey="bundle" stroke="#b51d14" />
          <Line type="linear" dataKey="single" stroke="#00b25d" />
          <Line type="linear" dataKey="other" stroke="#00beff" />
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