import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";
import {Typeahead} from 'react-bootstrap-typeahead';

class App extends React.Component<any, any> {

  /*
  *  -> typeahead does not clear out on selecting the others typeahead fields
  *  -> buttons reveals the further options
  * */
  private objectTypes = ['horse', 'kid', 'trainer']
  private typeAhead: { [name: string]: any } = {}

  constructor(props: any) {
    super(props)
    this.state = {
      options: {
        horse: [],
        kid: [],
        trainer: []
      },
      horse: {
        input: [],
        existingEntry: false
      },
      kid: {
        input: [],
        existingEntry: false
      },
      trainer: {
        input: [],
        existingEntry: false
      },
      active: undefined
    }
    this.init()
  }

  public async init() {
    let asset = (await window.hmClient.sendAndWait('get_whole_asset', {})).data
    let options: { [key: string]: string[] } = {}
    Object.keys(asset).forEach(key => {
      let keyBezS = key.substr(0, key.length - 1)
      options[keyBezS] = asset[key].map((object: any) => {
        return object.name
      })
      options[keyBezS].sort()
    })
    //console.log(options)
    this.setState({options})
  }

  private getReqName(stateObjectName: string): ActionInMsg {
    return ('get_' + stateObjectName as ActionInMsg)
  }

  /*changeInputHandler = async (e: any, fieldName: string) => {
    let currInput = e.target.value
    this.setState({[fieldName]: {input: currInput},})
    this.setState({active: fieldName})
    let getResponse: IBackendMsg = await window.hmClient.sendAndWait(this.getReqName(fieldName), {name: currInput})
    this.setState({[fieldName]: {existingEntry: getResponse.success}})
  }*/

  changeTypeaheadHandler = async (e: any, fieldName: string) => {
    let currInput = ''
    if (Array.isArray(e) && e[0]) {
      currInput = e[0]
      this.setState({[fieldName]: {input: currInput},})
    }
    this.setState({active: fieldName})
    let getResponse: IBackendMsg = await window.hmClient.sendAndWait(this.getReqName(fieldName), {name: currInput})
    this.setState({[fieldName]: {existingEntry: getResponse.success}})
  }

  onFocusHandler = (fieldName: string) => {
    this.setState({active: fieldName})
    for (let typeName of this.objectTypes) {
      if (typeName != fieldName) {
        this.typeAhead[typeName].getInstance().clear()
        this.setState({[typeName]: {input: []},})
      }
    }
  }

  getAdditionalFormForEntry(name:string){
    if(this.state.active == name){

      return(<input/>)
    }
  }

  render() {
    console.log(this.state)
    let content = (
      <div className={classes.AdminPanelRow} key={'costam'}>
        <Row>
          <Col className={classes.Labels}>Dane 1</Col>
          <Col className={classes.Labels}><input/></Col>
          <Col/><Col/>
        </Row>
        <Row>
          <Col className={classes.Labels}>Dane 2</Col>
          <Col className={classes.Labels}><input/></Col>
          <Col/><Col/>
        </Row>
      </div>
    )

    const types = [{type: 'kid', label: 'Bachory'}, {type: 'horse', label: 'Horsesy'}, {
      type: 'trainer',
      label: 'Kadra'
    },]
    const rows = types.map((row: { type: string, label: string }) => {
      let name = row.type
      console.log(row)
      return (
        <div className={classes.AdminPanelRow} key={row.type + '_adm'} style={{width: 1000}}>
          <Row>
            <Col className={classes.Labels}>
              <strong>{row.label}</strong>
            </Col>
            <Col/><Col/>
          </Row>
          <hr/>
          <Row>
            <Col>Nazwa</Col>
            <Col className={classes.AutocompleteSelectOne}>
              {/*<input value={this.state.input}
                     onChange={(e: any) => this.changeInputHandler(e, name)}
                     onFocus={() => this.onFocusHandler(row.type)}
              />*/}
              <Typeahead
                key={row.type + '_typeahead_adm'}
                placeholder={row.label}
                onChange={(e: any) => this.changeTypeaheadHandler(e, name)}
                onFocus={() => this.onFocusHandler(name)}
                options={this.state.options[name]}
                // selected={this.state[name].input}
                allowNew={true}
                newSelectionPrefix={'Dodaj nowy: '}
                clearButton
                inputProps={{
                  width: '20px'
                }}
                ref={(ref) => this.typeAhead[name] = ref}
              />
            </Col>
            <Col/><Col/>
          </Row>
          <Col/>
          <Col>
          {this.getAdditionalFormForEntry(name)}
          </Col>
          {/*{content}*/}
          <Col/><Col/>
          <br/>
          <Row>
            <Col/><Col/>
            <Col>
              <Row>

                <Col><Button variant="secondary" onClick={() => console.log('new ' + name)}
                             disabled={this.state[row.type].existingEntry || (this.state.active != name)}>
                  Utwórz</Button></Col>
                <Col><Button variant="secondary" onClick={() => console.log('edit ' + name)}
                             disabled={!this.state[row.type].existingEntry || (this.state.active != name)}>
                  Edytuj</Button></Col>
                <span/>
                <Col><Button variant="secondary" onClick={() => console.log('remove ' + name)}
                             disabled={!this.state[row.type].existingEntry || (this.state.active != name)}>
                  Usuń</Button></Col>
                {/*todo remember to call get list after any button is pressed*/}

              </Row>
            </Col>
          </Row>
          <br/>
          <hr/>
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
