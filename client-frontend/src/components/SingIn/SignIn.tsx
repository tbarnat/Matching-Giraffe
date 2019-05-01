import * as React from 'react';
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import Image from 'react-bootstrap/Image';
import App from "../AdminPanel/AdminPanel";
import classes from './SignIn.module.scss';
import logo from '../../images/logo.png';



class SignIn extends React.Component<any,any> {

  state = {
    login: '',
    password: '',
  }

  public async handleSignIn() {
    //future use: after login server have to return list of HRCs if >1 redirect to dayPlan with fixed modal which forces to select HRC
    let isLoggedIn = await window.hmClient.login(this.state.login, this.state.password)
    console.log(isLoggedIn)
    this.props.setLoggedIn(isLoggedIn);
    //
    //apply language user settings
  }

  public handleSingUp() {
    //modal (email, login, pswd x2, HRC name)
  }

  public changeLoginHandler(e: any){
    let login = e.target.value
    if(login){
      this.setState((prevState: any) => ({...prevState, login}))
    }
  }

  public changePasswordHandler(e: any){
    let password = e.target.value
    if(password){
      this.setState((prevState: any) => ({...prevState, password}))
    }
  }

  render() {
    return (
      <div className={classes.SignIn}>
        <Container>
          <br/>
          <Row>
            <Col>
              <Image src={logo} className={classes.Logo} rounded />
            </Col>
          </Row>
          <Row>
            <Col>
              <h3 className={classes.WelcomeMsg}>Żyrafka pomaga zobaczyć więcej</h3>
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
                    <Form.Control onChange={(e:any) => this.changeLoginHandler(e)}/>
                  </Row>
                  <Row className={classes.LoginFormRowLabel}>
                    <Form.Label>Haseł</Form.Label>
                  </Row>
                  <Row>
                    <Form.Control onChange={(e:any) => this.changePasswordHandler(e)}/>
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
              <Button variant="secondary" onClick={() => {}}>
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