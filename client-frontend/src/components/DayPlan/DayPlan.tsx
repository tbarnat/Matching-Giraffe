import * as React from 'react';
import update from 'immutability-helper';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Alert from 'react-bootstrap/Alert';
import { Typeahead } from 'react-bootstrap-typeahead';

import { IHorseRidingDayQ } from '../../DataModel';
import classes from './DayPlan.module.scss';


/*interface IState extends IHorseRidingDayQ {

  options?: {
    kid?: { id: number, label: string }[] | string[],
    trainer?: { id: number, label: string }[] | string[],
    horse?: { id: number, label: string }[] | string[],
  }
}*/


class DayPlan extends React.Component<any, any> {
  state = {
    day: this.getTodayString(),
    remarks: 'Twórcy apki to miszcze',
    dailyExcludes: [],
    hours: [
      {
        hour: '1100',
        trainer: ['Eva'],
        trainingsDetails: [
          { kidName: 'Agnieszka E', horse: 'Bella' },
          { kidName: undefined },
        ]
      },
    ],
    options: {
      kid: [],
      // kids: ['Helena', 'Stefan', 'Marian', 'Olaf'].map((kid, index) => ({id: index, label: kid})),
      horse: [],
      trainer: []
    },
    isError: false,
    errorMsg: null,
  };

  public getTodayString(): string{
    let today = new Date
    return today.toISOString().split('T')[0]
  }

  changeHourHandler = (e: any, index: number) => {
    const value = e.target.value;
    let updatedHours = update(this.state.hours, { [index]: { hour: { $set: value } } });

    if (!value) {
      updatedHours = update(updatedHours, { $splice: [[index, 1]] });
    }
    if (!updatedHours.some(hour => hour.hour === '')) {
      updatedHours = update(updatedHours, {
        $push: [{
          hour: '',
          trainer: [],
          trainingsDetails: [
            {
              kidName: undefined,
              horse: undefined,
            }
          ]
        }]
      })
    }
    this.setState({ hours: updatedHours })
  }

  // KIDS CHANGE
  //===========================================================================================================
  changeKidHandler = (selected: string[], indexes: number[]) => {
    const [hourIndex, kidIndex] = indexes;
    // updatedKids is this.state.hours
    let updatedKids = update(this.state.hours, { [hourIndex]: { trainingsDetails: { [kidIndex]: { kidName: { $set: selected[0] } } } } });
    if (!updatedKids[hourIndex]['trainingsDetails'].some(kid => kid.kidName === undefined)) {
      updatedKids = update(updatedKids, { [hourIndex]: { trainingsDetails: { $push: [{ kidName: undefined, horse: undefined }] } } });
    }
    this.setState(() => ({ hours: updatedKids }))
  }

  inputChangeKidHandler = (value: string, indexes: number[]) => {
    const [hourIndex, kidIndex] = indexes;
    if (value === '') {
      const updatedKids = update(this.state.hours, { [hourIndex]: { trainingsDetails: { $splice: [[kidIndex, 1]] } } });
      this.setState({ hours: updatedKids })
    }
  }

  // HORSE CHANGE
  //===========================================================================================================
  changeHorseHandler = (selected: string[], indexes: number[]) => {
    const [hourIndex, kidIndex] = indexes;
    let updatedHorses = update(this.state.hours, { [hourIndex]: { trainingsDetails: { [kidIndex]: { horse: { $set: selected[0] } } } } });
    this.setState(() => ({ hours: updatedHorses }))
  }

  // TRAINER CHANGE
  //===========================================================================================================
  changeTrainerHandler = (selected: string[], indexes: number[]) => {
    const [hourIndex, kidIndex] = indexes;
    let updatedTrainer = update(this.state.hours, { [hourIndex]: { trainer: { $set: selected } } });
    this.setState(() => ({ hours: updatedTrainer }))
  }

  removeInput = (indexes: number[]) => {
    const [hourIndex, kidIndex] = indexes;
    const updatedKids = update(this.state.hours, { [hourIndex]: { trainingsDetails: { $splice: [[kidIndex, 1]] } } });
    this.setState({ hours: updatedKids })
  }


  //Reset Form
  //===========================================================================================================
  resetForm = () => {
    this.setState((prevState: any) => ({
      ...prevState,
      hours: [
        {
          hour: '',
          trainer: [],
          trainingsDetails: [
            { kidName: undefined }
          ]
        },
      ],
    }))
  }


  //Init options from server
  //===========================================================================================================
  async init() {
    let asset = (await window.hmClient.sendAndWait('get_whole_asset', {})).data;
    console.log(asset)
    let options: { [key: string]: string[] } = {}
    Object.keys(asset).forEach(key => {
      let keyBezS = key.substr(0, key.length - 1)
      options[keyBezS] = asset[key].map((object: any) => {
        return object.name
      })
      options[keyBezS].sort()
    })
    this.setState({ options })
  }


  generate = async () => {
    const hours = this.state.hours.map(hour => {
      return {
        ...hour,
        trainingsDetails: hour.trainingsDetails.filter(td => td.kidName)
      }
    })
    const query = {
      hours: hours,
      day: this.state.day,
      remarks: this.state.remarks,
      dailyExcludes: this.state.dailyExcludes
    }
    let asset = await window.hmClient.sendAndWait('get_matches', query);
    if (asset.success) {
      this.setState({ ...asset.data.solution, error: null })
    } else {
      this.setState({
        isError: true,
        errorMsg: asset.data.errorMsg
      })
    }
  }


