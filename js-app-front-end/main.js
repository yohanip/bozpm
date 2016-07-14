"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Navbar, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { Router, Route, hashHistory, IndexRoute, Link } from 'react-router'
import React from 'react'
import ReactDom from 'react-dom'

let PagePM = require('./components/page-management')
let PageLogin = require('./components/page-login')
let PageRegister = require('./components/page-register')

let CheckLogin = React.createClass({
  getInitialState: function () {
    return {
      disconnected: false,
      isLoading: true,
    }
  },

  setLoading: function (isLoading) {
    this.setState({isLoading})
  },

  getChildContext() {
    return {
      setLoading: this.setLoading
    }
  },

  componentDidMount: function () {
    // console.log('mounted!')
    io.socket.on('connect', () => {
      this.setState({disconnected: false})
    })

    io.socket.on('disconnect', () => {
      this.setState({disconnected: true})
    })
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
          <Link to="/"><Glyphicon glyph="home" className="tool-icon" title="Home"/></Link>

          <Glyphicon
            glyph="alert" className="tool-icon infinite-scaling" title="Alert! Server is gone!"
            style={{display: this.state.disconnected ? 'inline-block':'none'}}/>

          <Glyphicon
            glyph="cog" className="tool-icon gly-spin" title="Loading.."
            style={{display: this.state.isLoading ? 'inline-block':'none'}}/>

          {!global.user ?
            <Link to="/register"><Glyphicon glyph="certificate" className="tool-icon" title="Register"/></Link> : null}
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

  render: function () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={CheckLogin} user={this.state.user}>
          <IndexRoute component={PagePM} user={this.state.user} logout={this.logout}/>
          <Route path="/login" component={PageLogin} setUser={this.setUser}/>
          <Route path="/register" component={PageRegister} setUser={this.setUser}/>
        </Route>
      </Router>
    )
  }
})

// global contexts..
CheckLogin.childContextTypes = {
  setLoading: React.PropTypes.func
};

ReactDom.render(<MainApp />, document.getElementById('my-app'))