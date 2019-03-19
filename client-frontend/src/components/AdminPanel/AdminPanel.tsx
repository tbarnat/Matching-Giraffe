import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";

class App extends React.Component {
  render() {
    return (
      <div className={classes.AdminPanel}>
        <Row>
          <Col className={classes.Labels}>
            Labelka
          </Col>
          <Col className={classes.AutocompleteSelectOne}>
            <select/>
          </Col>
          <Col>
            <Button color="primary" variant="primary" onClick={() => console.log('new')}>Nowy</Button>
          </Col>
          <Col>
            <Button color="primary" variant="primary" onClick={() => console.log('edit')}>Edytuj</Button>
          </Col>
          <Col>
            <Button color="primary" variant="primary" onClick={() => console.log('remove')}>Usuń</Button>
          </Col>
        </Row>
      </div>
    );
  }
}

export default App;
 