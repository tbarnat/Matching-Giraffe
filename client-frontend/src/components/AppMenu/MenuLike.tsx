import * as React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import logoBg from '../../images/logo_bg.png';
import Image from 'react-bootstrap/Image';
import classes from './AppMenu.module.scss';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';


class MenuLike extends React.Component {
  render() {
    return (
      <div className={classes.MenuLike}>
        <div>
          <Image src={logoBg} className={classes.Logo} rounded />
        </div>
        <div className={classes.MenuLike}>
          <Navbar className={classes.NavBar} expand="md">
            <Navbar.Brand>
              <div className={classes.LogoSpace}/>
            </Navbar.Brand>
            <Col className={classes.Title}>
              Żyrafka pomaga ułożyć dzień w ośrodku i pokazać go innym.
            </Col>
          </Navbar>
        </div>
        <br/>
        <Row>

          <Col xs={4} sm={2} md={2} lg={2} xl={1}/>
          <Col className={classes.Subtitle}>
            Jeśli podoba Ci się ta appka, powiedz o niej w innych miejscach, w których jeździsz! ;)
          </Col>
        </Row>
      </div>
    )
  }
};

export default MenuLike;

