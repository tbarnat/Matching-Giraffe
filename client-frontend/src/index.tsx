import * as React from 'react';
import * as ReactDOM from 'react-dom';
// import App from './App';
import AdminMainPanel from "./componets/AdminMainPanel";
import './index.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <AdminMainPanel/>,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
