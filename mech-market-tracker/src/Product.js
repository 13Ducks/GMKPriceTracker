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
    const [product, setProduct] = useState({});
    const [average, setAverage] = useState({});
    const startDate = [2020, 1]
    const endDate = [2021, 6]
    const [dataShowParams, setDataShowParams] = useState({ start: new Date(startDate[0], startDate[1] - 1, 1, 0, 0, 0, 0), end: new Date(endDate[0], endDate[1] - 1, 1, 0, 0, 0, 0) });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    useEffect(() => {
        db.collection("gmk").doc(gmkID).collection('sales').orderBy('date').get().then(querySnapshot => {
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
                    date: dateConvert,
                    sets: newData.sets.join(", "),
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

            setProduct(dataByMonth);
            setAverage(averageByMonth)
        })
    }, []);

    let dataToShow = []
    for (let m in product) {
        for (let c in product[m]) {
            for (let i in product[m][c]) {
                if (product[m][c][i].date >= dataShowParams.start && product[m][c][i].date <= dataShowParams.end) {
                    dataToShow.push(
                        <li key={product[m][c][i].id}>
                            <h3>{c}</h3>
                            <p>price: {product[m][c][i].price}</p>
                            <p>link: <a href={"https://www.reddit.com" + product[m][c][i].link} target="_blank" rel="noopener noreferrer">{product[m][c][i].link}</a></p>
                            <p>date: {product[m][c][i].date.toString()}</p>
                            <p>sets: {product[m][c][i].sets}</p>
                        </li>
                    )
                }
            }
        }
    }

    return (
        <div>
            <LineChart
                width={500}
                height={500}
                data={average}
                onClick={(e, payload) => {
                    let startD = new Date(Date.parse("1 " + e.activeLabel));
                    let endD = new Date(startD.getTime())
                    endD.setMonth(endD.getMonth() + 1);
                    setDataShowParams({ start: startD, end: endD })
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="base" stroke="#4053d3" activeDot={{ onClick: (e, payload) => console.log(e, payload) }} />
                <Line type="linear" dataKey="bundle" stroke="#b51d14" />
                <Line type="linear" dataKey="single" stroke="#00b25d" />
                <Line type="linear" dataKey="other" stroke="#00beff" />
            </LineChart>
            { dataToShow}
        </div >
    );
}

export default ProductPage;