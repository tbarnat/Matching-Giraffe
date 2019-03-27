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
import classes from './Diary.module.scss';


interface IState extends IHorseRidingDayQ {

  options?: {
    kid?: { id: number, label: string }[] | string[],
    trainer?: { id: number, label: string }[] | string[],
    horse?: { id: number, label: string }[] | string[],
  }
}


class DayPlan extends React.Component<any, any> {
  state = {
    day: '2019-01-08',
    remarks: 'Bla bla',
    dailyExcludes: ['Bracio'],
    hours: [
      {
        hour: '1200',
        trainer: ['Eva'],
        trainingsDetails: [
          { kidName: 'Agnieszka E', horse: 'Bella' },
          { kidName: 'Julka R' },
          { kidName: 'Ania P.' },
          { kidName: undefined },
        ]
      },
    ],
  };


  componentDidMount() {
    // this.init();
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
          placeholder="Trenerzy"
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
                  placeholder="Godzina"
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
      <Container className={classes.DayPlan} fluid>
        <Row>
          <Col className={classes.LabelSection}>
            <span className={classes.Label}>Dzień</span>
            <Form.Control
              placeholder="Dzień"
              value={this.state.day}
              disabled
            />
          </Col>
          <Col className={classes.LabelSection}>
            <span className={classes.Label}>Wyłączone konie</span>
            <Typeahead
              placeholder="Wyłączone konie"
              id={'dailyExcludes'}
              onChange={(e: any) => this.setState({ dailyExcludes: e })}
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
              placeholder="Uwagi"
              value={this.state.remarks}
              disabled
            />
          </Col>
        </Row>
        <hr />
        {hours}
        <Button color="primary" variant="primary" onClick={() => console.log(this.state)}>get state</Button>
        <Button color="orange" variant="secondary" onClick={() => console.log(this.state.hours[0].trainingsDetails)}>get hours</Button>
      </Container >
    )

  }
};

export default DayPlan;