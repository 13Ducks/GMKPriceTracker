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

const SETS = ["base", "bundle", "single", "other"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const START_DATE = [2020, 1]
const END_DATE = [2021, 5]

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
    const gmkID = "gmk " + productID
    const [product, setProduct] = useState({});
    const [average, setAverage] = useState({});
    const [dataShowParams, setDataShowParams] = useState({ start: new Date(START_DATE[0], START_DATE[1] - 1, 1, 0, 0, 0, 0), end: new Date(END_DATE[0], END_DATE[1] - 1, 1, 0, 0, 0, 0) });
    const [setsShow, setSetsShow] = useState([...SETS])

    function buttonSetInclude(setName) {
        return (
            <React.Fragment key={setName}>
                <label className="includeSetBox" htmlFor={`chk${setName}`}>{setName}</label>
                <input
                    id={`chk${setName.name}`}
                    type="checkbox"
                    checked={setsShow.includes(setName)}
                    onChange={(e) => {
                        if (e.currentTarget.checked) {
                            setSetsShow([...setsShow, setName]);
                        } else {
                            setSetsShow(setsShow.filter((name) => name !== setName));
                        }
                    }}
                />
            </React.Fragment>
        )
    }

    useEffect(() => {
        db.collection("gmk").doc(gmkID).collection('sales').orderBy('date').get().then(querySnapshot => {
            let dataByMonth = {}
            for (let year = START_DATE[0]; year <= END_DATE[0]; year++) {
                for (let month = 1; month <= 12; month++) {
                    if (year === START_DATE[0] && month < START_DATE[1]) continue
                    if (year === END_DATE[0] && month > END_DATE[1]) continue

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
                let prettyDate = MONTHS[m - 1] + " " + y
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
                if (product[m][c][i].date >= dataShowParams.start && product[m][c][i].date <= dataShowParams.end && setsShow.includes(c)) {
                    dataToShow.push(
                        <tr key={product[m][c][i].id}>
                            <td>{c}</td>
                            <td>{product[m][c][i].price}</td>
                            <td>{<a href={"https://www.reddit.com" + product[m][c][i].link} target="_blank" rel="noopener noreferrer">{product[m][c][i].link.split("/").slice(-2)}</a>}</td>
                            <td>{product[m][c][i].date.toString()}</td>
                            <td>{product[m][c][i].sets}</td>
                        </tr>
                    )
                }
            }
        }
    }



    return (
        <div>
            <LineChart
                width={800}
                height={400}
                data={average}
                onClick={(e, payload) => {
                    if (e != null) {
                        let startD = new Date(Date.parse("1 " + e.activeLabel));
                        let endD = new Date(startD.getTime())
                        endD.setMonth(endD.getMonth() + 1);
                        setDataShowParams({ start: startD, end: endD });

                        if (payload.target.className.baseVal != "recharts-dot") {
                            setSetsShow([...SETS]);
                        }
                    }
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ym" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="linear" dataKey="base" stroke="#4053d3" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                <Line type="linear" dataKey="bundle" stroke="#b51d14" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                <Line type="linear" dataKey="single" stroke="#00b25d" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                <Line type="linear" dataKey="other" stroke="#00beff" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
            </LineChart>
            <button className="resetSetButton" onClick={() => {
                setDataShowParams({ start: new Date(START_DATE[0], START_DATE[1] - 1, 1, 0, 0, 0, 0), end: new Date(END_DATE[0], END_DATE[1] - 1, 1, 0, 0, 0, 0) })
                setSetsShow([...SETS]);

            }}>
                Reset
            </button>

            {SETS.map((box) => { return buttonSetInclude(box) })}

            <table>
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Link</th>
                        <th>Date</th>
                        <th>Sets</th>
                    </tr>
                </thead>
                <tbody>
                    {dataToShow}
                </tbody>
            </table>
        </div >
    );
}

export default ProductPage;