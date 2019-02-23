import * as React from 'react';
import { Switch, Route } from "react-router-dom";
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import './App.scss';
import AppMenu from './components/AppMenu/AppMenu';
import DayPlan from './components/DayPlan/DayPlan';


class App extends React.Component {
  state = {
    theme1: {
      palette: {
        primary: { 
          main: '#f4511e',
          light: '#ff844c',
          dark: '#b91400',
        },
        secondary: { main: '#fff' },
      },
    }
  }

  render() {
    return (
      <MuiThemeProvider theme={createMuiTheme(this.state.theme1)}>
        <div className="App">
          <AppMenu />
          <div className="Content">

            <Switch>
              <Route path="/dayplan" component={DayPlan} />
            </Switch>
          </div>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
