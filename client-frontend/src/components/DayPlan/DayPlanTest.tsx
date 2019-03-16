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



class Test extends React.Component {
   state = {
      testList: ['jeden', undefined],
      options: ['jeden', 'dwa', 'trzy', 'cztery'],

      day: '',
      remarks: '',
      dailyExcludes: [],
      hours: [
         {
            hour: '1230',
            trainer: ['Paulina'],
            trainingsDetails: [
               { kidName: 'Julka Mala', horse: '' },
               { kidName: 'Maja' },
               { kidName: 'Julka Lonza' },
               { kidName: 'Ola C' },
               { kidName: '' },
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
      ],
   }

   changeHandler = (selected: string[], index: number) => {
      if (selected) {
         let updatedValues = update(this.state.testList, { [index]: { $set: selected[0] } })

         // Add empty value if all selected
         if (!updatedValues.some(val => val === undefined)) {
            updatedValues = update(updatedValues, { $push: [undefined] });
         }


         this.setState({
            testList: updatedValues
         })
      }
   }

   inputChangeHandler = (value: string, index: number) => {
      if (value === '') {
         const updatedValues = update(this.state.testList, { $splice: [[index, 1]] })
         this.setState({ testList: updatedValues })
      }
   }


   render() {
      console.log('STATE - render: ', this.state)

      const kids = this.state.testList.map((test, index) => (
         <Typeahead
            key={index}
            id={index}
            placeholder="Dziecko"
            onInputChange={value => this.inputChangeHandler(value, index)}
            onChange={selected => this.changeHandler(selected, index)}
            options={this.state.options}
            selected={test === undefined ? [] : [test]}
         // clearButton
         // selected={[training.kidName] || undefined}
         // allowNew
         // clearButton
         // selectHintOnEnter
         // newSelectionPrefix="Dodań dziecko: "
         />
      ))


      return (
         <div>
            {kids}
         </div>
      )

   }
};

export default Test;