import * as React from 'react';

import classes from './AdminPanel.module.scss';
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import {IBackendMsg} from "../../App";
import {ActionInMsg} from "../../Client";
import {Typeahead} from 'react-bootstrap-typeahead';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import {AlertModal, ConformationModal} from "../Modal";
import Card from 'react-bootstrap/Card';

const grid = 8;

const getItemStyle = (isDragging: any, draggableStyle: any) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: `${grid}px ${grid * 2}px ${grid}px ${grid * 2}px`,
  margin: `0 ${grid}px 0 0`,

  // change background colour if dragging
  background: isDragging ? '#D88208' : '#FDB94C',
  borderRadius: '15px',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver: any) => ({
  background: isDraggingOver ? '#e6e9ee' : '#f7faff',
  borderRadius: '20px',
  margin: '1px',
  border: '1px solid darkgrey',
  display: 'flex',
  padding: grid,
  bottomMargin: '10px',
  overflow: 'auto',
  minHeight: '50px'
});

interface IAdminPanelState {
  options: {
    horse: string[],
    kid: string[],
    trainer: string[]
  },
  active: string | undefined,
  existingEntry: boolean,
  lastKnownServersVersion: {},
  activeForm: {},
  showAlertModal: boolean,
  errorMsg: string,
  showConfModal: boolean
}

