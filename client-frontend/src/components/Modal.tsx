import * as React from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";

interface IModalProps {
  show: any
  onHide: any
  msg: string
}

export class AlertModal extends React.Component<IModalProps, any> {
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Coś nie pykło!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Server mówi, że:
          <Alert key={'errorMsg_alert'} variant={'warning'}>
            {this.props.msg}
          </Alert>
        </Modal.Body>
        <Modal.Footer style={{justifyContent: 'center'}}>
          <Button variant={'secondary'} onClick={this.props.onHide}>Server to idiota.</Button>
          <Button variant={'secondary'} onClick={this.props.onHide}>Ok, to możliwe</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}