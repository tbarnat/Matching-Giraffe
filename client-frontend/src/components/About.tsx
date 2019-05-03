import * as React from 'react';
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";

export class About extends React.Component<any, any> {
  render() {
    return (
      <Container>
        <br/>
        <br/>
        <Row>
          {'This app is dedicated for people working in a horse riding school. It helps to distribute horses among riders, create and share a schedule'}
        </Row>
        {/*<Row>
          {'New features / languages / video tutorial coming soon!'}
        </Row>
        <br/>
        <Row>
          {'Thank\'s for using and sharing!'}
        </Row>*/}
        <br/>
        <Row>
          {'MIT licence'}
        </Row>
        <br/>
        <Row>
          {'Contact creators:'}
        </Row>
        <Row>
          {'t.barnat att wp pl \u00A0 \u00A0 \u00A0 corwin1519 att g mail com'}
        </Row>
      </Container>
    );
  }
}