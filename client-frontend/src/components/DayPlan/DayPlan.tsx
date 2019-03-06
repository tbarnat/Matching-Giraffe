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


interface State extends IHorseRidingDayQ {
  focused: {
    index: number,
    name: string
  }
  options?: {
    kids?: string[],
    trainers?: { id: number, label: string }[],
    horses?: { id: number, label: string }[],
  }

}


class DayPlan extends React.Component<any, State> {
  state = {
    day: '',
    remarks: '',
    dailyExcludes: [],
    hours: [
      {
        hour: '',
        trainer: [''],
        trainingsDetails: [
          { kidName: '', horse: '' },
        ]
      },
    ],
    options: {
      kids: ['Helena', 'Stefan', 'Marian', 'Olaf'],
      // kids: ['Helena', 'Stefan', 'Marian', 'Olaf'].map((kid, index) => ({id: index, label: kid})),
      horses: ['Koń 1', 'Koń 2', 'Jakiś koń', 'Bucefał'].map((horse, index) => ({ id: index, label: horse })),
    },
    focused: {
      index: -1,
      name: ''
    },
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


  inputChangeHandler = (value: string, type: string, index: number[]) => {
    console.log(value, type, index)
    if (!value) {
      switch (type) {
        case 'kid':
          this.setState(prevState => {
            // Remove redundant inputs
            let updatedValues: IHorseRidingHourQ[];

            const kidsNum = prevState.hours[index[0]].trainingsDetails.length - 1;

            // if (index[1] < kidsNum) {
              updatedValues = update(prevState.hours, { [index[0]]: { trainingsDetails: { $splice: [[index[1], 1]] } } });
              console.log(updatedValues);
              return { hours: updatedValues };
            // } else {
              // return prevState;
            // }
          })
          break;
      }
    }
  }


  changeHourHandler = (e: any, type: string, index: number[]) => {
    // console.log(e, type, index)
    if (e[0]) {
      // const value = (e.target as HTMLInputElement).value;
      // Value - based on used component
      let value = e[0] ? e[0] : '';
      let updatedValues: IHorseRidingHourQ[];
      let isFilled: boolean;

      switch (type) {
        case 'hour':
          this.setState(prevState => {
            // Remove redundant inputs
            const hoursNum = prevState.hours.length - 1;
            if (!value && index[0] < hoursNum) {
              updatedValues = update(prevState.hours, { $splice: [[index[0], 1]] });
              return { hours: updatedValues };
            }

            // Set  new Value
            updatedValues = update(this.state.hours, { [index[0]]: { hour: { $set: value } } })
            // Add next inputs
            isFilled = !updatedValues.some(hour => !Boolean(hour.hour));
            if (isFilled) {
              const extended: IHorseRidingHourQ[] = update(updatedValues, { $push: [{ hour: '', trainer: [''], trainingsDetails: [{ kidName: '' }] }] });
              return {
                hours: extended
              }
            } else {
              return {
                hours: updatedValues
              }
            }
          })
          break;

        case 'kid':
          this.setState(prevState => {

            // Remove redundant inputs
            const kidsNum = prevState.hours[index[0]].trainingsDetails.length - 1;
            if (!value && index[1] < kidsNum) {
              updatedValues = update(prevState.hours, { [index[0]]: { trainingsDetails: { $splice: [[index[1], 1]] } } });
              console.log(updatedValues)
              return { hours: updatedValues };
            }

            updatedValues = update(this.state.hours, { [index[0]]: { trainingsDetails: { [index[1]]: { kidName: { $set: value } } } } });
            // Add next inputs
            isFilled = !updatedValues[index[0]].trainingsDetails.some(kid => !Boolean(kid.kidName));
            if (isFilled) {
              const extended: IHorseRidingHourQ[] = update(updatedValues, { [index[0]]: { trainingsDetails: { $push: [{ kidName: '' }] } } });
              return {
                hours: extended
              }
            } else {
              return {
                hours: updatedValues
              }
            }
          })
          break;

        case 'horse':
          updatedValues = update(this.state.hours, { [index[0]]: { trainingsDetails: { [index[1]]: { horse: { $set: value } } } } });
          this.setState({ hours: updatedValues });
          break;

        case 'trainer':
          this.setState(prevState => {

            // Remove redundant inputs
            const trainersNum = prevState.hours[index[0]].trainer.length - 1;
            if (!value && index[1] < trainersNum) {
              updatedValues = update(prevState.hours, { [index[0]]: { trainer: { $splice: [[index[1], 1]] } } });
              return { hours: updatedValues };
            }

            updatedValues = update(this.state.hours, { [index[0]]: { trainer: { [index[1]]: { $set: value } } } });
            // Add next inputs
            isFilled = !updatedValues[index[0]].trainer.some(trainer => !Boolean(trainer));
            if (isFilled) {
              const extended: IHorseRidingHourQ[] = update(updatedValues, { [index[0]]: { trainer: { $push: [''] } } });
              return {
                hours: extended
              }
            } else {
              return {
                hours: updatedValues
              }
            }

          })


          break;
      }
    }
  }

  focusHandler = (e: any, focusedName: string, hourIndex: number) => {
    this.setState({
      focused:
      {
        name: focusedName,
        index: hourIndex
      }
    })
  }

  isFocused = (name: string, index: number) => {
    return (
      this.state.focused &&
      this.state.focused.name === name &&
      this.state.focused.index === index
    )
  }

  render() {
    const hours = this.state.hours.map((hour, hourIndex) => {
      const kids = hour.trainingsDetails.map((training, trainingIndex) => {
        return (
          // label="Dziecko"
          // <Form.Control
          //   onChange={(e: any) => this.changeHourHandler(e, 'kid', [hourIndex, trainingIndex])}
          //   value={training.kidName || ''}
          //   key={trainingIndex}
          //   placeholder="Dziecko"
          //   onFocus={(e: any) => this.focusHandler(e, 'kid', hourIndex)} />
          <Typeahead
            key={trainingIndex}
            placeholder="Dziecko"
            onInputChange={(value: string) => this.changeHourHandler(value, 'kid', [hourIndex, trainingIndex])}
            // onInputChange={(value: string) => this.inputChangeHandler(value, 'kid', [hourIndex, trainingIndex])}
            onChange={(e: any) => this.changeHourHandler(e, 'kid', [hourIndex, trainingIndex])}
            onFocus={(e: any) => this.focusHandler(e, 'kid', hourIndex)}
            options={this.state.options.kids}
            selected={[training.kidName]}
          // allowNew
          // clearButton
          // selectHintOnEnter
          // newSelectionPrefix="Dodań dziecko: "

          />
        )
      })

      const horses = hour.trainingsDetails.map((training, trainingIndex) => {
        return training.kidName
          ? (
            // label="Koń"
            <Form.Control
              placeholder="Koń"
              key={trainingIndex}
              value={training.horse || ''}
              onChange={(e: any) => this.changeHourHandler(e, 'horse', [hourIndex, trainingIndex])}
              onFocus={(e: any) => this.focusHandler(e, 'horse', hourIndex)} />
            //   <Typeahead
            //   key={trainingIndex}
            //   placeholder="Dziecko"
            //   onChange={(e: any) => this.changeHourHandler(e, 'kid', [hourIndex, trainingIndex])}
            //   onFocus={(e: any) => this.focusHandler(e, 'dailyExcludes', -1)}
            //   options={this.state.options.kids}
            //   // selected={[training.kidName]}
            //   allowNew
            //   clearButton
            //   selectHintOnEnter
            //   newSelectionPrefix="Dodań dziecko: "
            // />
          ) : null;
      })


      const trainers = hour.trainer.map((tr, trainerIndex) => {
        return (
          <Form.Control
            key={trainerIndex}
            // label="Trener"
            placeholder="Trener"
            value={tr}
            onChange={(e: any) => this.changeHourHandler(e, 'trainer', [hourIndex, trainerIndex])}
            onFocus={(e: any) => this.focusHandler(e, 'trainer', hourIndex)}
          />
        )
      })

      return (
        <Card key={hourIndex} className={classes.OneHour}>
          <Row>
            <Col className={classes.Hours}>
              <span className={[classes.HourLabel, this.isFocused('hour', hourIndex) ? classes.Active : null].join(' ')}>Godzina</span>
              <Form.Control
                // label="Godzina"
                placeholder="Godzina"
                value={hour.hour}
                onChange={(e: any) => this.changeHourHandler(e, 'hour', [hourIndex])}
                onFocus={(e: any) => this.focusHandler(e, 'hour', hourIndex)}
              />
            </Col>
            <Col className={classes.Kids}>
              <span className={[classes.KidLabel, this.isFocused('kid', hourIndex) ? classes.Active : null].join(' ')}>Gówniaki</span>
              {kids}
            </Col>
            <Col className={classes.Horses}>
              <span className={[classes.HorseLabel, this.isFocused('horse', hourIndex) ? classes.Active : null].join(' ')}>Konie</span>
              {horses}
            </Col>
            <Col className={classes.Trainers}>
              <span className={[classes.TrainerLabel, this.isFocused('trainer', hourIndex) ? classes.Active : null].join(' ')}>Trenerzy</span>
              {trainers}
            </Col>
          </Row>
        </Card>
      )

    })


    return (
      <Container className={classes.DayPlan} fluid>
        <Row>
          <Col>
            <span className={[classes.DayLabel, this.isFocused('day', -1) ? classes.Active : null].join(' ')}>Dzień</span>
            <Form.Control
              // label="Dzień"
              placeholder="Dzień"
              value={this.state.day}
              onChange={(e: any) => this.setState({ day: e.target.value })}
              onFocus={(e: any) => this.focusHandler(e, 'day', -1)}
            />
          </Col>
          <Col>
            <span className={[classes.DailyExcludesLabel, this.isFocused('dailyExcludes', -1) ? classes.Active : null].join(' ')}>Wyłączone konie</span>
            {/* <Form.Control
              placeholder="Wyłączone konie"
              // label="Wyłączone konie"
              // value={this.state.dailyExcludes}
              // onChange={(e: any) => this.setState({dailyExcludes: e.target.value})}
              onFocus={(e: any) => this.focusHandler(e, 'dailyExcludes', -1)}
            /> */}
            <Typeahead
              placeholder="Wyłączone konie"
              // label="Wyłączone konie"
              // value={this.state.dailyExcludes}
              onChange={(e: any) => this.setState({ dailyExcludes: e })}
              onFocus={(e: any) => this.focusHandler(e, 'dailyExcludes', -1)}
              options={['kon1', 'kon2']}
              selected={this.state.dailyExcludes}
              allowNew
              clearButton
              multiple
              minLength={1}
              selectHintOnEnter
              newSelectionPrefix="Inny koń: "
            />
          </Col>
          <Col>
            <span className={[classes.RemarksLabel, this.isFocused('remarks', -1) ? classes.Active : null].join(' ')}>Uwagi</span>
            <Form.Control
              // label="Uwagi"
              placeholder="Uwagi"
              value={this.state.remarks}
              onChange={(e: any) => this.setState({ remarks: e.target.value })}
              onFocus={(e: any) => this.focusHandler(e, 'remarks', -1)}
            />
          </Col>
        </Row>
        <hr />
        {hours}
        <Button color="primary" variant="primary" onClick={() => console.log(this.state)}>get state</Button>
        <Button color="orange" variant="secondary" onClick={() => console.log(this.state.hours[0].trainingsDetails)}>get hours</Button>
      </Container>
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