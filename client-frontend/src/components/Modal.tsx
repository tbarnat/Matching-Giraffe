import * as React from 'react';
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import {ActionInMsg} from "../Client";

interface IAlertModalProps {
  show: any
  onHide: () => void
  msg: string
}

export class AlertModal extends React.Component<IAlertModalProps, any> {
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

interface IConformationModalProps {
  show: any
  onHide: () => void
  callAfterConfirm: () => Promise<void>
}

export class ConformationModal extends React.Component<IConformationModalProps, any> {
  render() {
    return (
      <Modal
        {...this.props}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Na pewno?
          </Modal.Title>
        </Modal.Header>
        <Modal.Footer style={{justifyContent: 'center'}}>
          <Button variant={'secondary'} onClick={() => {
            this.props.onHide()
            this.props.callAfterConfirm()
          }}>Tak</Button>
          <Button variant={'secondary'} onClick={this.props.onHide}>Nie</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}