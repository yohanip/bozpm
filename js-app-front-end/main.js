"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { Router, Route, hashHistory, IndexRoute } from 'react-router'
import React from 'react'
import ReactDom from 'react-dom'

let PagePM = require('./components/page-management')
let PageLogin = require('./components/page-login')

let CheckLogin = React.createClass({
  componentDidMount: function () {
    // console.log('mounted!')
  },

  componentWillMount: function () {
    // console.log('received update', p1, p2)
    if (!this.props.route.user && this.props.route.path != '/login') {
      //console.log('to login!')
      location.href = '/#/login'
    }
  },

  render: function () {
    return (
      <div className="full-height flex flex-horizontal">
        <div id="tool-left" className="tool">
          <Glyphicon glyph="home" className="tool-icon"/>
        </div>
        <div id="page-content">
          {this.props.children}
        </div>
      </div>
    )
  }
})

// main app
let MainApp = React.createClass({

  getInitialState: function () {
    // check session storage
    let user = sessionStorage.getItem('user')

    if (user) {
      user = JSON.parse(user)
      global.user = user
      return {
        user: user
      }
    }

    return {
      user: null
    }
  },

  logout: function () {
    this.setUser(null).then(() => location.href = '/')
  },

  setUser: function (user) {

    return new Promise(resolve => {
      if (!user) user = null
      global.user = user

      this.setState({user}, () => resolve(user))

      // console.log('current user:', user)
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user))
      }
      else {
        sessionStorage.removeItem('user')
      }
    })
  },

  componentDidMount: function () {
  },

  render: function () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={CheckLogin} user={this.state.user}>
          <IndexRoute component={PagePM} user={this.state.user} logout={this.logout}/>
          <Route path="/login" component={PageLogin} setUser={this.setUser}/>
        </Route>
      </Router>
    )
  }
})

ReactDom.render(<MainApp />, document.getElementById('my-app'))