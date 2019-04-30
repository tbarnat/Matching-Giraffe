import * as React from 'react';
import {Switch, Route} from "react-router-dom";

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import SignIn from './components/SingIn/SignIn';
import DayPlan from './components/DayPlan/DayPlan';
import DayPlanTest from './components/DayPlan/DayPlanTest';
import Diary from './components/Diary/Diary';
import DiaryList from './components/Diary/DiaryList';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Client from './Client'
import {BackendData} from "../../src/server/DataModel";
import {About} from "./components/About";

export interface IBackendMsg {
  replyTo?: string //id of incoming message
  success: boolean
  data: any | BackendData
}

declare global {
  interface Window {
    hmClient: Client
  }
}

class App extends React.Component {

  constructor(props: any) {
    super(props)
    window.hmClient = new Client(location.host);
    /*(async () => {
      await window.hmClient.login('qwe', 'asd');
    })()*/
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="App">
        {/*<AppMenu/>*/}
        <SignIn/>
        <div className="Content">

          <Switch>
            <Route path="/day" component={DayPlan} />
            <Route path="/diary/:chosendate" component={Diary} />
            {/*/diary/:chosendate/:shortUUID*/}
            <Route path="/diary" component={DiaryList} />
            <Route path="/admin" component={AdminPanel} />
            <Route path="/about" component={About} />
            <Route path="/test" component={DayPlanTest} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
