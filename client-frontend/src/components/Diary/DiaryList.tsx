import * as React from 'react';
import Calendar, { CalendarTileProperties } from 'react-calendar';
// import Calendar from 'react-calendar/dist/entry.nostyle';
import { RouteComponentProps } from "react-router-dom";
import ReactTooltip from 'react-tooltip';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import classes from './Diary.module.scss';

const dateToString = (date: Date | Date[]): (string | string[]) => {
  let dates = Array.isArray(date) ? date : [date];
  return dates.map(date => (
    `${date.getFullYear()}${(date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1))}${date.getDate() < 10 ? '0' + date.getDate() : date.getDate()}`
  ))
}

class DiaryList extends React.Component<RouteComponentProps> {
  state = {
    date: new Date(),
    plannedDays: [],
  }

  dateChangeHandler = (date: Date | Date[]) => {
    // this.setState({ date })
    const checkedDate = dateToString(date)[0];
    if ((this.state.plannedDays as string[]).indexOf(checkedDate) > -1) {
      this.props.history.push(this.props.match.url + '/' + dateToString(date)[0]);
    }
  }

  getTileContent = ({ date, view }: CalendarTileProperties) => {
    const checkedDate = dateToString(date)[0];
    return view === 'month' ? <DayElement date={date} isPlanned={((this.state.plannedDays as string[]).indexOf(checkedDate) > -1) ? true : false} /> : null;
  }

  getTileClass = ({ date, view }: CalendarTileProperties) => {
    if (view !== 'month') {
      return null;
    } else {
      const checkedDate = dateToString(date)[0];
      return [classes.CalendarDay, (this.state.plannedDays as string[]).indexOf(checkedDate) > -1 ? classes.PlannedDay : null].join(' ')
    }
  }

  async listDays() {
    let asset = (await window.hmClient.sendAndWait('list_days', {})).data;
    let dayList: Date[];
    dayList = asset.map((str: string) => {
      return new Date(str);
    });
    const plannedDays: string | string[] = dateToString(dayList);
    this.setState({ plannedDays })
  }

  async componentDidMount() {
    await this.listDays();
  }

  render() {
    return this.state.plannedDays.length ? (
      <Container className={classes.DiaryList} fluid>
        <br/>
        <br/>
        <Row>
          <Col>
            <div className={classes.Calendar}>
              <Calendar
                onChange={this.dateChangeHandler}
                // value={this.state.date}
                tileClassName={this.getTileClass}
                tileContent={this.getTileContent}
              />
            </div>
          </Col>
        </Row>
      </Container>
    ) : (
      <span>Loading...</span>
    )
  }
}

export default DiaryList;



const DayElement: React.SFC<{ date: Date, isPlanned: boolean | undefined }> = (props) => {
  const monthDay = props.date.getDate();
  //TODO datatip depends on day schedule!
  return (
    <>
      <div className={classes.DayElement} data-tip={props.isPlanned ? 'Zaplanowany dzień' : null}>
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