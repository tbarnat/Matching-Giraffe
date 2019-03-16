import update from 'immutability-helper';

import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Typeahead } from 'react-bootstrap-typeahead';

import { IHorseRidingDayQ, IHorseRidingHourQ } from '../../DataModel';



import * as React from 'react';



class Test extends React.Component {
   state = {
      testList: ['jeden', undefined],
      options: ['jeden', 'dwa', 'trzy', 'cztery']
   }

   changeHandler = (selected: string[], index: number) => {
      if (selected) {
         let updatedValues = update(this.state.testList, { [index]: { $set: selected[0] } })

         // Add empty value if all selected
         if (!updatedValues.some(val => val === undefined)) {
            updatedValues = update(updatedValues, {$push: [undefined]});
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

      const testList = this.state.testList.map((test, index) => (
         <Typeahead
            key={index}
            id={index}
            placeholder="Dziecko"
            // onInputChange={(value: string) => this.changeHourHandler(value, 'kid', [hourIndex, trainingIndex])}
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
            {testList}
         </div>
      )

   }
};

export default Test;