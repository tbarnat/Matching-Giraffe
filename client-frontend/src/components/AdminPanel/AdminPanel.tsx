import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";
import {Typeahead} from 'react-bootstrap-typeahead';

class App extends React.Component<any, any> {

  /*
  *  -> typeahead does not clear out on selecting the others typeahead fields
  *  -> buttons reveals the further options
  * */
  private objectTypes = ['kid', 'horse', 'trainer']
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
        existingEntry: false,
        selected: {}
      },
      kid: {
        input: [],
        existingEntry: false,
        selected: {}
      },
      trainer: {
        input: [],
        existingEntry: false,
        selected: {}
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

  changeMainLevelTypeaheadHandler = async (e: any, fieldName: string) => {
    let currInput = ''
    if (Array.isArray(e) && e[0]) {
      currInput = e[0]
    }
    let receivedResponse: IBackendMsg = await window.hmClient.sendAndWait(this.getReqName(fieldName), {name: currInput})
    if (receivedResponse.success) {
      this.setState({
        [fieldName]: {
          input: currInput,
          existingEntry: receivedResponse.success,
          selected: receivedResponse.data
        }
      })
    } else {
      this.setState({[fieldName]: {input: currInput, existingEntry: receivedResponse.success}})
    }
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

  getMoreFormForEntry(name: string) {
    if (this.state.active == name) {
      switch (name) {
        case this.objectTypes[0]:
          return this.getKidForm()
        case this.objectTypes[1]:
          return this.getHorseForm()
        case this.objectTypes[2]:
          return this.getTrainerForm()
        default:
          return
      }

    }
  }

  getKidForm() {
    let newName
    if (this.state['kid'].existingEntry) {
      newName = (
        <Form.Group>
          <Form.Label>Nowe Imię (opcjonalnie)</Form.Label>
          <Form.Control/>
        </Form.Group>
      )
    }
    console.log(this.state['kid'])
    return (
      <Form>
        {newName}
        <Form.Group>
          <Form.Label>Uwagi (opcjonalnie)</Form.Label>
          <Form.Control as="textarea" rows={'1'}/>
        </Form.Group>
      </Form>
    )
  }

  getHorseForm() {
    let newName
    if (this.state['horse'].existingEntry) {
      newName = (
        <Form.Group>
          <Form.Label>Nowe Imię (opcjonalnie)</Form.Label>
          <Form.Control/>
        </Form.Group>
      )
    }
    let howToAddToPrefs
    if (!this.state.horse.existingEntry && this.state.options.kid.length > 0) {
      let addAsHorso
      if (this.state.options.horse.length > 0) {
        addAsHorso = (
          <Form.Group>
            <Form.Label>Dodaj jak innego konia</Form.Label>
            <Typeahead
              key={'horse_typeahead_adm_adsAsHorse'}
              placeholder='Horses'
              //todo onFocus clear addToPrefs
              onChange={(e: any) => this.changeAddAsHorseTypeaheadHandler(e)}
              options={this.state.options['horse']}
              allowNew={false}
              inputProps={{
                width: '20px'
              }}
              ref={(ref) => this.typeAhead[''] = ref}
            />
          </Form.Group>
        )
      }
      howToAddToPrefs = (
        <Form.Group>
          <Form.Label>Metoda dopisywania do preferencji dla istniejących dzieciaków</Form.Label>
          {addAsHorso}
          <Form.Group>
            <Form.Label>Dodaj wszędzie do preferencji</Form.Label>
            <Form.Control as="select" defaultValue='Dobrze'> //todo onFocus - clear addAsHorso
              <option>Najlepiej</option>
              <option>Dobrze</option>
              <option>Średnio</option>
              <option>Słabo</option>
              <option>Nigdy</option>
            </Form.Control>
          </Form.Group>
        </Form.Group>
      )
    }
    return (
      <Form>
        <Form.Group>
          {newName}
          <Form.Label>Uwagi (opcjonalnie)</Form.Label>
          <Form.Control as="textarea" rows={'1'}/>
        </Form.Group>
        {howToAddToPrefs}
      </Form>
    )
  }

  changeAddAsHorseTypeaheadHandler(e: any) {
    let currInput = ''
    if (Array.isArray(e) && e[0]) {
      currInput = e[0]
    }
    //todo
  }

  getTrainerForm() {
    let newName
    if (this.state['trainer'].existingEntry) {
      newName = (
        <Form.Group>
          <Form.Label>Nowe Imię (opcjonalnie)</Form.Label>
          <Form.Control/>
        </Form.Group>
      )
    }
    return (
      <Form>
        <Form.Group>
          {newName}
          <Form.Label>Uwagi (opcjonalnie)</Form.Label>
          <Form.Control as="textarea" rows={'1'}/>
        </Form.Group>
      </Form>
    )
  }

  render() {
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

    const types = [
      {type: 'kid', label: 'Bachory'},
      {type: 'horse', label: 'Horsesy'},
      {type: 'trainer', label: 'Kadra'},]
    const rows = types.map((row: { type: string, label: string }) => {
      let name = row.type
      if(name != 'kid' || this.state.options.horse.length > 0){
        return (
          <div className={classes.AdminPanelRow} key={row.type + '_adm'} style={{width: 1000}}>
            {/*tabIndex={1} onFocus={() => console.log('dsdsdsdsdsds')}*/}
            <Row>
              <Col className={classes.Labels}>
                <strong>{row.label}</strong>
              </Col>
              <Col/><Col/>
            </Row>
            <hr/>
            <Row>
              <Col>Imię</Col>
              <Col className={classes.AutocompleteSelectOne}>
                <Typeahead
                  key={row.type + '_typeahead_adm'}
                  placeholder={row.label}
                  onChange={(e: any) => this.changeMainLevelTypeaheadHandler(e, name)}
                  onFocus={() => this.onFocusHandler(row.type)}
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
            {this.getMoreFormForEntry(name)}
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
      }
    })
    return (
      <div className={classes.AdminPanelRow}>
        {rows}
      </div>
    )
  }
}

export default App;
