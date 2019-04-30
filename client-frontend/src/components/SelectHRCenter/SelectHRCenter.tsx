import * as React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';

class SelectHRCenter extends React.Component {

  state = {
    horseRidingCenters: [],
  }

  /*async componentDidMount() {
    let asset = await window.hmClient.sendAndWait('get_HRCs', {});
    if (asset.success) {
      this.setState({horseRidingCenters:asset.data})
    } else {
      //som ting wong
    }
  }*/

  render() {
    return (
      <div className="Welcome">
        <Container>
          <Row/>
        </Container>
      </div>
    );
  }
}

export default SelectHRCenter;