import { Link } from "react-router-dom";
import images from "./loadImages";
import db from "./firebase";
import { useState, useEffect } from 'react';

function HomePage() {
    const [topGMK, setTopGMK] = useState([]);

    useEffect(() => {
        let top = [];
        db.collection("gmk").orderBy('count').limitToLast(9).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                top.push(doc.id);
            })
            setTopGMK(top.reverse());
        })
    }, []);

    return (
        <div className='app'>
            <div className='top-images'>
                {topGMK.map((id, index) => {
                    let product = id.split(" ")[1];
                    return (
                        <Link to={'/products/' + product + '/'}>
                            <div className="square" key={id}>
                                <div className="content">
                                    <div className="table">
                                        <div className="table-cell">
                                            <img className="rs" src={images[product].default} alt={id} />
                                            <p className="home-gmk"> {id} </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )
                })
                }
            </div>

        </div >
    );
}

export default HomePage;