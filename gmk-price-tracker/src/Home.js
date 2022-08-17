import { Link } from "react-router-dom";
import images from "./loadImages";
import db from "./firebase";
import { Card, Col, Row, Layout } from 'antd';
import { useState, useEffect } from 'react';

const { Meta } = Card;
const { Content, Footer } = Layout;


function HomePage() {
    const [topGMK, setTopGMK] = useState([]);

    useEffect(() => {
        let top = [];
        db.collection("gmk").orderBy('count', "desc").limit(8).get().then(querySnapshot => {
            querySnapshot.forEach(doc => {
                top.push([doc.id, doc.data().count]);
            })
            setTopGMK(top);
        })
    }, []);
    return (
        <div>
            <Content >
                <div className="graph" style={{ padding: 10, paddingTop: 20 }}>
                    <p className="section-header" style={{ margin: 0 }} >Popular Sets</p>

                </div>


                <div className="site-card-wrapper" style={{ margin: 20 }}>
                    <Row gutter={16}>
                        {topGMK.map((top) => {
                            let [id, count] = top;
                            let product = id.split(" ")[1];
                            return (
                                <Col span={6} key={id} style={{ padding: 10, paddingTop: 0, paddingBottom: 20 }}>
                                    <Link to={'/products/' + product + '/'} key={id}>
                                        <Card hoverable
                                            cover={<img alt="example" src={product in images ? images[product].default : images["no_image"].default} />}

                                        >
                                            <Meta title={"GMK " + product.charAt(0).toUpperCase() + product.slice(1)}
                                                description={"Sales: " + count} />
                                        </Card>
                                    </Link>
                                </Col>
                            )
                        })
                        }
                    </Row>
                </div>
            </Content>
            <Footer style={{ textAlign: "center" }}>
                Created by <a href="https://www.aaryan.dev">Aaryan Agrawal</a>, <a href="https://github.com/DanielLiCodes">Daniel Li</a>, and <a href="https://github.com/wesleyliu728">Wesley Liu</a>
            </Footer>
        </div>
    );
}

export default HomePage;
