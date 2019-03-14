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
import { RouteComponentProps } from "react-router-dom";


interface IProps extends RouteComponentProps<any> {
  chosendate: string;
}

class Diary extends React.Component<IProps, IHorseRidingDayQ> {

   constructor(props: IProps) {
    super(props)
    this.state = {
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
  };


  componentDidMount() {
    console.log(this.props)
     const param = this.props.match.params.chosendate;
     //TODO get data from API based on params (np. 20190203)
  }

  render() {
    const hours = this.state.hours.map((hour, hourIndex) => {
      const kids = hour.trainingsDetails.map((training, trainingIndex) => {
        return (
          <Form.Control
            key={trainingIndex}
            value={training.kidName}
            readOnly
          />
        )
      })

      const horses = hour.trainingsDetails.map((training, trainingIndex) => {
        return training.kidName
          ? (
            <Form.Control
              key={trainingIndex}
              value={training.horse}
              readOnly
            />
          ) : null;
      })

      const trainers = hour.trainer.map((tr, trainerIndex) => {
        return (
          <Form.Control
            key={trainerIndex}
            value={tr}
            readOnly
          />
        )
      })

      return (
        <Card key={hourIndex} className={classes.OneHour}>
          <Row>
            <Col className={classes.Hours}>
              <span className={[classes.HourLabel].join(' ')}>Godzina</span>
              <Form.Control
                value={hour.hour}
                readOnly
              />
            </Col>
            <Col className={classes.Kids}>
              <span className={[classes.KidLabel].join(' ')}>Gówniaki</span>
              {kids}
            </Col>
            <Col className={classes.Horses}>
              <span className={[classes.HorseLabel].join(' ')}>Konie</span>
              {horses}
            </Col>
            <Col className={classes.Trainers}>
              <span className={[classes.TrainerLabel].join(' ')}>Trenerzy</span>
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
            <span className={[classes.DayLabel].join(' ')}>Dzień</span>
            <Form.Control
              value={this.state.day}
              readOnly
            />
          </Col>
          <Col>
            <span className={[classes.DailyExcludesLabel].join(' ')}>Wyłączone konie</span>
            <Form.Control
              value={'TODO multiselect'}
              readOnly
            />
          </Col>
          <Col>
            <span className={[classes.RemarksLabel].join(' ')}>Uwagi</span>
            <Form.Control
              value={this.state.remarks}
              readOnly
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

export default Diary;
