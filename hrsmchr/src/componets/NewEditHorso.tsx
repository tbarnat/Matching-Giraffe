import * as React from 'react';
/*import {IHorso, IKido, IStableAsset, IInstructo} from "../backend/DataModel";*/

export default class NewEditHorso extends React.Component {

  private dbStub = ['xxx'];
  private horsoForm: {id?: string, name?: string} = {}


  public render() {
    return (
      <div>
        <p>Konio</p>
        <form onSubmit={this.handleSubmit} >
          <label style={this.tempStyle}>Imię(moje)
            <input type='text' value={this.horsoForm.id} onChange={this.onHorsoIdChange.bind(this)}/>
          </label>
          <label style={this.tempStyle}>Imię(psrt)
            <input type='text' value={this.horsoForm.name}/>
          </label>
          <input type='button' value={this.newOrEditLabel()}/>
        </form>
      </div>
    )
  }

  private handleSubmit(){

  }

  private onHorsoIdChange(event: any){
    this.horsoForm.id = event.target.value
    console.log(this.horsoForm.id)
    //this.forceUpdate() //working but Browser is complaining
  }

  private newOrEditLabel(): string{
    if(this.horsoForm.id && this.dbStub.indexOf(this.horsoForm.id) >= 0){
      return 'Edytuj'
    }
    return 'Dodaj'
  }

  private tempStyle= {
    display: 'block',
  }
}
