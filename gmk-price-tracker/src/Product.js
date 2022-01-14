import React, { useEffect, useState, useRef } from 'react';

import {
    Link,
    Switch,
    Route,
    Redirect,
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
    Legend,
    ReferenceArea,
} from "recharts";

import Fuse from "fuse.js";

import db from './firebase.js';
import thinkingEmote from './thinking.png'

const SETS = ["base", "bundle", "single", "other"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const START_DATE = [2020, 1];
const END_DATE = [2021, 12];
const START_DATE_DT = new Date(START_DATE[0], START_DATE[1] - 1, 1, 0, 0, 0, 0);
const END_DATE_DT = new Date(END_DATE[0], END_DATE[1] - 1, 1, 0, 0, 0, 0);

function sortObjectByKey(obj, key, asc) {
    if (asc)
        return obj.sort((a, b) => a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0)
    else
        return obj.sort((a, b) => b[key] < a[key] ? -1 : b[key] > a[key] ? 1 : 0)
}

function datePrettyFormat(ts) {
    let d = new Date(ts);
    return MONTHS[d.getMonth()] + " " + d.getFullYear()
}

function ProductPage() {
    const { path, url } = useRouteMatch();
    return (
        <div>
            <Switch>
                <Route exact path={path}>
                    <Redirect to={"/"} />
                </Route>
                <Route path={`${path}/:productID`}>
                    <Product />
                </Route>
            </Switch>
        </div>
    );
}

const useIsMount = () => {
    const isMountRef = useRef(true);
    useEffect(() => {
        isMountRef.current = false;
    }, []);
    return isMountRef.current;
};

function NoDataPage(props) {
    const [sets, setSets] = useState(["not mounted"]);

    useEffect(() => {
        let setNames = [];
        db.collection("gmk").get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                setNames.push(doc.id);
            })

            const fuse = new Fuse(setNames, { includeScore: true, threshold: 0.3 });
            let results = fuse.search(props.data.productID);

            let newSets = [];
            results.forEach(result => {
                let split = result.item.split(" ")[1];
                if (split) {
                    newSets.push(split);
                }
            })

            setSets(newSets.slice(0, 10));
        })
    }, [props.data.productID]);

    let id = props.data.productID

    let added = [];

    if (sets.length === 0) {
        added.push(<p style={{ fontSize: 20 }} key="none">No similarly named sets were found.</p>);
    } else if (sets[0] !== "not mounted") {
        added.push(<p style={{ fontSize: 20 }} key="meant">Did you mean one of the following?</p>);
        sets.forEach((s) => {
            added.push(
                <Link to={'/products/' + s + '/'} key={s}>
                    <p style={{ fontSize: 20, margin: 0 }}>GMK {s.charAt(0).toUpperCase() + s.slice(1)}</p>
                </Link>
            )
        })
    }

    return (<div className="graph" style={{ padding: 20 }}>
        <img src={thinkingEmote} alt="thinking emote" style={{ padding: 20 }} />
        <p style={{ margin: 0, fontSize: 20 }}>No data was found for for <span style={{ fontWeight: "bold" }}> GMK {id.charAt(0).toUpperCase() + id.slice(1)}</span></p>
        {added}
    </div>)
}

