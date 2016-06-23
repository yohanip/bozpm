"use strict"

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

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
            <Streamer />
          </Col>
        </Row>
      )
    }
  })

module.exports = PageManagement