import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";

class App extends React.Component<any, any> {

  /*
  *  -> input does not clear out
  *  -> typehead
  *  -> buttons redirect
  * */
  private objectTypes = ['horse','kid', 'trainer']

  constructor(props: any) {
    super(props)
    this.state = {
      horse: {
        input: '',
        existingEntry: false
      },
      kid: {
        input: '',
        existingEntry: false
      },
      trainer: {
        input: '',
        existingEntry: false
      },
      active: undefined
    }
  }

  private getReqName(stateObjectName: string): ActionInMsg {
    return ('get_' + stateObjectName as ActionInMsg)
  }

  changeInputHandler = async (e: any, fieldName: string) => {
    let currInputlValue = e.target.value
    this.setState({[fieldName]: {input: currInputlValue},})
    this.setState({active: fieldName})
    let currInput = e.target.value
    let getResponse: IBackendMsg = await window.hmClient.sendAndWait(this.getReqName(fieldName), {name: currInput})
    this.setState({[fieldName]: {existingEntry: getResponse.success}})
  }

  onFocus = (fieldName: string) => {
    this.setState({active: fieldName})
    for(let typeName of this.objectTypes){
      if(typeName != fieldName){
        this.setState({[typeName]: {input: ''},})
      }
    }
  }

  render() {
    const types = [{type: 'kid', label: 'Bachory'}, {type: 'horse', label: 'Horsesy'}, {
      type: 'trainer',
      label: 'Kadra'
    },]
    const rows = types.map((row: { type: string, label: string }) => {
      let name = row.type
      return (
        <div className={classes.AdminPanelRow} key={row.type + '_adm'}>
          <Row>
            <Col className={classes.Labels}>
              {row.label}
            </Col>
            <Col className={classes.AutocompleteSelectOne}>
              <input value={this.state.input}
                     onChange={(e: any) => this.changeInputHandler(e, name)}
                     onFocus={() => this.onFocus(row.type)}
              />
            </Col>

            <Col>
              <Button variant="secondary" onClick={() => console.log('new ' + name)}
                      disabled={this.state[row.type].existingEntry || (this.state.active != name)}>
                Utwórz</Button>
            </Col>
            <Col>
              <Button variant="secondary" onClick={() => console.log('edit ' + name)}
                      disabled={!this.state[row.type].existingEntry || (this.state.active != name)}>
                Edytuj</Button>
            </Col>
            <Col>
              <Button variant="secondary" onClick={() => console.log('remove ' + name)}
                      disabled={!this.state[row.type].existingEntry || (this.state.active != name)}>
                Usuń</Button>
            </Col>
          </Row>
        </div>
      );
    })
    return (
      <div className={classes.AdminPanelRow}>
        {rows}
      </div>
    )
  }
}

export default App;
 