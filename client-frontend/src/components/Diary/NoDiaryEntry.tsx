import * as React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Image from 'react-bootstrap/Image';
import classes from './Diary.module.scss';
import glitch from '../../images/glitch.jpg';

class NoDiaryEntry extends React.Component {

  render() {
    return (
      <div className={classes.NoDiaryEntry}>
        <Container>
          <br/>
          <Row>
            <Col>
              <h3 className={classes.Msg}>Cuś nie pykło</h3>
            </Col>
          </Row>
          <Row>
            <Col>
              <Image src={glitch} className={classes.Glitch} rounded />
            </Col>
          </Row>
          <Row>
            <Col>
              Link nie działa, ponieważ został źle skopiowany, lub ktoś zmienił / usunął ten dzień
            </Col>
          </Row>
          <br/>
        </Container>
      </div>
    );
  }
}

export default NoDiaryEntry;