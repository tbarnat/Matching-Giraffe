import * as React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from 'react-bootstrap/Image';
import classes from './Diary.module.scss';
import logo from '../../images/logo.png';

class NoDiaryEntry extends React.Component {

  render() {
    return (
      <div className={classes.NoDiaryEntry}>
        <Container>
          <br/>
          <Row>
            <Col>
              <Image src={logo} className={classes.Logo} rounded />
            </Col>
          </Row>
          <Row>
            <Col>
              <h3 className={classes.Msg}>Cuś nie pykło: link nie działa, ponieważ został źle skopiowany, lub ktoś zmienił / usunął ten dzień</h3>
            </Col>
          </Row>
          <br/>
        </Container>
      </div>
    );
  }
}

export default NoDiaryEntry;