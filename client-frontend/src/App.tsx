import * as React from 'react';
import {Switch, Route} from "react-router-dom";

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import DayPlan from './components/DayPlan/DayPlan';
import Diary from './components/Diary/Diary';
import DiaryList from './components/Diary/DiaryList';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Client from './Client'
import {BackendData} from "../../src/server/DataModel";

export interface IBackendMsg {
  replyTo?: string //id of incoming message
  success: boolean
  data: any | BackendData
}

declare global {
  interface Window {
    hmClient: Client
  }

  interface Window {
    isLoggedIn: boolean
  }
}

class App extends React.Component {

  constructor(props: any) {
    super(props)

    window.hmClient = new Client('ws://3.122.192.224:8080'); //'ws://localhost:8080'
    let logAction = async () => {
      window.isLoggedIn = await window.hmClient.login('qwe', 'asd');
      console.log(window.isLoggedIn)
    }
    logAction()
  }

  componentDidMount() {
  }

  render() {
    return (
      <div className="App">
        <AppMenu/>
        <div className="Content">

          <Switch>
            <Route path="/day" component={DayPlan}/>
            <Route path="/diary/:chosendate" component={Diary}/>
            <Route path="/diary" component={DiaryList}/>
            <Route path="/admin" component={AdminPanel}/>
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
