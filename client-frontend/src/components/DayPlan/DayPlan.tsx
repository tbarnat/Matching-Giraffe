import * as React from 'react';
import update from 'immutability-helper';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Typeahead } from 'react-bootstrap-typeahead';

import { IHorseRidingDayQ, IHorseRidingHourQ } from '../../DataModel';
import classes from './DayPlan.module.scss';


interface IState extends IHorseRidingDayQ {

  options?: {
    kid?: { id: number, label: string }[] | string[],
    trainer?: { id: number, label: string }[] | string[],
    horse?: { id: number, label: string }[] | string[],
  }
}


class DayPlan extends React.Component<any, any> {
  state = {
    day: '',
    remarks: '',
    dailyExcludes: [],
    // hours: [
    //   {
    //     hour: '1230',
    //     trainer: ['Paulina'],
    //     trainingsDetails: [
    //       { kidName: 'Julka Mala', horse: '' },
    //       { kidName: 'Maja' },
    //       { kidName: 'Julka Lonza' },
    //       { kidName: 'Ola C' },
    //       { kidName: undefined },
    //     ]
    //   },
    //   {
    //     hour: '1430',
    //     trainer: ['Eva'],
    //     trainingsDetails: [
    //       { kidName: 'Ola C' },
    //       { kidName: 'Weronika' },
    //       { kidName: 'Emilka' },
    //       { kidName: 'Kalina' },
    //       { kidName: 'Paula' },
    //       { kidName: undefined },
    //     ]
    //   },
    //   {
    //     hour: '1530',
    //     trainer: ['Eva'],
    //     trainingsDetails: [
    //       { kidName: 'Paula' },
    //       { kidName: 'Kalina' },
    //       { kidName: undefined },
    //     ]auto
    //   },
    // ],
    hours: [
      {
        hour: '',
        trainer: ['test1'],
        trainingsDetails: [
          { kidName: 'Julka Mala', horse: '' },
          { kidName: 'Maja' },
          { kidName: 'Julka Lonza' },
          { kidName: 'Ola C' },
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
    options2: {}
  };
  // state = {
  //   day: '',
  //   remarks: '',
  //   dailyExcludes: [],
  //   hours: [
  //     {
  //       hour: '1230',
  //       trainer: ['Paulina'],
  //       trainingsDetails: [
  //         { kidName: 'Julka Mala', horse: '' },
  //         { kidName: 'Maja' },
  //         { kidName: 'Julka Lonza' },
  //         { kidName: 'Ola C' },
  //       ]
  //     },
  //     {
  //       hour: '1430',
  //       trainer: ['Eva'],
  //       trainingsDetails: [
  //         { kidName: 'Ola C' },
  //         { kidName: 'Weronika' },
  //         { kidName: 'Emilka' },
  //         { kidName: 'Kalina' },
  //         { kidName: 'Paula' },
  //       ]
  //     },
  //     {
  //       hour: '1530',
  //       trainer: ['Eva'],
  //       trainingsDetails: [
  //         { kidName: 'Paula' },
  //         { kidName: 'Kalina' },
  //       ]
  //     },
  //   ]
  // };



  // changeHourHandler0 = (e: any, type: string, index: number[]) => {
  //   console.log('CHANGE HANDLER', e, type, index)
  //   if (!e[0]) {
  //     let updatedValues: IHorseRidingHourQ[];
  //     let value = e[0] ? e[0] : '';
  //     this.setState(prevState => {
  //       // Remove redundant inputs
  //       const kidsNum = prevState.hours[index[0]].trainingsDetails.length - 1;
  //       if (!value && index[0] < kidsNum) {
  //         updatedValues = update(prevState.hours, { [index[0]]: { trainingsDetails: { $splice: [[index[1], 1]] } } });
  //         console.log('TO REMOVE | updatedValues: ', updatedValues);
  //         return { ...prevState, hours: updatedValues };
  //       }
  //     })
  //   }


  //   if (e[0]) {
  //     // const value = (e.target as HTMLInputElement).value;
  //     // Value - based on used component
  //     let value = e[0] ? e[0] : '';
  //     let updatedValues: IHorseRidingHourQ[];
  //     let isFilled: boolean;
  //     switch (type) {
  //       case 'hour':
  //         this.setState(prevState => {
  //           // Remove redundant inputs
  //           const hoursNum = prevState.hours.length - 1;
  //           if (!value && index[0] < hoursNum) {
  //             updatedValues = update(prevState.hours, { $splice: [[index[0], 1]] });
  //             return { hours: updatedValues };
  //           }

  //           // Set  new Value
  //           updatedValues = update(this.state.hours, { [index[0]]: { hour: { $set: value } } })
  //           // Add next inputs
  //           isFilled = !updatedValues.some(hour => !Boolean(hour.hour));
  //           if (isFilled) {
  //             const extended: IHorseRidingHourQ[] = update(updatedValues, { $push: [{ hour: '', trainer: [''], trainingsDetails: [{ kidName: '' }] }] });
  //             return {
  //               hours: extended
  //             }
  //           } else {
  //             return {
  //               hours: updatedValues
  //             }
  //           }
  //         })
  //         break;

  //       case 'kid':
  //         this.setState(prevState => {

  //           // Remove redundant inputs
  //           const kidsNum = prevState.hours[index[0]].trainingsDetails.length - 1;
  //           if (!value && index[1] < kidsNum) {
  //             updatedValues = update(prevState.hours, { [index[0]]: { trainingsDetails: { $splice: [[index[1], 1]] } } });
  //             return { hours: updatedValues };
  //           }

  //           updatedValues = update(this.state.hours, { [index[0]]: { trainingsDetails: { [index[1]]: { kidName: { $set: value } } } } });
  //           // Add next inputs
  //           isFilled = !updatedValues[index[0]].trainingsDetails.some(kid => !Boolean(kid.kidName));
  //           if (isFilled) {
  //             const extended: IHorseRidingHourQ[] = update(updatedValues, { [index[0]]: { trainingsDetails: { $push: [{ kidName: '' }] } } });
  //             return {
  //               hours: extended
  //             }
  //           } else {
  //             return {
  //               hours: updatedValues
  //             }
  //           }
  //         })
  //         break;

  //       case 'horse':
  //         updatedValues = update(this.state.hours, { [index[0]]: { trainingsDetails: { [index[1]]: { horse: { $set: value } } } } });
  //         this.setState({ hours: updatedValues });
  //         break;

  //       case 'trainer':
  //         this.setState(prevState => {

  //           // Remove redundant inputs
  //           const trainersNum = prevState.hours[index[0]].trainer.length - 1;
  //           if (!value && index[1] < trainersNum) {
  //             updatedValues = update(prevState.hours, { [index[0]]: { trainer: { $splice: [[index[1], 1]] } } });
  //             return { hours: updatedValues };
  //           }

  //           updatedValues = update(this.state.hours, { [index[0]]: { trainer: { [index[1]]: { $set: value } } } });
  //           // Add next inputs
  //           isFilled = !updatedValues[index[0]].trainer.some(trainer => !Boolean(trainer));
  //           if (isFilled) {
  //             const extended: IHorseRidingHourQ[] = update(updatedValues, { [index[0]]: { trainer: { $push: [''] } } });
  //             return {
  //               hours: extended
  //             }
  //           } else {
  //             return {
  //               hours: updatedValues
  //             }
  //           }

  //         })
  //         break;
  //     }
  //   }
  // }


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


  componentDidMount() {
    this.init();
    // this.resetForm();
  }

  render() {
    console.log('=======================')
    console.log('STATE: ', this.state)
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
            // label="Koń"
            // <Form.Control
            //    placeholder="Koń"
            //    key={trainingIndex}
            //    value={training.horse || ''}
            //    onChange={(e: any) => this.changeHourHandler(e, 'horse', [hourIndex, trainingIndex])}
            //    onFocus={(e: any) => this.focusHandler(e, 'horse', hourIndex)} />
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

      //   const trainers = hour.trainer.map((tr, trainerIndex) => {
      //     return (
      //        <Form.Control
      //           key={trainerIndex}
      //           // label="Trener"
      //           placeholder="Trener"
      //           value={tr}
      //           onChange={(e: any) => this.changeHourHandler(e, 'trainer', [hourIndex, trainerIndex])}
      //           onFocus={(e: any) => this.focusHandler(e, 'trainer', hourIndex)}
      //        />
      //     )
      //  })

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
            {/* <Col className={classes.DeleteButtons}>
                     {deleteButtons}
                  </Col> */}
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
        <Button color="primary" variant="primary" onClick={() => console.log(this.state)}>get state</Button>
        <Button color="orange" variant="secondary" onClick={() => console.log(this.state.hours[0].trainingsDetails)}>get hours</Button>
        <Button color="orange" variant="secondary" onClick={this.resetForm}>Reset Form</Button>
        {/* <Button variant="secondary" onClick={this.updateState}>change state</Button> */}
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