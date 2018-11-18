import * as React from 'react';

export default class NewEditKido extends React.Component {

  private kidoForm: {
    id?: string,
    name?: string,
    surname?: string,
    remarks?: string
    prefs?: string[][]
    excludes?: string[]
  } = {};

  public render() {
    return (
      <div>
        <p>Bahchor</p>
        <form onSubmit={this.handleSubmit}>
          <label style={this.tempStyle}>Nazwa
            <input type='text' value={this.kidoForm.id}/>
          </label>
          <label style={this.tempStyle}>Imię
            <input type='text' />
          </label>
          <input type='button' value='Dodaj'/>
        </form>
      </div>
    )
  }

  private handleSubmit() {
  }

  private tempStyle = {
    display: 'block',
  }

}
