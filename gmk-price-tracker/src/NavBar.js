import React from 'react';
import { Link, useHistory } from "react-router-dom";

import './App.css';

import 'antd/dist/antd.css';
import { Input, Layout } from 'antd';
const { Search } = Input;
const { Header } = Layout;

function SearchBar() {
    const history = useHistory();
    const onSubmit = (value) => {
        history.push(`/products/${value}`)
    };

    return (<Search placeholder="Search GMK prices" onSearch={onSubmit} style={{ width: 250 }} />)
}


function NavBar() {
    return (
        <Header className='nav-bar'>
            <Link to='/' className='home-button'>
                GMK Price Tracker
            </Link>
            <SearchBar />
        </Header>
    );
}



export default NavBar;