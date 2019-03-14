import * as React from 'react';
import Calendar from 'react-calendar';
// import Calendar from 'react-calendar/dist/entry.nostyle';
import { RouteComponentProps } from "react-router-dom";

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

  componentDidMount() {
    //TODO get list from API
  }

  render() {
    return (
      <div className={classes.DiaryList}>
        <Calendar
          onChange={this.dateChangeHandler}
          value={this.state.date} />
      </div>
    )

  }
};

export default DiaryList;