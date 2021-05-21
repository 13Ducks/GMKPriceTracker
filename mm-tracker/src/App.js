import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from './firebase.js';

class App extends Component {
  constructor() {
    super();
    this.state = {
      setname: '',
      categoryname: '',
      items: []
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
    const db = firebase.firestore();
    db.collection("gmk").doc(this.state.setname).collection('sales')
      .orderBy("date").get().then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(doc.id, " => ", doc.data());
          let newData = doc.data();
          newData.id = doc.id;
          newData.date = newData.date.toDate().toString();
          newItems.push(newData);
          console.log(newItems);
        });

        this.setState({
          currentItem: '',
          items: newItems
        });
        console.log(this.state)
      });
  }


  render() {
    return (
      <div className='app'>
        <header>
          <div className='wrapper'>
            <h1>Loser's Club</h1>
          </div>
        </header>
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