import * as React from 'react';
import { NavLink } from "react-router-dom";
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import orange from '@material-ui/core/colors/orange';




import classes from './AppMenu.module.scss';
const color = orange[500];



class AppMenu extends React.Component {
  render() {
    return (
      <div className={classes.AppMenu}>
        <AppBar position="fixed" color="default">
          <Toolbar>
            <NavLink to="/dayplan" activeClassName={classes.Active} className={classes.Link}>
              <Typography variant="h6" color="inherit">
                Zaplanuj dzień
            </Typography>
            </NavLink>
            <NavLink to="/diary" activeClassName={classes.Active} className={classes.Link}>
              <Typography variant="h6" color="inherit">
                Dziennik
          </Typography>
            </NavLink>
            <NavLink to="/admin" activeClassName={classes.Active} className={classes.Link}>
              <Typography variant="h6" color="inherit">
                Panel szefa
          </Typography>
            </NavLink>
            <NavLink to="/about-us" activeClassName={classes.Active} className={classes.Link}>
              <Typography variant="h6" color="inherit">
                O apce
          </Typography>
            </NavLink>
          </Toolbar>
        </AppBar>
      </div>
    )

  }
};

export default AppMenu;