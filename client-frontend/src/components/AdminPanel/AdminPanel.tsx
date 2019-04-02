import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";
import {Typeahead} from 'react-bootstrap-typeahead';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';


// fake data generator
const getItems = (count: number, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

const grid = 8;

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  display: 'flex',
  padding: grid,
  overflow: 'auto',
});


//todo podczytywanie wartosci do formularza

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
      },
      kid: {
        input: [],
        existingEntry: false,
      },
      trainer: {
        input: [],
        existingEntry: false,
      },
      activeForm: {},
      active: undefined,
      tempPrefs: {
        best: getItems(3),
        nice: getItems(3, 3),
        isok: getItems(3, 6),
        limp: getItems(3, 9),
        excl: getItems(3, 12),
      }
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
          existingEntry: true
        },
        activeForm: receivedResponse.data,
      })
    } else {
      this.setState({[fieldName]: {input: currInput, existingEntry: false}})
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

    const allPrefCat = ['best', 'nice', 'isok', 'limp', 'excl']
    let prefs = allPrefCat.map(categoryName => {
      let droppableId = `${categoryName}_droppable_area`
      return(
        <Droppable droppableId={droppableId} direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              {...provided.droppableProps}
            >
              {this.state.tempPrefs[categoryName].map((item: any, index: any) => (
                <Draggable key={item.id} draggableId={item.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      {item.content}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      )
    })

    return (
      <Form>
        {newName}
        <Form.Group>
          <Form.Label>Uwagi (opcjonalnie)</Form.Label>
          <Form.Control as="textarea" rows={'1'}/>
        </Form.Group>
        <DragDropContext onDragEnd={(res) => this.onDragEnd(res)}>
          {prefs}
        </DragDropContext>
      </Form>
    )
  }

  onDragEnd(result: any){
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    let categoryNameForSource = source.droppableId.split('_')[0]
    let categoryNameForDestination = destination.droppableId.split('_')[0]

    if (source.droppableId === destination.droppableId) {

      let prefs = this.state.tempPrefs

      const listCopy = Array.from(this.state.tempPrefs[categoryNameForSource]);
      const [removed] = listCopy.splice(source.index, 1);
      listCopy.splice(destination.index, 0, removed);

      this.state.tempPrefs[categoryNameForSource] = listCopy

      this.setState({
        tempPrefs: prefs
      })
    } else {
      const sourceClone = Array.from(this.state.tempPrefs[categoryNameForSource]);
      const destClone = Array.from(this.state.tempPrefs[categoryNameForDestination]);
      const [removed] = sourceClone.splice(source.index, 1);

      destClone.splice(destination.index, 0, removed);

      let prefs = this.state.tempPrefs
      prefs[categoryNameForSource] = sourceClone
      prefs[categoryNameForDestination] = destClone

      for(let catName of Object.keys(prefs)){
        prefs[catName].sort()
      }

      this.setState({
        tempPrefs: prefs
      })
    }
  }

  move(source: string, destination: string, droppableSource: any, droppableDestination: any){
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: any = {};
    result[source] = sourceClone;
    result[destination] = destClone;

    return result;
  };

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
