"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Tabs, Tab } from 'react-bootstrap'

let
  TaskSection = require('./task-section'),
  Streamer = require('./stream')

let React = require('react'),
  PageManagement = React.createClass({

    componentWillMount: function () {
      // prevent guests
      if (!this.props.route.user) {
        //console.log('to login!')
        location.href = '/#/login'
      }
    },

    render: function () {
      return (
        <div className="full-height flex flex-horizontal">
          <div className="full-height flex flex-vertical" id="tasks-list">
            <div className="tool" id="tool-top">
              Hello {this.props.route.user.nickname}!
              <Button bsSize="xs" onClick={()=>this.props.route.logout()} title="Add new task">Logout</Button>
            </div>
            <TaskSection />
          </div>
          <div className="full-height" id="stream-list">
            <Tabs defaultActiveKey={1}>
              <Tab eventKey={1} title="Reports">
                Reports
              </Tab>
              <Tab eventKey={2} title="Logs">
                <Streamer />
              </Tab>
            </Tabs>
          </div>
        </div>
      )
    }
  })

module.exports = PageManagement