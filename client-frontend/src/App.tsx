import * as React from 'react';
import { Switch, Route } from "react-router-dom";

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import DayPlan from './components/DayPlan/DayPlan';
import DayPlanTest from './components/DayPlan/DayPlanTest';
import Diary from './components/Diary/Diary';
import DiaryList from './components/Diary/DiaryList';
import AdminPanel from './components/AdminPanel/AdminPanel';


class App extends React.Component {
  render() {
    return (
      <div className="App">
        <AppMenu />
        <div className="Content">

          <Switch>
            <Route path="/day" component={DayPlan} />
            <Route path="/diary/:chosendate" component={Diary} />
            <Route path="/diary" component={DiaryList} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/test" component={DayPlanTest} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
