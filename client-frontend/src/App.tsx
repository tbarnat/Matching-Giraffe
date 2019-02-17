import * as React from 'react';
import { Switch, Route } from "react-router-dom";

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import DayPlan from './components/DayPlan/DayPlan';

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <AppMenu />

        <div className="Content">
          <Switch>
            <Route path="/dayplan" component={DayPlan} />
          </Switch>
        </div>

      </div>
    );
  }
}

export default App;
