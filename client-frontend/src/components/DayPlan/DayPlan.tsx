import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper/Paper';
import update from 'immutability-helper';
import { withStyles } from "@material-ui/core/styles";
import { WithStyles, createStyles, Theme } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import SelectComp from '../../lib/SelectComp';
import SelectC from '../../lib/SelectC';
import SuggestInput from '../../lib/SuggestInput';


import { IHorseRidingDayQ, IHorseRidingHourQ } from '../../DataModel';
import myClasses from './DayPlan.module.scss';


const styles = (theme: Theme) => createStyles({
  root: {
    maxHeight: '20vw',
  },
  cssLabel: {
    '&$cssFocused': {

    },
  },
  cssOutlinedInput: {
    '&$cssFocused $notchedOutline': {

    },
  },
  cssFocused: {},
  notchedOutline: {},
});

interface Props extends WithStyles<typeof styles> {

}


const DecoratedDayPlan = withStyles(styles)(class DayPlan extends React.Component<Props, IHorseRidingDayQ> {
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
    options: ['Helena', 'Stefan', 'Marian', 'Olaf'].map(person => ({ value: person.toLowerCase(), label: person })),
    multi: null,
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


  changeHourHandler = (e: any, type: string, index: number[]) => {
    // changeHourHandler = (e: React.FormEvent<HTMLInputElement>, type: string, index: number[]) => {
    const value = (e.target as HTMLInputElement).value;
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
        updatedValues = update(this.state.hours, { [index[0]]: { trainer: { [index[1]]: { $set: value } } } });
        this.setState({ hours: updatedValues });

        // Add next inputs
        isFilled = !updatedValues[index[0]].trainer.some(trainer => !Boolean(trainer));
        if (isFilled) {
          this.setState(prevState => {
            const extended: IHorseRidingHourQ[] = update(prevState.hours, { [index[0]]: { trainer: { $push: [''] } } });
            return {
              hours: extended
            }
          })
        }
        break;
    }
  }



  render() {
    const classes = this.props.classes;

    const hours = this.state.hours.map((hour, hourIndex) => {
      const kids = hour.trainingsDetails.map((training, trainingIndex) => {
        return (
          // <TextField
          //   key={trainingIndex}
          //   label="Dziecko"
          //   value={training.kidName}
          //   onChange={(e) => this.changeHourHandler(e, 'kid', [hourIndex, trainingIndex])}
          //   margin="dense"
          //   variant="outlined"
          // />
          <SuggestInput
            onChange={(e: any) => this.changeHourHandler(e, 'kid', [hourIndex, trainingIndex])}
            label="Dziecko"
            value={training.kidName || ''}
            key={trainingIndex}
            placeholder="Dziecko"

          />

        )
      })

      const horses = hour.trainingsDetails.map((training, trainingIndex) => {
        return training.kidName
          ? (
            <TextField
              key={trainingIndex}
              label="Koń"
              value={training.horse || ''}
              onChange={(e) => this.changeHourHandler(e, 'horse', [hourIndex, trainingIndex])}
              margin="dense"
              variant="outlined"
            />
          ) : null;
      })


      const trainers = hour.trainer.map((tr, trainerIndex) => {
        return (
          <TextField
            key={trainerIndex}
            label="Trener"
            value={tr}
            onChange={(e) => this.changeHourHandler(e, 'trainer', [hourIndex, trainerIndex])}
            margin="dense"
            variant="outlined"
          />
        )
      })

      return (
        <Paper key={hourIndex}>
          <div className={myClasses.OneHourQuery}>
            <div className={myClasses.Hours}>
              <TextField
                label="Godzina"
                value={hour.hour}
                onChange={(e) => this.changeHourHandler(e, 'hour', [hourIndex])}
                margin="dense"
                variant="outlined"
              />
            </div>
            <div className={myClasses.Kids}>
              {kids}
            </div>
            <div className={myClasses.Kids}>
              {horses}
            </div>
            <div className={myClasses.Trainers}>
              {trainers}
            </div>
          </div>
        </Paper>
      )

    })


    return (
      <div className={myClasses.DayPlan}>
        <div style={{ display: 'flex' }}>
          <TextField
            label="Dzień"
            value={this.state.day}
            onChange={(e) => this.setState({ day: e.target.value })}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Wyłączone konie"
            value={this.state.dailyExcludes}
            // onChange={(e) => this.setState({dailyExcludes: e.target.value})}
            margin="dense"
            variant="outlined"
          />
          <TextField
            label="Uwagi"
            value={this.state.remarks}
            onChange={(e) => this.setState({ remarks: e.target.value })}
            margin="dense"
            variant="outlined"
          />
        </div>
        <hr />
        <div>
          {hours}
        </div>
        <Button color="primary" variant="contained" onClick={() => console.log(this.state)}>get state</Button>
        {/* <SelectC options={['jeden', 'dwa', 'trzy']} /> */}
        <SuggestInput />
      </div>
    )

  }
});

export default DecoratedDayPlan;


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