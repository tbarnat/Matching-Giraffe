import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";
import {Typeahead} from 'react-bootstrap-typeahead';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';

// fake data generator
const getItems = (count: number, offset = 0) =>
  Array.from({length: count}, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

const grid = 8;

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: `${grid}px ${grid*2}px ${grid}px ${grid*2}px`,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? '#fc720c' : '#ff9749',
  borderRadius: '15px',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? '#ffd0ad' : '#fff1e8',
  borderRadius: '25px',
  border: '1px solid darkgrey',
  display: 'flex',
  padding: grid,
  bottomMargin: '10px',
  overflow: 'auto',
  minHeight: '50px'
});



//todo podczytywanie wartosci do formularza
// przyciski tworza modale
//todo przyciski wysylaja request i przeladowuja listy



class App extends React.Component<any, any> {

  /*
  *  -> typeahead does not clear out on selecting the others typeahead fields
  *  -> buttons reveals the further options
  * */
  private objectTypes = ['kid', 'horse', 'trainer']
  private typeaheadRef: { [name: string]: any } = {}
  private inputRef: { [name: string]: any } = {}
  private fcl: any = {label: {xs: 4, md: 3}, input: {xs: 8, md: 8}}
  private allPrefCat: string[] = ['best', 'nice', 'isok', 'limp', 'excl']
  private readonly prefLabel: { [key: string]: string } = {
    best: 'Naj <3',
    nice: 'Dobrze',
    isok: 'Średnio',
    limp: 'Słabo',
    excl: 'Nigdy'
  }


