import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {IBackendMsg} from "../../App";

class App extends React.Component<any, any> {

  constructor(props: any) {
    super(props)
    this.state = {
      input:''
    }
  }

  changeInputHandler = async (e: any) => {
    this.setState({input: e.target.value})
    let currInput = e.target.value
    let getResponse: IBackendMsg = await window.hmClient.sendAndWait('get_kid', {name:currInput})
    if(getResponse.success){
      console.log('we got it!')
    }
  }

  render() {
    return (
      <div className={classes.AdminPanel}>
        <Row>
          <Col className={classes.Labels}>
            Dzieciak
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
 