class AdminPanel extends React.Component<IAdminPanelState, any> {

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
      lastKnownServersVersion: {},
      activeForm: {},
      showAlertModal: false,
      errorMsg: 'no rsp',
      showConfModal: false
    }
    this.init()
  }

  public async init() {
    await this.refreshAsset()
  }

  public async refreshAsset() {
    let asset = (await window.hmClient.sendAndWait('get_whole_asset', {})).data
    let options: { [key: string]: string[] } = {}
    Object.keys(asset).forEach(key => {
      let keyBezS = key.substr(0, key.length - 1)
      options[keyBezS] = asset[key].map((object: any) => {
        return object.name
      })
      options[keyBezS].sort((name1, name2) => name1.localeCompare(name2, 'pl')) //todo get locale from App
    })

    this.setState({options})
  }

  private getReqName(stateObjectName: string): ActionInMsg {
    return ('get_' + stateObjectName as ActionInMsg)
  }

  changeMainLevelTypeaheadHandler = async (e: any, fieldName: string) => {
    if (Array.isArray(e) && e[0]) {
      let name = e[0]
      let response: IBackendMsg = await window.hmClient.sendAndWait(this.getReqName(fieldName), {name})
      //clear the form after new name was selected
      for (let inputName of Object.keys(this.inputRef)) {
        if (this.inputRef[inputName]) {
          this.inputRef[inputName].value = ''
        }
      }
      if (response.success) {
        this.setState({
          active: fieldName,
          existingEntry: true,
          lastKnownServersVersion: JSON.parse(JSON.stringify(response.data)),
          activeForm: response.data,
        })
        if (response.data.remarks) {
          this.inputRef['remarks'].value = response.data.remarks
        }
      } else {
        name = e[0].label
        let lastKnownServersVersion = {}
        let activeForm = {}
        if (fieldName == 'kid') {
          if (!this.state.activeForm.prefs) {
            activeForm = {prefs: this.getNewRandomPrefs()}
          } else {
            activeForm = {prefs: this.state.activeForm.prefs}
          }
        }
        this.setState({
          active: fieldName,
          existingEntry: false,
          lastKnownServersVersion,
          activeForm
        })
      }
      this.updateFormBySingleField({name})
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

  public updateFormBySingleField(data: any) {
    let activeForm = this.state.activeForm
    let propNames = Object.keys(data)
    if (propNames.length == 1) {
      let propName = propNames[0]
      Object.assign(activeForm, {[propName]: data[propName]})
      this.setState({activeForm})
    } else {
      console.log('invalid call of updateFormBySingleField')
    }
  }

  getMoreFormForEntry(type: string) {
    if (this.state.active == type) {
      let newName
      if (this.state.existingEntry) {
        newName = (
          <Form.Group>
            <Row>
              <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>
                <Form.Label column>Nowe imię (opcjonalnie)</Form.Label>
              </Col>
              <Col xs={this.fcl.input.xs} md={this.fcl.input.md}>
                <Form.Control
                  onChange={(e: any) => this.onChangeNewName(e)}
                  ref={(ref: any) => this.inputRef['newName'] = ref}
                />
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
              <Form.Control
                as="textarea"
                rows={'1'}
                onChange={(e: any) => this.onChangeRemarks(e)}
                ref={(ref: any) => this.inputRef['remarks'] = ref}
              />
            </Col>
          </Row>
        </Form.Group>
      )
      switch (type) {
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

  onChangeNewName(e: any) {
    let newName = e.target.value
    this.updateFormBySingleField({newName})
  }

  onChangeRemarks(e: any) {
    let remarks = e.target.value
    this.updateFormBySingleField({remarks})
  }

  getKidForm(newName: any, remarks: any) {

    let prefs = {}
    if (this.state.activeForm.prefs) {
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
    if (!this.state.existingEntry) {
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
      const listCopy = Array.from(this.state.activeForm.prefs[categoryNameForSource]);
      const [removed] = listCopy.splice(source.index, 1);
      listCopy.splice(destination.index, 0, removed);
      this.state.activeForm.prefs[categoryNameForSource] = listCopy

      this.updateFormBySingleField({prefs})
    } else {
      const sourceClone = Array.from(this.state.activeForm.prefs[categoryNameForSource]);
      const destClone = Array.from(this.state.activeForm.prefs[categoryNameForDestination]);
      const [removed] = sourceClone.splice(source.index, 1);

      destClone.splice(destination.index, 0, removed);

      let prefs = this.state.activeForm.prefs
      prefs[categoryNameForSource] = sourceClone
      prefs[categoryNameForDestination] = destClone

      this.updateFormBySingleField({prefs})
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

  getNewRandomPrefs(): any {
    let numberOfAllCat = this.allPrefCat.length
    let prefs: { [key: string]: string[] } = {}

    //random distribution of all horses in pref categories
    let horses = this.state.options.horse
    for (let horse of horses) {
      let randIndex = Math.floor(Math.random() * Math.floor(numberOfAllCat))
      if (!prefs[this.allPrefCat[randIndex]]) {
        prefs[this.allPrefCat[randIndex]] = []
      }
      prefs[this.allPrefCat[randIndex]].push(horse)
    }
    //make sure all prefs are initialized
    for (let prefCat of this.allPrefCat) {
      if (!prefs[prefCat]) {
        prefs[prefCat] = []
      }
    }
    //if any preference category have to many horses try to reduce length
    for (let prefCat of this.allPrefCat) {
      if (prefs[prefCat].length > Math.ceil(horses.length / numberOfAllCat)) {
        [1, 2, 3].forEach(i => {
          let randIndex = Math.floor(Math.random() * Math.floor(numberOfAllCat))
          let h1 = prefs[this.allPrefCat[randIndex]].shift()
          if (h1) {
            if (!prefs[this.allPrefCat[randIndex]]) {
              prefs[this.allPrefCat[randIndex]] = []
            }
            prefs[this.allPrefCat[randIndex]].push(h1)
          }
        })
      }
    }
    return prefs
  }

  onChangeSetPrefsTemplate = async (e: any) => {
    let currInput = ''
    if (Array.isArray(e)) {
      currInput = e[0]
      let response = (await window.hmClient.sendAndWait('prefs_template', currInput));
      if (response.success) {
        let prefs = response.data

        this.updateFormBySingleField({prefs})
      } else {
        this.setState({showAlertModal: true, errorMsg: response.data.errorMsg})
      }
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
                  onChange={(e: any) => this.changeAddToPrefLevelHandler(e)}
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
    delete activeForm.addToPrefLevel
    this.setState({activeForm})
  }

  focusAddToPrefLevelHandler = () => {
    this.typeaheadRef['addAsHorse'].getInstance().clear()
    let activeForm = this.state.activeForm
    delete activeForm.addAsHorse
    this.setState({activeForm})
  }

  changeAddAsHorseTypeaheadHandler(e: any) {
    let addAsHorse = undefined
    if (Array.isArray(e)) {
      addAsHorse = e[0]
    }
    this.updateFormBySingleField({addAsHorse})
  }

  changeAddToPrefLevelHandler(e: any) {
    let addToPrefLevel = e.target.value
    if (addToPrefLevel) {
      //convert label to prefLevel type
      for (let prefLevel of Object.keys(this.prefLabel)) {
        if (addToPrefLevel == this.prefLabel[prefLevel]) {
          addToPrefLevel = prefLevel
        }
      }
      this.updateFormBySingleField({addToPrefLevel})
    }
  }

  getTrainerForm(newName: any, remarks: any) {
    return (
      <Form>
        {newName}
        {remarks}
      </Form>
    )
  }

  async newEntry(entryType: string) {
    let action = `new_${entryType}` as ActionInMsg
    let entry = this.state.activeForm
    let response = (await window.hmClient.sendAndWait(action, entry));
    if (response.success) {
      this.setState({active: undefined})
      await this.refreshAsset()
    } else {
      this.setState({showAlertModal: true, errorMsg: response.data.errorMsg})
    }
  }

  async editEntry(entryType: string) {
    let action = `edit_${entryType}` as ActionInMsg
    let entry = this.state.activeForm
    let response = (await window.hmClient.sendAndWait(action, entry));
    if (response.success) {
      await this.refreshAsset()
    } else {
      this.setState({showAlertModal: true, errorMsg: response.data.errorMsg})
    }
  }

  async removeEntry(entryType: string) {
    let action = `remove_${entryType}` as ActionInMsg
    let name = this.state.activeForm.name
    let response = (await window.hmClient.sendAndWait(action, {name}));
    if (response.success) {
      this.setState({active: undefined})
      await this.refreshAsset()
    } else {
      this.setState({showAlertModal: true, errorMsg: response.data.errorMsg})
    }
  }

  public wasModified(): boolean {
    let object1 = this.state.activeForm
    let object2 = this.state.lastKnownServersVersion
    let object1Sorted: any = {}
    let object2Sorted: any = {}
    Object.keys(object1).sort().forEach((key) => {
      if(object1[key]){
        object1Sorted[key] = object1[key];
      }
    });
    Object.keys(object2).sort().forEach((key) => {
      if(object2[key]){
        object2Sorted[key] = object2[key];
      }
    });
    return (JSON.stringify(object1Sorted) == JSON.stringify(object2Sorted))
  }

  render() {

    const types = [
      {type: 'kid', label: 'Bachory'},
      {type: 'horse', label: 'Koniasie'},
      {type: 'trainer', label: 'Kadra'},]
    const formForEachEntryType = types.map((row: { type: string, label: string }) => {
      let type = row.type
      if (type != 'kid' || this.state.options.horse.length > 0) {
        return (
          <div>
            <Card className={classes.AdminPanelCard}>
              <Container className={classes.AdminPanelRow} key={row.type + '_adm'}>
                <Row>
                  <Col>
                    <div className={classes.TitleContainer}>
                      <h3 className={classes.Title}>{row.label}</h3>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col xs={1} md={1}/>
                  <Col>
                    <Row style={{paddingBottom: 15}}>
                      <Col xs={this.fcl.label.xs} md={this.fcl.label.md}>Imię</Col>
                      <Col xs={this.fcl.input.xs} md={this.fcl.input.md} className={classes.AutocompleteSelectOne}>
                        <Typeahead
                          key={row.type + '_typeahead_adm'}
                          placeholder={row.label}
                          onChange={(e: any) => this.changeMainLevelTypeaheadHandler(e, type)}
                          onFocus={() => this.focusMainLevelHandler(row.type)}
                          options={this.state.options[type]}
                          // selected={this.state[name].input}
                          allowNew={true}
                          newSelectionPrefix={'Dodaj nowy: '}
                          clearButton
                          inputProps={{
                            width: '20px'
                          }}
                          ref={(ref) => this.typeaheadRef[type] = ref}
                        />
                      </Col>
                    </Row>
                    {this.getMoreFormForEntry(type)}
                    {/*<Row>
                </Row>*/}
                  </Col>
                  <Col xs={1} md={4}/>
                </Row>
                <Row className={classes.AdminPanelButtons}>
                  <Col/>
                  <Col xs={"auto"}><Button variant="secondary" onClick={() => this.newEntry(type)}
                                           disabled={this.state.existingEntry || (this.state.active != type)}>
                    Utwórz</Button></Col>
                  <Col xs={"auto"}><Button variant="secondary" onClick={() => this.editEntry(type)}
                                           disabled={(!this.state.existingEntry) || (this.state.active != type) || (this.wasModified())}>
                    Zapisz zmiany</Button></Col>
                  <span/>
                  <Col xs={"auto"}><Button variant="secondary" onClick={() => this.setState({showConfModal: true})}
                                           disabled={!this.state.existingEntry || (this.state.active != type)}>
                    Wywal</Button></Col>
                  <Col/>
                </Row>
              </Container>
            </Card>
            <br/>
          </div>
        );
      }
    })
    return (
      <div className={classes.AdminPanel}>
        <Col/>
        <Col>
          {formForEachEntryType}
        </Col>
        <Col/>
        <AlertModal
          show={this.state.showAlertModal}
          onHide={() => {
            this.setState({showAlertModal: false})
          }}
          msg={this.state.errorMsg}
        />
        <ConformationModal
          show={this.state.showConfModal}
          onHide={() => {
            this.setState({showConfModal: false})
          }}
          callAfterConfirm={async () => {
            await this.removeEntry(this.state.active)
          }}
        />
      </div>
    )
  }
}

export default AdminPanel;
