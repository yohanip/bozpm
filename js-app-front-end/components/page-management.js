"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Tabs, Tab } from 'react-bootstrap'

let
  TaskSection = require('./task-section'),
  Streamer = require('./stream')

let React = require('react'),
  PageManagement = React.createClass({

    componentWillMount: function () {
      // prevent guests
      // console.log('The user: ', this.props.route.user)
      if (!this.props.route.user) {
        //console.log('to login!')
        location.href = '/#/login'
      }
    },

    render: function () {
      // prevent rendering when there is no user defined!
      if (!this.props.route.user) return null

      let reportsUrl = `/comment?where={"isProgress":[true,"true"]}`

      return (
        <div className="full-height flex flex-horizontal">
          <div className="full-height flex flex-vertical" id="tasks-list">
            <div className="tool" id="tool-top">
              Hello {this.props.route.user.nickname}!
              <Button bsSize="xs" onClick={()=>this.props.route.logout()} title="Logout!">Logout</Button>
            </div>
            <TaskSection />
          </div>
          <div className="full-height" id="stream-list">
            <Tabs defaultActiveKey={1} id="streamer-tabs">
              <Tab eventKey={1} title="Reports">
                <Streamer url={reportsUrl} watch="comment" renderType="report"/>
              </Tab>
              <Tab eventKey={2} title="Logs">
                <Streamer url="/log" watch="log" />
              </Tab>
            </Tabs>
          </div>
        </div>
      )
    }
  })

module.exports = PageManagement