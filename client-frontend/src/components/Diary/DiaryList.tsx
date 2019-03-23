import * as React from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar';
// import Calendar from 'react-calendar/dist/entry.nostyle';
import { RouteComponentProps } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import classes from './Diary.module.scss';

const dateToString = (date: Date | Date[]) => {
  let dates = Array.isArray(date) ? date : [date];
  return dates.map(date => (
    `${date.getFullYear()}${(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
  ))
}

class DiaryList extends React.Component<RouteComponentProps> {
  state = {
    date: new Date(),
    diary: [
      '20190202',
      '20190203',
      '20190204',
      '20190205',
      '20190206'
    ]
  }

  dateChangeHandler = (date: Date | Date[]) => {
    this.setState({ date })
    this.props.history.push(this.props.match.url + '/' + dateToString(date)[0]);
  }

  getTileContent = ({ date, view }: CalendarTileProperties) => {
    return <DayElement date={date} />;
  }

  getTileClass = ({ date, view }: CalendarTileProperties) => {
    return view === 'month' ? classes.CalendarDay : null;
  }

  componentDidMount() {
    //TODO get list from API
  }

  render() {
    return (
      <Container className={classes.DayPlan} fluid>
        <Row>
          <Col>
            <div className={classes.DiaryList}>
              <Calendar
                onChange={this.dateChangeHandler}
                value={this.state.date}
                tileClassName={this.getTileClass}
                tileContent={this.getTileContent}
              />
            </div>
          </Col>
        </Row>
      </Container>
    )

  }
};

export default DiaryList;



const DayElement: React.SFC<{ date: Date }> = (props) => {
  const monthDay = props.date.getDate();
  //TODO datatip depends on day schedule!
  const datatip = props.date.getFullYear();
  return (
    <>
      <div className={classes.DayElement} data-tip={datatip}>
        {monthDay}
      </div>
      <ReactTooltip
        effect="solid"
        event="mouseenter"
        eventOff="mouseleave"
      />
    </>
  )
}