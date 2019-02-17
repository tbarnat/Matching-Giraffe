import * as React from 'react';
import TextField from '@material-ui/core/TextField';
import update from 'immutability-helper';

import { IHorseRidingDayQ, IHorseRidingHourQ } from '../../DataModel';
import classes from './DayPlan.module.scss';


class DayPlan extends React.Component<{}, IHorseRidingDayQ> {
  state = {
    day: '',
    remarks: '',
    dailyExcludes: [],
    hours: [
      {
        hour: '1230',
        trainer: ['Paulina'],
        trainingsDetails: [
          { kidName: 'Julka Mala' },
          { kidName: 'Maja' },
          { kidName: 'Julka Lonza' },
          { kidName: 'Ola C' },
        ]
      },
      {
        hour: '1430',
        trainer: ['Eva'],
        trainingsDetails: [
          { kidName: 'Ola C' },
          { kidName: 'Weronika' },
          { kidName: 'Emilka' },
          { kidName: 'Kalina' },
          { kidName: 'Paula' },
        ]
      },
      {
        hour: '1530',
        trainer: ['Eva'],
        trainingsDetails: [
          { kidName: 'Paula' },
          { kidName: 'Kalina' },
        ]
      },
    ]
  };


  changeHourHandler = (e: React.FormEvent<HTMLInputElement>, type: string, index: number[]) => {
    const value = (e.target as HTMLInputElement).value;
    switch (type) {
      case 'hour':
        {
          const updatedValues = update(this.state.hours, { [index[0]]: { hour: { $set: value } } })
          this.setState({ hours: updatedValues })

          // Add next inputs
          const isFilled = !updatedValues.some(hour => !Boolean(hour.hour));
          if (isFilled) {
            this.setState(prevState => ({
              hours: prevState.hours.concat({
                hour: '',
                trainer: [''],
                trainingsDetails: [
                  { kidName: '' },
                ]
              })
            }))
          }
          break;
        }
      case 'kid':
        {
          const updatedValues: IHorseRidingHourQ[] = update(this.state.hours, { [index[0]]: { trainingsDetails: { [index[1]]: { kidName: { $set: value } } } } });
          this.setState({ hours: updatedValues });

          // Add next inputs
          const isFilled = !updatedValues[index[0]].trainingsDetails.some(kid => !Boolean(kid.kidName));
          if (isFilled) {
            this.setState(prevState => {
              const extended: IHorseRidingHourQ[] = update(prevState.hours, { [index[0]]: { trainingsDetails: { $push: [{ kidName: '' }] } } });
              return {
                hours: extended
              }
            })
          }
          break;
        }
      case 'trainer': {
        {
          const updatedValues: IHorseRidingHourQ[] = update(this.state.hours, { [index[0]]: { trainer: { [index[1]]: { $set: value } } } });
          this.setState({ hours: updatedValues });

          // Add next inputs
          const isFilled = !updatedValues[index[0]].trainer.some(trainer => !Boolean(trainer));
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
    }
  }

  // }

  render() {
    const hours = this.state.hours.map((hour, hourIndex) => {
      const kids = hour.trainingsDetails.map((kid, kidIndex) => {
        return (
          <input type="text" key={kidIndex} placeholder="Dziecko" value={kid.kidName} onChange={(e) => this.changeHourHandler(e, 'kid', [hourIndex, kidIndex])} />
        )
      })
      const trainers = hour.trainer.map((tr, trainerIndex) => {
        return (
          <input type="text" key={trainerIndex} placeholder="Trener" value={tr} onChange={(e) => this.changeHourHandler(e, 'trainer', [hourIndex, trainerIndex])} />
        )
      })

      return (
        <div className={classes.OneHourQuery} key={hourIndex}>
          <div className={classes.Hours}>
            <input type="text" placeholder="Godzina" onChange={(e) => this.changeHourHandler(e, 'hour', [hourIndex])} value={hour.hour} />
          </div>
          <div className={classes.Kids}>
            {kids}
          </div>
          <div className={classes.Trainers}>
            {trainers}
          </div>
          {/* <div className={classes.Horses}>
            <input type="text" placeholder="Koń" />
            <input type="text" placeholder="Koń" />
          </div> */}
        </div>
      )

    })


    return (
      <div className={classes.DayPlan}>
        <div style={{ display: 'flex' }}>
          <input type="text" placeholder="Dzień" />
          <input type="text" placeholder="Wyłączone konie" />
          <input type="text" placeholder="Uwagi" />
        </div>
        <hr />
        <div>
          {hours}
          {/* <div className={classes.OneHourQuery}>
            <div className={classes.Hours}>
              <input type="text" placeholder="Godzina" onChange={(e) => this.changeHandler(e)} />
            </div>
            <div className={classes.Kids}>
              <input type="text" placeholder="Dziecko" />
              <input type="text" placeholder="Dziecko" />
            </div>
            <div className={classes.Trainers}>
              <input type="text" placeholder="Trener" />
              <input type="text" placeholder="Trener" />
            </div>
            <div className={classes.Horses}>
              <input type="text" placeholder="Koń" />
              <input type="text" placeholder="Koń" />
            </div>
          </div> */}
        </div>
      </div>
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