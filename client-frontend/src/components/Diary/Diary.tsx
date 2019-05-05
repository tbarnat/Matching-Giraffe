import * as React from 'react';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Modal from "react-bootstrap/Modal";
import {Typeahead} from 'react-bootstrap-typeahead';

import {IHorseRidingDayQ, IHorseRidingHourQ, ITrainingQ} from '../../DataModel';
import classes from './Diary.module.scss';
import {ConformationModal} from "../Modal";
import NoDiaryEntry from "./NoDiaryEntry";
import MenuLike from "../AppMenu/MenuLike";


interface IState extends IHorseRidingDayQ {
  options?: {
    kid?: { id: number, label: string }[] | string[],
    trainer?: { id: number, label: string }[] | string[],
    horse?: { id: number, label: string }[] | string[],
  }
}


class Diary extends React.Component<any, any> {
  state = {
    day: '',
    remarks: '',
    dailyExcludes: [],
    hours: [
      {
        hour: '',
        trainer: [''],
        trainingsDetails: [
          {kidName: '', horse: ''},
          {kidName: undefined},
        ]
      },
    ],
    dayHash: undefined,
    showConfModal: false,
    showLinkModal: false,
    incorrectUrlHash: false,
    isInitialized: false
  };


  async componentDidMount() {
    const chosendate = this.props.match.params.chosendate;
    const splittedDate = chosendate.match(/(\d{4})(\d{2})(\d{2})/);
    let formattedDate = `${splittedDate[1]}-${splittedDate[2]}-${splittedDate[3]}`
    if (this.props.userName) {
      let day = await window.hmClient.sendAndWait('get_day', {name: formattedDate});
      if (day.success) {
        this.setState({...day.data, incorrectUrlHash: undefined, isInitialized: true})
      } else {
        this.props.history.replace('/diary')
        /*this.setState({
          isError: true,
          errorMsg: asset.data.errorMsg
        })*/
      }
    } else {
      //let dayHash = window.location.pathname.split('/').pop()
      let dayHash = this.props.match.params.dayHash;
      let day = await window.hmClient.sendAndWait('get_day_view_by_hash', {dayHash}, false);
      if (day.success && day.data.day == formattedDate) {
        this.setState({...day.data, isInitialized: true})
      } else {
        this.setState({incorrectUrlHash: true, isInitialized: true})
      }
    }


  }

  async removeDay() {
    let name = this.state.day
    let response = (await window.hmClient.sendAndWait('remove_day', {name}));
    if (!response.success) {
      console.log('#smt not right:', response.data.errorMsg)
    }
  }

  public getButtonSection() {
    if (this.state.incorrectUrlHash !== false) {
      return (
        <Col>
          <Row>
            <Col className={classes.ButtonSection}>
              <Button variant="warning" onClick={() => this.setState({showConfModal: true})}>Usuń</Button>
              <Button variant="secondary" onClick={() => {
                let dayToEdit = JSON.parse(JSON.stringify(this.state))
                delete dayToEdit.showConfModal
                dayToEdit = dayToEdit as IHorseRidingDayQ
                dayToEdit.hours = dayToEdit.hours.map((hour: IHorseRidingHourQ) => {
                  let trainingsDetails = (hour.trainingsDetails.map((trainingDetail: ITrainingQ) => {
                    return {kidName: trainingDetail.kidName}
                  }))
                  trainingsDetails.push({kidName: undefined})
                  Object.assign(hour, {trainingsDetails})
                  return hour
                })
                this.props.history.push({pathname: '/day', state: dayToEdit})

              }}>Edytuj</Button>
              <Button variant="outline-secondary" onClick={() => {
                this.props.history.push('/diary')
              }}>Wróc</Button>
            </Col>
          </Row>
          <Row>
            <Col className={classes.ButtonSection}>
              <Button variant="secondary" onClick={() => {
                this.setState((prevState: any) => ({
                  ...prevState, showLinkModal: true
                }))
              }}>Pokaż publiczny link</Button>
              <Button variant="secondary" disabled={true}>Publikuj na Buniu</Button>
            </Col>
          </Row>
        </Col>
      )
    }
  }

  public getShareableLink(): string {
    return window.location.href + '/' + this.state.dayHash
  }

