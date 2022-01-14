import { Link } from "react-router-dom";
import images from "./loadImages";
import db from "./firebase";
import { useState, useEffect } from 'react';

function HomePage() {
    const [topGMK, setTopGMK] = useState([]);

    useEffect(() => {
        let top = [];
        db.collection("gmk").orderBy('count').limitToLast(8).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                top.push(doc.id);
            })
            setTopGMK(top.reverse());
        })
    }, []);
    return (
        <div className='home-page'>
            <div className="graph" style={{ padding: 10 }}>
                <p className="section-header" style={{ margin: 0 }} >Popular Sets</p>
            </div>
            <div className='top-images'>
                {topGMK.map((id) => {
                    let product = id.split(" ")[1];
                    console.log(product);
                    return (
                        <Link to={'/products/' + product + '/'} key={id}>
                            <div className="square" >
                                <div className="content">
                                    <div className="table">
                                        <div className="table-cell">
                                            <img className="rs" src={images[product].default} alt={id} />
                                            <p className="home-gmk"> GMK {product.charAt(0).toUpperCase() + product.slice(1)} </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })
                }
            </div>
            <div className='info'>
                <dl>
                    <dt className="section-header">Website Information & FAQ</dt>
                    <dd>This project was created by Aaryan Agrawal and Daniel Li, with help from Wesley Liu. The source code is available at <a href="https://github.com/13Ducks/GMKPriceTracker" style={{ whiteSpace: "nowrap" }}>https://github.com/13Ducks/GMKPriceTracker</a>.</dd>
                    <dt>How was the data collected?</dt>
                    <dd>All posts that seemed to be selling GMK keycaps on <a href="https://www.reddit.com/r/mechmarket/">r/mechmarket</a> were scraped and parsed to try to identify the product and the price it was sold at.</dd>
                    <dt>Why are some of the prices/products incorrect?</dt>
                    <dd>Parsing real text is hard. Many situations are impossible to parse algorithmically leading to incorrect data, but we have tried to minimize errors through post-parsing statistics and other measures.</dd>
                    <dt>Why are the set names only one word?</dt>
                    <dd>Due to the nature of our parsing algorithm, the only way we could get GMK set names without a premade list is by using the first word of a set name.</dd>
                    <dt>What technology does this project use?</dt>
                    <dd>
                        <ul>
                            <li>Scraping: <a href="https://pypi.org/project/psaw/">PSAW</a></li>
                            <li>Parsing: <a href="https://www.python.org/">Python</a>, <a href="https://pypi.org/project/pandas/">Pandas</a></li>
                            <li>Database: <a href="https://firebase.google.com/">Firebase</a></li>
                            <li>Website: <a href="https://reactjs.org/">React</a>, <a href="https://recharts.org/">Recharts</a>, <a href="https://reactrouter.com/">React Router</a>, <a href="https://ant.design/">Ant Design</a>, <a href="https://fusejs.io/">Fuse.js</a></li>
                        </ul>
                    </dd>
                    <dt>What GMK sets do you own?</dt>
                    <dd>At the moment, Cafe, Darling, and Peaches n Cream.</dd>
                </dl>
            </div>
        </div >
    );
}

export default HomePage;