  saveDay = async () => {
    const hours = this.state.hours.map(hour => {
      return {
        ...hour,
        trainingsDetails: hour.trainingsDetails.filter(td => td.kidName)
      }
    })
    const query = {
      hours: hours,
      day: this.state.day,
      remarks: this.state.remarks,
    }
    let asset = await window.hmClient.sendAndWait('save_matches', query);
    if (asset.success) {
      this.setState({ errorMsg: null, error: false, saveSucceed: true })
    } else {
      this.setState({
        errorMsg: asset.data.errorMsg, isError: true
      })
    }
  }


  componentDidMount() {
    this.init();
    // this.resetForm();
  }

  render() {
    // console.log('=======================')
    // console.log('STATE: ', this.state)
    const hours = this.state.hours.map((hour, hourIndex) => {
      const kids = hour.trainingsDetails.map((training, trainingIndex) => {
        return (
          <div className={classes.KidAndButtonContainer} key={trainingIndex}
          >
            <Typeahead
              id={trainingIndex}
              placeholder="Dziecko"
              onInputChange={(value: string) => this.inputChangeKidHandler(value, [hourIndex, trainingIndex])}
              onChange={(e: any) => this.changeKidHandler(e, [hourIndex, trainingIndex])}
              options={this.state.options.kid}
              selected={training.kidName === undefined ? [] : [training.kidName]}
              // clearButton
              inputProps={{
                width: '20px'
              }}
            // selected={[training.kidName] || undefined}
            // allowNew
            // clearButton
            // selectHintOnEnter
            // newSelectionPrefix="Dodań dziecko: "
            />
            {training.kidName && <Button className={classes.DeleteButton} variant="outline-danger" onClick={() => this.removeInput([hourIndex, trainingIndex])}>&times;</Button>}
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
              onChange={(e: any) => this.changeHorseHandler(e, [hourIndex, trainingIndex])}
              options={this.state.options.horse}
              selected={training.horse ? [training.horse] : []}
              //   allowNew
              //   clearButton
              selectHintOnEnter
            //   newSelectionPrefix="Dodań dziecko: "
            />
          ) : null;
      })


      const trainers = (
        <Typeahead
          placeholder="Trenerzy"
          id={`Trainers-${hourIndex}`}
          onChange={(selected: string[]) => this.changeTrainerHandler(selected, [hourIndex])}
          options={this.state.options.trainer}
          selected={this.state.hours[hourIndex].trainer}
          multiple
          selectHintOnEnter
          emptyLabel="Brak wyników"
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
                  placeholder="Godzina"
                  value={hour.hour}
                  onChange={(e: any) => this.changeHourHandler(e, hourIndex)}
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
      <Container className={classes.DayPlan} fluid>
        <Row>
          <Col className={classes.LabelSection}>
            <span className={classes.Label}>Dzień</span>
            <Form.Control
              placeholder="Dzień"
              value={this.state.day}
              onChange={(e: any) => this.setState({ day: e.target.value })}
            />
          </Col>
          <Col className={classes.LabelSection}>
            <span className={classes.Label}>Wyłączone konie</span>
            <Typeahead
              placeholder="Wyłączone konie"
              id={'dailyExcludes'}
              onChange={(e: any) => this.setState({ dailyExcludes: e })}
              options={this.state.options.horse}
              selected={this.state.dailyExcludes}
              multiple
              selectHintOnEnter
              emptyLabel="Brak wyników"
            />
          </Col>
          <Col className={classes.LabelSection}>
            <span className={classes.Label}>Uwagi</span>
            <Form.Control
              placeholder="Uwagi"
              value={this.state.remarks}
              onChange={(e: any) => this.setState({ remarks: e.target.value })}
            />
          </Col>
        </Row>
        <hr />
        {hours}
        {/* <Button color="primary" variant="primary" onClick={() => console.log(this.state)}>get state</Button> */}
        {/* <Button color="orange" variant="secondary" onClick={() => console.log(this.state.hours[0].trainingsDetails)}>get hours</Button> */}
        <Alert dismissible variant="danger" onClose={() => this.setState({ isError: null })} show={this.state.isError}>
          <p>
            {this.state.errorMsg}
          </p>
        </Alert>

        <Row>
          <Col className={classes.ButtonSection}>
            <Button variant="secondary" onClick={this.resetForm}>Reset Form</Button>
            <Button variant="primary" onClick={this.generate}>Generate</Button>
            <Button variant="outline-primary" onClick={this.saveDay}>{'Save Day'}</Button>
          </Col>
        </Row>
      </Container >
    )

  }
};

export default DayPlan;


// let query = {
//   day: '20190314',
//   remarks: 'przyjade o 13stej',
//   hours: [
//       {
//           hour: '1230',
//           trainer: ['Paulina'],
//           trainingsDetails: [
//               {kidName: 'Julka Mala'},
//               {kidName: 'Maja'},
//               {kidName: 'Julka Lonza'},
//               {kidName: 'Ola C'},
//           ]
//       },
//       {
//           hour: '1430',
//           trainer: ['Eva'],
//           trainingsDetails: [
//               {kidName: 'Ola C'},
//               {kidName: 'Weronika'},
//               {kidName: 'Emilka'},
//               {kidName: 'Kalina'},
//               {kidName: 'Paula'},
//           ]
//       },
//       {
//           hour: '1530',
//           trainer: ['Eva'],
//           trainingsDetails: [
//               {kidName: 'Paula'},
//               {kidName: 'Kalina'},
//           ]
//       },

//   ],
//   dailyExcludes: ['Czejen'] //'Czejen','Parys','Bella','Jadzia','Dzidzia','Bracio','Lady'
// }