function Product() {
    let { productID } = useParams();
    productID = productID.toLowerCase();

    if (productID.split(" ")[0] === "gmk") {
        productID = productID.split(" ")[1];
    }

    if (productID.split(" ").length > 1) {
        productID = productID.split(" ")[0];
    }

    const isMount = useIsMount();

    const gmkID = "gmk " + productID
    const [product, setProduct] = useState([]);
    const [average, setAverage] = useState([]);
    const [dataShowParams, setDataShowParams] = useState({ start: START_DATE_DT, end: END_DATE_DT });
    const [setsShow, setSetsShow] = useState([...SETS]);
    const [currentSort, setCurrentSort] = useState(['date', true]);
    const [clickLeft, setClickLeft] = useState("");
    const [clickRight, setClickRight] = useState("");
    const [graphLeft, setGraphLeft] = useState(START_DATE_DT);
    const [graphRight, setGraphRight] = useState(END_DATE_DT);

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
                    style={{ marginLeft: "3px" }}
                />
            </React.Fragment>
        )
    }

    function tableHeader(field) {
        return (
            <th onClick={() => {
                if (currentSort[0] === field) {
                    setProduct(sortObjectByKey(product.slice(), field, !currentSort[1]))
                    setCurrentSort([field, !currentSort[1]])
                } else {
                    setCurrentSort([field, true])
                    setProduct(sortObjectByKey(product.slice(), field, true))
                }

            }}>{field + "  " + (currentSort[0] === field ? currentSort[1] ? "▲" : "▼" : "⇕")}</th>
        )
    }

    function zoom() {
        let refLeft = clickLeft
        let refRight = clickRight

        if (refLeft === refRight || refRight === "") {
            setClickLeft("");
            setClickRight("");

            if (refLeft !== "") {
                let endD = new Date(refLeft);
                endD.setMonth(endD.getMonth() + 1);
                setDataShowParams({ start: refLeft, end: endD });
            }
            return;
        }

        if (refLeft > refRight) [refLeft, refRight] = [refRight, refLeft];

        let endD = new Date(refRight);
        endD.setMonth(endD.getMonth() + 1);

        setGraphLeft(refLeft);
        setGraphRight(refRight);
        setClickLeft("");
        setClickRight("");

        setDataShowParams({ start: refLeft, end: endD });
        return;
    }

    useEffect(() => {
        db.collection("gmk").doc(gmkID).collection('sales').orderBy('date').get().then(querySnapshot => {
            let sumByMonth = {};
            for (let year = START_DATE[0]; year <= END_DATE[0]; year++) {
                for (let month = 1; month <= 12; month++) {
                    if (year === START_DATE[0] && month < START_DATE[1]) continue;
                    if (year === END_DATE[0] && month > END_DATE[1]) continue;

                    // sum, quantity
                    sumByMonth[[year, month]] = { "base": [0, 0], "bundle": [0, 0], "single": [0, 0], "other": [0, 0] };
                }
            }

            let allData = [];

            querySnapshot.forEach(doc => {
                let newData = doc.data();
                let dateConvert = newData.date.toDate();
                let key = [dateConvert.getFullYear(), dateConvert.getMonth() + 1];
                allData.push({
                    id: doc.id,
                    category: newData.category,
                    price: newData.price,
                    linkFull: newData.link,
                    link: newData.link.split("/").slice(-2),
                    date: dateConvert,
                    sets: newData.sets.join(", "),
                })

                sumByMonth[key][newData.category][0] += newData.price;
                sumByMonth[key][newData.category][1]++;
            })

            let averageByMonth = [];
            for (let keyMonth in sumByMonth) {
                let [y, m] = keyMonth.split(",");
                let monthAverage = { "epoch": new Date(y, m - 1, 1, 0, 0, 0, 0).getTime() };
                let monthData = sumByMonth[keyMonth];

                for (let keyCategory in monthData) {
                    let categoryData = monthData[keyCategory];
                    let a = categoryData[0] / categoryData[1];
                    if (!isNaN(a)) {
                        monthAverage[keyCategory] = Math.round(a);
                        monthAverage[keyCategory + "_q"] = categoryData[1];
                    }
                }

                averageByMonth.push(monthAverage)
            }

            setProduct(allData);
            setAverage(averageByMonth);
        })
    }, [gmkID]);

    if (isMount) {
        return null;
    }

    if (product.length === 0) {
        return <NoDataPage data={{ productID: productID }} />;
    }

    return (
        <div>
            <div className="graph">
                <p style={{ padding: 20, margin: 0, fontSize: 20 }}>Showing results for <span style={{ fontWeight: "bold" }}> GMK {productID.charAt(0).toUpperCase() + productID.slice(1)}</span></p>

                <LineChart
                    width={900}
                    height={400}
                    data={average}
                    onClick={(e, payload) => {
                        if (e !== null && payload.target.className.baseVal !== "recharts-dot") {
                            setSetsShow([...SETS]);
                        }
                    }}
                    onMouseDown={(e) => { if (e !== null) setClickLeft(e.activeLabel) }}
                    onMouseMove={(e) => { if (e !== null) clickLeft && setClickRight(e.activeLabel) }}
                    onMouseUp={() => zoom()}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="epoch" type="number" scale="time" padding={{ left: 25, right: 25 }} interval={0} angle={30} tickMargin={15} height={50} domain={[graphLeft, graphRight]} allowDataOverflow tickFormatter={datePrettyFormat} />
                    <YAxis label={{ value: 'Price (USD)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip labelFormatter={datePrettyFormat} formatter={(value, name, props) => {
                        return `$${props.payload[props.dataKey]}, ${props.payload[props.dataKey + "_q"]} units`
                    }} />
                    <Legend />
                    <Line type="linear" dataKey="base" stroke="#4053d3" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                    <Line type="linear" dataKey="bundle" stroke="#b51d14" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                    <Line type="linear" dataKey="single" stroke="#00b25d" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                    <Line type="linear" dataKey="other" stroke="#00beff" activeDot={{ onClick: (e, payload) => setSetsShow([payload.dataKey]) }} />
                    {clickLeft && clickRight ? (
                        <ReferenceArea x1={clickLeft} x2={clickRight} strokeOpacity={0.3} />
                    ) : null}
                </LineChart>
            </div>

            <button className="resetSetButton" onClick={() => {
                setDataShowParams({ start: START_DATE_DT, end: END_DATE_DT })
                setSetsShow([...SETS]);
                setGraphLeft(START_DATE_DT);
                setGraphRight(END_DATE_DT);
            }}>
                Reset
            </button>

            {SETS.map((box) => { return buttonSetInclude(box) })}



            <table>
                <thead>
                    <tr>
                        {tableHeader("category")}
                        {tableHeader("price")}
                        {tableHeader("link")}
                        {tableHeader("date")}
                        {tableHeader("sets")}
                    </tr>
                </thead>
                <tbody>
                    {product.map((p) => {
                        if (p.date >= dataShowParams.start && p.date <= dataShowParams.end && setsShow.includes(p.category)) {
                            return (
                                <tr key={p.id}>
                                    <td>{p.category}</td>
                                    <td>{p.price}</td>
                                    <td>{<a href={"https://www.reddit.com" + p.linkFull} target="_blank" rel="noopener noreferrer">{p.link}</a>}</td>
                                    <td>{p.date.toString()}</td>
                                    <td>{p.sets}</td>
                                </tr>
                            )
                        }

                        return null
                    })}
                </tbody>
            </table>
        </div >
    );
}

export default ProductPage;