"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Tabs, Tab } from 'react-bootstrap'

let
  TaskSection = require('./task-section'),
  Streamer = require('./stream')

let React = require('react'),
  PageManagement = React.createClass({

    componentDidMount: function() {
      $('.the-streams, #the-tasks').niceScroll()
    },

    render: function () {
      return (
        <Row className="full-height">
          <Col md={9} className="full-height">
            <TaskSection />
          </Col>
          <Col md={3} className="full-height">
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
              <Tab eventKey={1} title="Reports">
                Reports
              </Tab>
              <Tab eventKey={2} title="Logs">
                <Streamer />
              </Tab>
            </Tabs>

          </Col>
        </Row>
      )
    }
  })

module.exports = PageManagement