  render() {
    if (this.state.isInitialized) {
      if (!this.state.incorrectUrlHash) {
        const hours = this.state.hours.map((hour, hourIndex) => {
          const kids = hour.trainingsDetails.map((training, trainingIndex) => {
            return (
              <div className={classes.KidAndButtonContainer} key={trainingIndex}
              >
                <Typeahead
                  id={trainingIndex}
                  placeholder="Dziecko"
                  options={[]}
                  selected={training.kidName === undefined ? [] : [training.kidName]}
                  inputProps={{
                    width: '20px'
                  }}
                  disabled
                />
              </div>
            )
          })

          const horses = hour.trainingsDetails.map((training, trainingIndex) => {
            return training.kidName
              ? (
                <Typeahead
                  key={trainingIndex}
                  id={trainingIndex}
                  placeholder="Koń"
                  options={[]}
                  selected={training.horse ? [training.horse] : []}
                  disabled
                />
              ) : null;
          })


          const trainers = (
            <Typeahead
              // placeholder="Trenerzy"
              id={`Trainers-${hourIndex}`}
              options={[]}
              selected={this.state.hours[hourIndex].trainer}
              multiple
              emptyLabel="Brak wyników"
              disabled
            />
          )

          return (
            <Card key={hourIndex} className={classes.OneHour}>
              <Row>
                <Col>
                  <div className={[classes.Hours, classes.LabelSection].join(' ')}>
                    <span className={classes.Label}>Godzina</span>
                    <Form.Control
                      // label="Godzina"
                      // placeholder="Godzina"
                      value={hour.hour}
                      disabled
                    />
                  </div>
                  <div className={[classes.Trainers, classes.LabelSection].join(' ')}>
                    <span className={classes.Label}>Trenerzy</span>
                    {trainers}
                  </div>
                </Col>
                <Col className={[classes.Kids, classes.LabelSection].join(' ')}>
                  <span className={classes.Label}>Gówniaki</span>
                  {kids}
                </Col>
                <Col className={[classes.Horses, classes.LabelSection].join(' ')}>
                  <span className={classes.Label}>Konie</span>
                  {horses}
                </Col>
              </Row>
            </Card>
          )

        })

        return (
          <Container className={classes.Diary} fluid>
            <Col/>
            <Col>
              <br/>
              <Row>
                <Col className={classes.LabelSection}>
                  <span className={classes.Label}>Dzień</span>
                  <Form.Control
                    // placeholder="Dzień"
                    value={this.state.day}
                    disabled
                  />
                </Col>
                <Col className={classes.LabelSection}>
                  <span className={classes.Label}>Wyłączone konie</span>
                  <Typeahead
                    // placeholder="Wyłączone konie"
                    id={'dailyExcludes'}
                    onChange={(e: any) => this.setState({dailyExcludes: e})}
                    options={[]}
                    selected={this.state.dailyExcludes}
                    multiple
                    emptyLabel="Brak wyników"
                    disabled
                  />
                </Col>
                <Col className={classes.LabelSection}>
                  <span className={classes.Label}>Uwagi</span>
                  <Form.Control
                    // placeholder="Uwagi"
                    value={this.state.remarks}
                    disabled
                  />
                </Col>
              </Row>
              <hr/>
              {hours}
              {/*<Button color="primary" variant="primary" onClick={() => console.log(this.state)}>get state</Button>
        <Button color="orange" variant="secondary" onClick={() => console.log(this.state.hours[0].trainingsDetails)}>get hours</Button>*/}
              <Row>
                {this.getButtonSection()}
              </Row>
            </Col>
            <Col/>


            <ConformationModal
              show={this.state.showConfModal}
              onHide={() => {
                this.setState({showConfModal: false})
              }}
              callAfterConfirm={async () => {
                await this.removeDay()
                this.props.history.replace('/diary')
              }}
            />
            <Modal
              show={this.state.showLinkModal}
              onHide={() => {
                this.setState((prevState: any) => ({
                  ...prevState, showLinkModal: false
                }))
              }}
            >
              <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter-showlink">
                  Publiczny link
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {this.getShareableLink()}
              </Modal.Body>
              {/*<Modal.Footer style={{justifyContent: 'right', fontSize: '14px'}}>
                Skopiowany do schowka :)
              </Modal.Footer>*/}
            </Modal>
          </Container>
        )
      } else {
        return <NoDiaryEntry/>
      }
    } else {
      return <span>Loading...</span>
    }
  }
};

export default Diary;