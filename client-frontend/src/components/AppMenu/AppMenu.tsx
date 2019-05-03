import * as React from 'react';

import { LinkContainer } from 'react-router-bootstrap';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import logoBg from '../../images/logo_bg.png';
import Image from 'react-bootstrap/Image';
import classes from './AppMenu.module.scss';



class AppMenu extends React.Component {
  render() {
    return (
      <div className={classes.AppMenu}>
        <div>
          <Image src={logoBg} className={classes.Logo} rounded />
        </div>
        <div className={classes.AppMenu}>
          <Navbar className={classes.NavBar} expand="md">
            <Navbar.Brand>
              <div className={classes.LogoSpace}/>
            </Navbar.Brand>
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
                  <Nav.Link>Panel Szeryfa</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/account">
                  <Nav.Link>Konto</Nav.Link>
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

