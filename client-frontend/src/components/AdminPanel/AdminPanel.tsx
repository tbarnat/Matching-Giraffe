import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {IHorseRidingHourQ} from "../../DataModel";
import update from "immutability-helper";

class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props)
    this.state = {
      input:''
    }
  }

  changeInputHandler = (e: any) => {
    this.setState({input: e.target.value})
    console.log(e.target.value)
    //window.hmClient
    //
  }

  render() {
    return (
      <div className={classes.AdminPanel}>
        <Row>
          <Col className={classes.Labels}>
            Labelka
          </Col>
          <Col className={classes.AutocompleteSelectOne}>
            <input value={this.state.input} onChange={(e: any) => this.changeInputHandler(e)}/>
          </Col>
          <Col>
            <Button color="primary" variant="primary" onClick={() => console.log('new')}>Utwórz</Button>
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
 