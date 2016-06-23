"use strict"

// campur sari dweehhh..
import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let React = require('react'),
  ReactDom = require('react-dom')

let Pages = {}

Pages.management = require('./components/page-management')
Pages.login = require('./components/page-login')

// main app
let MainApp = React.createClass({

  getInitialState: function () {
    // check session storage
    let user = sessionStorage.getItem('user')

    if (user) {
      user = JSON.parse(user)
      global.user = user
      return {
        currentPage: 'management',
        user: user
      }
    }

    return {
      currentPage: 'login',
      user: null
    }
  },

  changePage: function (page) {
    this.setState({currentPage: page})
  },

  logout: function () {
    this.setState({user: null})
  },

  login: function () {

  },

  setUser: function (user) {
    if (!user) user = null
    global.user = user
    sessionStorage.setItem('user', JSON.stringify(user))
    this.setState({user, currentPage: user ? 'management' : 'login'})
  },

  componentWillUpdate: function () {
    if (this.state.currentPage != 'login' && !this.state.user) {
      this.setState({currentPage: 'login'})
    }
  },

  render: function () {
    let Page = Pages[this.state.currentPage],
      pageContent = <Page
        user={this.state.user}
        changePage={this.changePage}
        login={this.login}
        logout={this.logout}
        setUser={this.setUser}
        />

    return (
      <div className="container-fluid">
        {pageContent}
      </div>
    )
  }
})

ReactDom.render(<MainApp/>, document.getElementById('my-app'))