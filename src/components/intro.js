import React, { Component } from 'react';
import { Carousel, Container, Row, Col } from 'react-bootstrap';

class IntroComp extends Component {

    render() {
        return (
            <Container fluid>

                <Row className="justify-content-md-center">
                    <Col md="auto">
                        <Carousel>
                            <Carousel.Item>
                                <img
                                    className="d-block w-block"
                                    src="placeholder.png"
                                    alt="First slide"
                                />
                                <Carousel.Caption>
                                    <h3>First slide label</h3>
                                    <p>Nulla vitae elit libero, a pharetra augue mollis interdum.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-block"
                                    src="placeholder.png"
                                    alt="Second slide"
                                />

                                <Carousel.Caption>
                                    <h3>Second slide label</h3>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-block"
                                    src="placeholder.png"
                                    alt="Third slide"
                                />

                                <Carousel.Caption>
                                    <h3>Third slide label</h3>
                                    <p>Praesent commodo cursus magna, vel scelerisque nisl consectetur.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        </Carousel>
                    </Col>

                </Row>

            </Container>

        );
    }
}

export default IntroComp;