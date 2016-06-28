"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let fetch = require('../helpers/fetch')

let React = require('react'),
  PageLogin = React.createClass({
    getInitialState: function () {
      return {
        email: '',
        password: '',
        confirmPassword: '',
        nickname: ''
      }
    },

    register: function (e) {
      e.preventDefault()

      // todo: move this to logic
      io.socket.post('/user', this.state, (resp, r) => {
        if (r.statusCode != 200) {
          console.log(r)
          alert(JSON.stringify(r.body.error))
        }
        else {
          // return the user along with the JWT
          resp.user.token = resp.token
          this.props.route
            .setUser(resp.user)
            .then(() => location.href = '/')
        }
      })
    },

    render: function () {
      return (
        <Row>
          <Col mdOffset={4} md={4} className="full-height" style={{marginTop: '5em'}}>
            <h2>Registration</h2>

            <Form horizontal onSubmit={this.register}>
              <FormGroup>
                <Col sm={2}>
                  Email
                </Col>
                <Col sm={10}>
                  <FormControl type="email" placeholder="Email" value={this.state.email}
                               onChange={e => this.setState({email: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col sm={2}>
                  Nickname
                </Col>
                <Col sm={10}>
                  <FormControl type="text" placeholder="Nickname" value={this.state.nickname}
                               onChange={e => this.setState({nickname: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col sm={2}>
                  Password
                </Col>
                <Col sm={10}>
                  <FormControl type="password" placeholder="Password" value={this.state.password}
                               onChange={e => this.setState({password: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col sm={2}>
                  Confirm Password
                </Col>
                <Col sm={10}>
                  <FormControl type="password" placeholder="Confirm Password" value={this.state.confirmPassword}
                               onChange={e => this.setState({confirmPassword: e.target.value})}/>
                </Col>
              </FormGroup>

              <FormGroup>
                <Col smOffset={2} sm={10}>
                  <Button type="submit">
                    Register!
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