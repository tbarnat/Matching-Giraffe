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
import SelectHRC from "./components/SelectHRC/SelectHRC";

export interface IBackendMsg {
  replyTo?: string //id of incoming message
  success: boolean
  data: any | BackendData
}

declare global {
  interface Window {
    hmClient: Client
    isLoggedIn: boolean
  }
}

class App extends React.Component {

  constructor(props: any) {
    super(props)
    let locationHost = "ws://" + location.host
    if (location.port == '3000') { //temp redirect for react bootstrap environment
      locationHost = "ws://" + location.hostname + ':8080'
    }
    window.hmClient = new Client(locationHost);
  }

  state = {
    isLoggedIn: false
  }

  /*async componentDidMount(){
    (async () => {
      this.setState({isLoggedIn: await window.hmClient.login('qwe', 'asd')})
    })()
  }*/

  setLoggedIn(isLoggedIn: boolean){
    console.log('x')
    this.setState({isLoggedIn})
  }

  render() {
    let getAppOrSignIn
    if(this.state.isLoggedIn){
      getAppOrSignIn = (
        <div className="App">
          <AppMenu/>
          <div className="Content">
            <Switch>
              <Route path="/day" component={DayPlan}/>
              <Route path="/diary/:chosendate" component={Diary}/>
              <Route path="/diary" component={DiaryList}/>
              <Route path="/admin" component={AdminPanel}/>
              <Route path="/about" component={About}/>
              <Route path="/test" component={DayPlanTest}/>
            </Switch>
          </div>
        </div>
      )
    }else{
      getAppOrSignIn = (
        <div className="App">
          {/*<SignIn/>*/}
          <div className="Content">
            <Switch>
              <Route path="/diary/:chosendate" component={Diary}/>
              {/*!/diary/:chosendate/:shortUUID*/}
              <Route path="/" component={(props: any) => <SignIn {...props} setLoggedIn = {(flag: boolean) => this.setLoggedIn(flag)}/>}/>
            </Switch>
          </div>
        </div>
      )
    }

    return (
      <div>
        {getAppOrSignIn}
      </div>
  );
  }

}

export default App;
