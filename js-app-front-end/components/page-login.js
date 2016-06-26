"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let fetch = require('../helpers/fetch')

let React = require('react'),
  PageLogin = React.createClass({
    getInitialState: function () {
      return {
        email: '',
        password: ''
      }
    },

    login: function (e) {
      e.preventDefault()

      let LoginLogic = require('../login-logic')

      return LoginLogic(this.state.email, this.state.password)
        .then((user) => {
          this.props.route.setUser(user)
            .then(() => location.href = '/')
        })
        .catch(err => alert(err))
    },

    render: function () {
      return (
        <Row>
          <Col mdOffset={4} md={4} className="full-height" style={{marginTop: '5em'}}>
            <h2>Please Login to continue</h2>

            <Form horizontal onSubmit={this.login}>
              <FormGroup controlId="formHorizontalEmail">
                <Col sm={2}>
                  Email
                </Col>
                <Col sm={10}>
                  <FormControl type="email" placeholder="Email" value={this.state.email}
                               onChange={e => this.setState({email: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup controlId="formHorizontalPassword">
                <Col sm={2}>
                  Password
                </Col>
                <Col sm={10}>
                  <FormControl type="password" placeholder="Password" value={this.state.password}
                               onChange={e => this.setState({password: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button type="submit">
                    Sign in
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          </Col>
        </Row>
      )
    }
  })

module.exports = PageLogin