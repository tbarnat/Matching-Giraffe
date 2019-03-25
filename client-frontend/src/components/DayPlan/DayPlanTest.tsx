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
   rerender: boolean = false;
   kidInputRefs: any = {};
   stopChange: boolean;

   state = {
      testList: ['jeden', undefined],
      options: ['jeden', 'dwa', 'trzy', 'cztery'],
   }

   changeHandler = (selected: string[], index: number) => {
      // console.log(this.kidInputRefs[index].getInstance().getInput())
      if (this.kidInputRefs[index].getInstance().getInput().value === '') {
         console.log('should remove')
         this.kidInputRefs[index].getInstance().getInput().blur();
         const updatedValues = update(this.state.testList, { $splice: [[index, 1]] })
         this.setState({ testList: updatedValues })
      } else {

         let updatedValues = update(this.state.testList, { [index]: { $set: selected[0] } })
         console.log(updatedValues)

         //Remove value in case of delete all text at once
         if (!this.kidInputRefs[index].getInstance().getInput().value) {
            updatedValues = update(updatedValues, { $splice: [[index, 1]] })
            console.log(updatedValues)
         }

         // Add empty value if all selected
         if (!updatedValues.some(val => val === undefined)) {
            updatedValues = update(updatedValues, { $push: [undefined] });
         }

         this.setState({
            testList: updatedValues
         })
         console.log('ChaneHANDLER: ', updatedValues);
      }
   }

   inputChangeHandler = (value: string, index: number) => {
      if (value === '') {
         const updatedValues = update(this.state.testList, { $splice: [[index, 1]] })
         this.setState({ testList: updatedValues })
         console.log('REMOVE VALUE: ', updatedValues);
      }
   }

   removeInput = (index: number) => {
      const updatedValues = update(this.state.testList, { $splice: [[index, 1]] })
      this.setState({ testList: updatedValues })
   }

   render() {
      console.log('STATE - render: ', { ...this.state })

      const kids = this.state.testList.map((test, index) => {
         // console.log(test)
         return (
            <div style={{ display: 'flex' }} key={index}
            >
               <Typeahead
                  id={index}
                  placeholder=""
                  onInputChange={value => this.inputChangeHandler(value, index)}
                  onChange={selected => this.changeHandler(selected, index)}
                  options={this.state.options}
                  selected={test === undefined ? [] : [test]}
                  ref={ref => this.kidInputRefs[index] = ref}
               // clearButton
               // selected={[training.kidName] || undefined}
               // allowNew
               // clearButton
               // selectHintOnEnter
               // newSelectionPrefix="Dodań dziecko: "
               />
               {test ? <Button onClick={() => this.removeInput(index)}>x</Button> : null}
            </div>
         )
      })


      return (
         <div>
            {kids}
         </div>
      )

   }
};

export default Test;