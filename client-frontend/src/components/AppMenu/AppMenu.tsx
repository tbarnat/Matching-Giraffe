import * as React from 'react';

import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavItem from 'react-bootstrap/NavItem';
import {Link} from 'react-router-dom';




import classes from './AppMenu.module.scss';



class AppMenu extends React.Component {
  render() {
    return (
      <div className={classes.AppMenu}>
        <div className={classes.AppMenu}>
          <Navbar bg="orange" expand="lg">
            <LinkContainer to="/">
              <Navbar.Brand>Horse Matcher</Navbar.Brand>
            </LinkContainer>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse>
              <Nav className="mr-auto">
                <LinkContainer to="/day">
                  <Nav.Link>Zaplanuj dzień</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/diary">
                  <Nav.Link>Dziennik</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/admin">
                  <Nav.Link style={{color: 'red'}}>Panel Szeryfa</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/about">
                  <Nav.Link>O apce</Nav.Link>
                </LinkContainer>
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>
      </div>
    )

  }
};

export default AppMenu;

