import React, { Component } from 'react';
import { Link, useHistory } from "react-router-dom";

import './App.css';

import 'antd/dist/antd.css';
import { Input } from 'antd';
const { Search } = Input;

function SearchBar() {
    const history = useHistory();
    const onSubmit = (value) => {
        history.push(`/products/${value}`)
    };

    return (<Search placeholder="Search GMK prices" onSearch={onSubmit} style={{ width: 200 }} />)
}


function NavBar() {
    return (
        <div class='nav-bar'>
            <Link to='/' className='nav-bar-item'>
                GMK Price Tracker
            </Link>
            <SearchBar />
        </div>

    );
}



export default NavBar;