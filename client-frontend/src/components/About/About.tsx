import * as React from 'react';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import associates from '../../images/associates.png';
import classes from './About.module.scss';

export class About extends React.Component<any, any> {
  render() {
    return (
      <Container className={classes.About} fluid>
        <Col/>
        <Col>
          <br/>
          <br/>
          <Row>
            <Col>
              {'This app is dedicated for people working in a horse riding school. It helps to distribute horses among riders, create and share a schedule'}
            </Col>
          </Row>
          {/*<Row>
          {'New features / languages / video tutorial coming soon!'}
        </Row>*/}
          <br/>
          <Row>
            <Col>
              {'Thank\'s for using and sharing!'}
            </Col>
          </Row>
          <br/>
          <Row>
            <Col>
              {'MIT licence   /   Contact creators: \u00A0 \u00A0 \u00A0 t.barnat att wp pl \u00A0 \u00A0 \u00A0 corwin1519 att g mail com'}
            </Col>
          </Row>
          <Card className={classes.Card}>
            <Row>
              <Col>
                <h3 className={classes.H3Msg}>Created with joy for people with passion</h3>
              </Col>

            </Row>
            <Row>
              <Col>
                <a href="https://www.evido.com.pl/" style={{cursor: 'pointer'}}>
                  <Image src={associates} className={classes.Logo} rounded/>
                </a>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col/>
      </Container>
    );
  }
}