  constructor(props: any) {
    super(props)
    this.state = {
      options: {
        horse: [],
        kid: [],
        trainer: []
      },
      active: undefined,
      existingEntry: false,
      activeForm: {
        /*prefs: {
          best: getItems(3),
          nice: getItems(3, 3),
          isok: getItems(3, 6),
          limp: getItems(3, 9),
          excl: getItems(3, 12),
        }*/
      },

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
        active: fieldName,
        existingEntry: true,
        activeForm: receivedResponse.data,
      })
    } else {
      if(!this.state.activeForm.prefs){
        this.getNewRandomPrefs()
      }
      this.setState({
        active: fieldName,
        existingEntry: false
      })
    }
  }

  focusMainLevelHandler = (fieldName: string) => {
    if (this.state.active != fieldName) {
      this.setState({active: undefined})
    }
    for (let typeName of this.objectTypes) {
      if (typeName != fieldName) {
        this.typeaheadRef[typeName].getInstance().clear()
      }
    }
  }

  getMoreFormForEntry(name: string) {
    if (this.state.active == name) {
      let newName
      if (this.state.existingEntry) {
        newName = (
          <Form.Group>
            <Row>
              <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
                <Form.Label column>Nowe imię (opcjonalnie)</Form.Label>
              </Col>
              <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
                <Form.Control/>
              </Col>
            </Row>
          </Form.Group>
        )
      }
      let remarks
      remarks = (
        <Form.Group>
          <Row>
            <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
              <Form.Label>Uwagi (opcjonalnie)</Form.Label>
            </Col>
            <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
              <Form.Control as="textarea" rows={'1'}/>
            </Col>
          </Row>
        </Form.Group>
      )
      switch (name) {
        case this.objectTypes[0]:
          return this.getKidForm(newName, remarks)
        case this.objectTypes[1]:
          return this.getHorseForm(newName, remarks)
        case this.objectTypes[2]:
          return this.getTrainerForm(newName, remarks)
        default:
          return
      }
    }
  }

  getKidForm(newName: any, remarks: any) {

    let prefs = {}
    if(this.state.activeForm.prefs){
      prefs = this.allPrefCat.map((categoryName: string) => {
        let droppableId = `${categoryName}_droppable_area`
        return (
          <Row>
            <Col xs={2}>{this.prefLabel[categoryName]}</Col>
            <Col>
              <Droppable droppableId={droppableId} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    {this.state.activeForm.prefs[categoryName].map((item: string, index: any) => (
                      <Draggable key={item} draggableId={item} index={index}>
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
                            {item}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          </Row>
        )
      })
    }
    let prefsTemplate
    if(!this.state.existingEntry){
      prefsTemplate = (
        <Form.Group>
          <Row>
            <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
              <Form.Label>Kopiuj preferencje od</Form.Label>
            </Col>
            <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
              <Typeahead
                key={'kid_typeahead_adm_prefs_template'}
                placeholder='Dzieciaczek'
                onChange={(e: any) => this.onChangeSetPrefsTemplate(e)}
                options={this.state.options['kid']}
                allowNew={false}
                inputProps={{
                  width: '20px'
                }}
              />
            </Col>
          </Row>
        </Form.Group>
      )
    }


    return (
      <Form>
        {newName}
        {remarks}
        <Row style={{paddingBottom: 15}}>
          <Col><strong>Preferencje</strong></Col>
        </Row>
        <DragDropContext onDragEnd={(res) => this.onDragEnd(res)}>
          {prefs}
        </DragDropContext>
        <br/>
        {prefsTemplate}
      </Form>
    )
  }

  onDragEnd(result: any) {
    const {source, destination} = result;

    // dropped outside the list
    if (!destination) {
      return;
    }
    let categoryNameForSource = source.droppableId.split('_')[0]
    let categoryNameForDestination = destination.droppableId.split('_')[0]

    if (source.droppableId === destination.droppableId) {

      let prefs = this.state.activeForm.prefs
  console.log(prefs)
  console.log(categoryNameForSource)
  console.log(prefs[categoryNameForSource])
      const listCopy = Array.from(this.state.activeForm.prefs[categoryNameForSource]);
      const [removed] = listCopy.splice(source.index, 1);
      listCopy.splice(destination.index, 0, removed);

      this.state.activeForm.prefs[categoryNameForSource] = listCopy

      let activeForm = this.state.activeForm
      Object.assign(activeForm,{prefs})
      this.setState({activeForm})

    } else {
      const sourceClone = Array.from(this.state.activeForm.prefs[categoryNameForSource]);
      const destClone = Array.from(this.state.activeForm.prefs[categoryNameForDestination]);
      const [removed] = sourceClone.splice(source.index, 1);

      destClone.splice(destination.index, 0, removed);

      let prefs = this.state.activeForm.prefs
      prefs[categoryNameForSource] = sourceClone
      prefs[categoryNameForDestination] = destClone

      /*for (let catName of Object.keys(prefs)) {
        prefs[catName].sort()
      }*/

      let activeForm = this.state.activeForm
      Object.assign(activeForm,{prefs})
      this.setState({activeForm})
    }
  }

  move(source: string, destination: string, droppableSource: any, droppableDestination: any) {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result: any = {};
    result[source] = sourceClone;
    result[destination] = destClone;

    return result;
  };

  getNewRandomPrefs(){
    let numberOfAllCat = this.allPrefCat.length
    let prefs: {[key:string]: string[]} = {}

    //random distribution of all horses in pref categories
    let horses = this.state.options.horse
    for(let horse of horses){
      let randIndex = Math.floor(Math.random() * Math.floor(numberOfAllCat))
      if(!prefs[this.allPrefCat[randIndex]]){
        prefs[this.allPrefCat[randIndex]] = []
      }
      prefs[this.allPrefCat[randIndex]].push(horse)
    }
    //make sure all prefs are initialized
    for(let prefCat of this.allPrefCat){
      if( !prefs[prefCat] ){
        prefs[prefCat] = []
      }
    }
    //if any preference category have to many horses try to reduce length
    for(let prefCat of this.allPrefCat){
      if( prefs[prefCat].length > Math.ceil(horses.length/numberOfAllCat)){
        [1,2,3].forEach(i => {
          let randIndex = Math.floor(Math.random() * Math.floor(numberOfAllCat))
          let h1 = prefs[this.allPrefCat[randIndex]].shift()
          if(h1){
            if(!prefs[this.allPrefCat[randIndex]]){
              prefs[this.allPrefCat[randIndex]] = []
            }
            prefs[this.allPrefCat[randIndex]].push(h1)
          }
        })
      }
    }

    this.setState({activeForm: {prefs}})

  }

  onChangeSetPrefsTemplate = async (e: any) => {
    let currInput = ''
    if (Array.isArray(e) && e[0]) {
      currInput = e[0]
    }
    console.log(currInput)
    let response = (await window.hmClient.sendAndWait('prefs_template', currInput));
    if(response.success){
      console.log(response.data)
      let prefs = response.data

      let activeForm = this.state.activeForm
      Object.assign(activeForm,{prefs})
      this.setState({activeForm})

    }else{
      //todo modal
    }
  }

  getHorseForm(newName: any, remarks: any) {
    let howToAddToPrefs
    if (!this.state.existingEntry && this.state.options.kid.length > 0) {
      let addAsHorso
      if (this.state.options.horse.length > 0) {
        addAsHorso = (
          <Form.Group>
            <Row>
              <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
                <Form.Label>Dodaj jak innego konia</Form.Label>
              </Col>
              <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
                <Typeahead
                  key={'horse_typeahead_adm_adsAsHorse'}
                  placeholder='Koniaś'
                  //todo onFocus clear addToPrefs and disabled
                  onChange={(e: any) => this.changeAddAsHorseTypeaheadHandler(e)}
                  onFocus={() => this.focusAddAsHorseHandler()}
                  options={this.state.options['horse']}
                  allowNew={false}
                  inputProps={{
                    width: '20px'
                  }}
                  ref={(ref) => this.typeaheadRef['addAsHorse'] = ref}
                />
              </Col>
            </Row>
          </Form.Group>
        )
      }
      howToAddToPrefs = (
        <Form.Group>
          <Row style={{paddingBottom: 15}}>
            <Col><strong>Metoda dopisywania do preferencji dla istniejących dzieciaków (jedna z dwóch)</strong></Col>
          </Row>
          {addAsHorso}
          <Form.Group>
            <Row>
              <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
                <Form.Label>Dodaj wszędzie do preferencji</Form.Label>
              </Col>
              <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
                <Form.Control
                  as="select"
                  default={''}
                  ref={(ref) => this.inputRef['addToPrefLevel'] = ref}
                  onFocus={() => this.focusAddToPrefLevelHandler()}
                >
                  <option>{''}</option>
                  <option>{this.prefLabel.best}</option>
                  <option>{this.prefLabel.nice}</option>
                  <option>{this.prefLabel.isok}</option>
                  <option>{this.prefLabel.limp}</option>
                  <option>{this.prefLabel.excl}</option>
                </Form.Control>
              </Col>
            </Row>
          </Form.Group>
        </Form.Group>
      )
    }
    return (
      <Form>
        {newName}
        {remarks}
        {howToAddToPrefs}
      </Form>
    )
  }

  focusAddAsHorseHandler = () => {
    this.inputRef['addToPrefLevel'].value = ''
    let activeForm = this.state.activeForm
    activeForm =  delete activeForm.addToPrefLevel
    this.setState({activeForm})
  }

  focusAddToPrefLevelHandler = () => {
    this.typeaheadRef['addAsHorse'].getInstance().clear()
    let activeForm = this.state.activeForm
    activeForm =  delete activeForm.addAsHorse
    this.setState({activeForm})
  }

  changeAddAsHorseTypeaheadHandler(e: any) {
    let currInput = ''
    if (Array.isArray(e) && e[0]) {
      currInput = e[0]
    }

    let activeForm = this.state.activeForm
    Object.assign(activeForm,{addAsHorse:currInput})
    this.setState({activeForm})
  }

  getTrainerForm(newName: any, remarks: any) {
    return (
      <Form>
        {newName}
        {remarks}
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
      if (name != 'kid' || this.state.options.horse.length > 0) {
        return (
          <div className={classes.AdminPanelRow} key={row.type + '_adm'}>
            <Row>
              <Col className={classes.Labels}>
                <strong>{row.label}</strong>
              </Col>
            </Row>
            <hr/>
            <Row>
              <Col xs={1} md={1}/>
              <Col>
                <Row style={{paddingBottom: 15}}>
                  <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>Imię</Col>
                  <Col xs={this.fcl.input.xs} md={this.fcl.input.md} className={classes.AutocompleteSelectOne}>
                    <Typeahead
                      key={row.type + '_typeahead_adm'}
                      placeholder={row.label}
                      onChange={(e: any) => this.changeMainLevelTypeaheadHandler(e, name)}
                      onFocus={() => this.focusMainLevelHandler(row.type)}
                      options={this.state.options[name]}
                      // selected={this.state[name].input}
                      allowNew={true}
                      newSelectionPrefix={'Dodaj nowy: '}
                      clearButton
                      inputProps={{
                        width: '20px'
                      }}
                      ref={(ref) => this.typeaheadRef[name] = ref}
                    />
                  </Col>
                </Row>
                {this.getMoreFormForEntry(name)}
                {/*<Row>
                </Row>*/}
              </Col>
              <Col xs={1} md={4}/>
            </Row>
            <br/>
            <Row>
              <Col/>
              <Col xs={"auto"}><Button variant="secondary" onClick={() => console.log('new ' + name)}
                                       disabled={this.state.existingEntry || (this.state.active != name)}>
                Utwórz</Button></Col>
              <Col xs={"auto"}><Button variant="secondary" onClick={() => console.log('edit ' + name)}
                                       disabled={!this.state.existingEntry || (this.state.active != name)}>
                Edytuj</Button></Col>
              <span/>
              <Col xs={"auto"}><Button variant="secondary" onClick={() => console.log('remove ' + name)}
                                       disabled={!this.state.existingEntry || (this.state.active != name)}>
                Usuń</Button></Col>
              {/*todo remember to call get list after any button is pressed*/}
              <Col/>
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
