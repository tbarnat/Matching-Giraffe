import * as React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import App from "../AdminPanel/AdminPanel";
import classes from './SignIn.module.scss';

class SignIn extends React.Component {

  state = {
    login: '',
    password: '',
  }

  public async handleSignIn() {
    await window.hmClient.login(this.state.login, this.state.password);
  }

  public handleSingUp() {
    //redirect
  }

  public handleDemo() {
    //redirect to yt
  }

  render() {
    return (
      <div className={classes.SignIn}>
        <Container>
          <br/>
          <Row>

          </Row>
          <Row>
            <Col>
              <h3 className={classes.WelcomeMsg}>Hej, dobrze Cię znowu widzieć!</h3>
            </Col>
          </Row>
          <Row>
              <Col xs={1} md={3}/>
              <Col xs={10} md={6}>
                <Card className={classes.LoginCard}>
                <Form.Group className={classes.LoginForm}>
                  <Row className={classes.LoginFormRowLabel}>
                    <Form.Label>Login</Form.Label>
                  </Row>
                  <Row>
                    <Form.Control/>
                  </Row>
                  <Row className={classes.LoginFormRowLabel}>
                    <Form.Label>Haseł</Form.Label>
                  </Row>
                  <Row>
                    <Form.Control/>
                  </Row>
                  <Row className={classes.LoginFormRowButton}>
                    <Button variant="secondary" className={classes.LoginFormButton} onClick={() => this.handleSignIn()}>
                      Zaloguj</Button>
                  </Row>
                </Form.Group>
                </Card>
              </Col>
              <Col xs={1} md={3}/>

          </Row>
          <Row className={classes.TextButtons}>
            <Col xs={1} md={4}/>
            <Col xs={30} md={2}>
              <p onClick={() => {
              }}>Zapomniałem haseła</p>
            </Col>
            <Col xs={30} md={2}>
              Zarejestruj
            </Col>
            <Col xs={1} md={4}/>
          </Row>
          <br/>
          <Row>
            <Col>
              Lub zobacz o co chodzi na przykładzie
            </Col>
          </Row>
          <Row>
            <Col>
              <Button variant="secondary" onClick={() => this.handleDemo()}>
                Obczaj filmik</Button>
            </Col>
          </Row>
          <br/>
        </Container>
      </div>
    );
  }
}

export default SignIn;