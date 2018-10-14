import * as React from 'react';
import NewEditHorso from "./NewEditHorso";
/*import {IHorso, IKido, IStableAsset, ITrainer} from "../backend/DataModel";*/

export default class AdminMainPanel extends React.Component {

  public state = {
    isEditingHorso: false,
    isEditingKido: false,
    isEditingTrainer: false,
    isViewingHorsos: false,
    isViewingKidos: false,
    isViewingTrainers: false,

    /*data: IStableAsset,
    neKido: IKido,
    neHorso: IHorso,
    neTrainer: ITrainer*/
  };



  private selectMenu:any  = (<div>
    <table>
      <tr>
        <td>
          <button onClick={this.handleViewHorses}>Horsesy</button>
        </td>
        <td>
          <button onClick={this.handleNewEditHorse}>Dodaj</button>
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
    </table>
  </div>);

  constructor(props: any){
    super(props);
    this.handleViewHorses = this.handleViewHorses.bind(this)

  }

  public render() {
    let mainContent: any;
    let goBackButton: any = null;
    if (this.isOnMainSelect()) {
      mainContent = this.selectMenu
    } else {
      if(this.renderGoBackButton()){
        goBackButton = <button onClick={this.handleGoBackToMainSelect}>Wróć</button>
      }
      mainContent = <NewEditHorso/>
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
    console.log('isOnMainSelect')
    console.log(this)
    return (!(this.state.isEditingHorso && this.state.isEditingKido && this.state.isEditingTrainer &&
      this.state.isViewingHorsos && this.state.isViewingKidos && this.state.isViewingTrainers))
  }

  private backToMainSelect() {
    this.state.isEditingHorso = false;
    this.state.isEditingKido= false;
    this.state.isEditingTrainer = false;
    this.state.isViewingHorsos = false;
    this.state.isViewingKidos = false;
    this.state.isViewingTrainers = false;
  }

  private renderGoBackButton(): boolean {
    return (this.state.isEditingHorso || this.state.isEditingKido || this.state.isEditingTrainer ||
      this.state.isViewingHorsos || this.state.isViewingKidos || this.state.isViewingTrainers)
  }

  private handleGoBackToMainSelect(){
    this.backToMainSelect()
  }

  private handleViewHorses(){
    console.log(this.state);
    this.state.isViewingHorsos = true;
  }

  private handleNewEditHorse(){
    console.log(this.state);
    this.state.isEditingHorso = true;
  }

}
