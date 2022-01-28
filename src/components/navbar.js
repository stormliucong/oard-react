import React, { Component } from 'react';
import { Nav,NavDropdown,Navbar,Container } from 'react-bootstrap';


class NavBarComp extends Component {
    state = {}
    render() {
        return (
                <Navbar bg="light" expand="lg">
                    <Container>
                        <Navbar.Brand href="#home">OARD React Webapp</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Link href="#home">Home</Nav.Link>
                            <Nav.Link href="https://github.com/">GitHub</Nav.Link>
                            <Nav.Link href="https://github.com/">API tutorial</Nav.Link>
                            <Nav.Link href="https://github.com/">WengLab</Nav.Link>
                            <Nav.Link href="https://github.com/">WangLab</Nav.Link>
                            <NavDropdown title="Other resources" id="basic-nav-dropdown">
                            <NavDropdown.Item href="https://github.com/">Columbia DBMI</NavDropdown.Item>
                            <NavDropdown.Item href="https://github.com/"> CHOP</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">NCATS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">NHGRI</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">HPO</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">MONDO</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3">OHDSI</NavDropdown.Item>
                            </NavDropdown>
                        </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
        );
    }
}

export default NavBarComp;