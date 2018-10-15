import * as React from 'react';
import NewEditHorso from "./NewEditHorso";
import ViewHorsoList from "./ViewHorsoList";
/*import {IHorso, IKido, IStableAsset, ITrainer} from "../backend/DataModel";*/

export default class AdminMainPanel extends React.Component {

  public state = {
    isNewEditMode: false,
    focusHorso: false,
    focusKido: false,
    focusTrainer: false,

    /*data: IStableAsset,
    neKido: IKido,
    neHorso: IHorso,
    neTrainer: ITrainer*/
  };


  private selectMenu: any = (<div>
    <table>
      <tbody>
      <tr>
        <td>
          <button onClick={this.handleViewHorses.bind(this)}>Horsesy</button>
        </td>
        <td>
          <button onClick={this.handleNewEditHorse.bind(this)}>Dodaj</button>
        </td>
      </tr>
      <tr>
        <td>
          <button>Bachory</button>
        </td>
        <td>
          <button>Dodaj</button>
        </td>
      </tr>
      <tr>
        <td>
          <button>Mądrale</button>
        </td>
        <td>
          <button>Dodaj</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>);

  constructor(props: any) {
    super(props);

  }

  public render() {
    let mainContent: any;
    let goBackButton: any = null;
    if (this.isOnMainSelect()) {
      mainContent = this.selectMenu
    } else {
      if (this.renderGoBackButton()) {
        goBackButton = <button onClick={this.handleGoBackToMainSelect.bind(this)}>Wróć</button>
      }
      if (this.state.focusHorso) {
        if (this.state.isNewEditMode) {
          mainContent = <NewEditHorso/>
        } else {
          mainContent = <ViewHorsoList/>
        }
      } else {
        mainContent = <p>Under construction</p>
      }
    }
    return (
      <div>
        <h1>Panel szefa </h1>
        {goBackButton}
        {mainContent}
      </div>
    )
  }

  private isOnMainSelect(): boolean {
    return (!this.state.isNewEditMode &&
      !this.state.focusHorso && !this.state.focusKido && !this.state.focusTrainer)
  }

  private backToMainSelect() {
    this.setState({isNewEditMode: false, focusHorso: false, focusKido: false, focusTrainer: false})
  }

  private renderGoBackButton(): boolean {
    return (this.state.isNewEditMode ||
      this.state.focusHorso || this.state.focusKido || this.state.focusTrainer)
  }

  private handleGoBackToMainSelect() {
    this.backToMainSelect()
  }

  private handleViewHorses() {
    this.setState({focusHorso: true});
  }

  private handleNewEditHorse() {
    this.setState({isNewEditMode: true, focusHorso: true});
  }


}
