import * as React from 'react';
import {Switch, Route} from "react-router-dom";

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import SignIn from './components/SingIn/SignIn';
import DayPlan from './components/DayPlan/DayPlan';
import Diary from './components/Diary/Diary';
import DiaryList from './components/Diary/DiaryList';
import AdminPanel from './components/AdminPanel/AdminPanel';
import Account from './components/Account/Account';
import Client from './Client'
import {BackendData} from "../../src/server/DataModel";
import {About} from "./components/About";
import MenuLike from "./components/AppMenu/MenuLike";

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
    userName: undefined
  }

  //uncomment to enable auto login for dev, before the sessions are enabled
   /*async componentDidMount(){
     (async () => {
       await window.hmClient.login('qwe', 'asd')
       this.setState({userName: 'qwe'})
     })()
   }
*/
  public setUserName(userName: string) {
    this.setState({userName})
  }

  render() {
    let getAppOrSignIn
    if (this.state.userName) {
      getAppOrSignIn = (
        <div className="App">
          <AppMenu/>
          <div className="Content">
            <Switch>
              <Route path="/day" component={DayPlan}/>
              <Route path="/diary/:chosendate" component={
                (props: any) => <Diary {...props} userName={this.state.userName}/>
              }/>
              <Route path="/diary" component={DiaryList}/>
              <Route path="/admin" component={AdminPanel}/>
              <Route path="/account" component={
                (props: any) => <Account {...props}
                                         setUserName={(userName: string) => this.setUserName(userName)}
                                         userName={this.state.userName}
                />
              }/>
              <Route path="/about" component={About}/>
            </Switch>
          </div>
        </div>
      )
    } else {
      getAppOrSignIn = (
        <div className="App">
          <MenuLike/>
          <div className="Content">
            <Switch>
              <Route path="/diary/:chosendate/:dayHash" component={Diary}/>
              {/*!/diary/:chosendate/:shortUUID*/}
              <Route path="/" component={
                (props: any) => <SignIn {...props} setUserName={(userName: string) => this.setUserName(userName)}/>
              }/>
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
