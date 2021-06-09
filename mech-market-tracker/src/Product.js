import React, { useEffect, useState } from 'react';
import {
    Switch,
    Route,
    useRouteMatch,
    useParams
} from "react-router-dom";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from "recharts";

import db from './firebase.js';

function ProductPage() {
    const { path, url } = useRouteMatch();
    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <h3>You should not be here!!!</h3>
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
    const [product, setProduct] = useState([]);
    const [average, setAverage] = useState({});
    const startDate = [2020, 1]
    const endDate = [2021, 6]
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        db.collection("gmk").doc(gmkID).collection('sales').orderBy('date').get().then(querySnapshot => {
            let newProduct = []
            let dataByMonth = {}
            for (let year = startDate[0]; year <= endDate[0]; year++) {
                for (let month = 1; month <= 12; month++) {
                    if (year === startDate[0] && month < startDate[1]) continue
                    if (year === endDate[0] && month > endDate[1]) continue

                    dataByMonth[[year, month]] = { "base": [], "bundle": [], "single": [], "other": [] }
                }
            }

            querySnapshot.forEach(doc => {
                let newData = doc.data();
                let dateConvert = newData.date.toDate();
                let key = [dateConvert.getFullYear(), dateConvert.getMonth() + 1]
                dataByMonth[key][newData.category].push({
                    id: doc.id,
                    price: newData.price,
                    link: newData.link,
                })

                newProduct.push({
                    id: doc.id,
                    category: newData.category,
                    price: newData.price,
                    link: newData.link,
                    date: dateConvert.toString(),
                })
            })

            let averageByMonth = [];
            for (let keyMonth in dataByMonth) {
                let [y, m] = keyMonth.split(",")
                let prettyDate = months[m - 1] + " " + y
                let averages = { "ym": prettyDate }
                let monthData = dataByMonth[keyMonth]
                for (let keyCategory in monthData) {
                    let categoryData = monthData[keyCategory]
                    let sum = 0
                    for (let i in categoryData) {
                        sum += categoryData[i].price
                    }

                    let a = sum / categoryData.length
                    if (!isNaN(a)) {
                        averages[keyCategory] = Math.round(a)
                    }
                }
                averageByMonth.push(averages)
            }
            // todo: use dataByMonth for product and figure out how to render it, to enable sorting by month easily
            setProduct(newProduct);
            setAverage(averageByMonth)
        })
    }, []);

    return (
        <div>
            <LineChart
                width={500}
                height={500}
                data={average}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="base" stroke="#4053d3" />
                <Line type="linear" dataKey="bundle" stroke="#b51d14" />
                <Line type="linear" dataKey="single" stroke="#00b25d" />
                <Line type="linear" dataKey="other" stroke="#00beff" />
            </LineChart>

            {product.map((item) => {
                return (
                    <li key={item.id}>
                        <h3>{item.category}</h3>
                        <p>price: {item.price}</p>
                        <p>link: {item.link}</p>
                        <p>date: {item.date}</p>
                    </li>
                )
            })}
        </div>
    );
}

export default ProductPage;