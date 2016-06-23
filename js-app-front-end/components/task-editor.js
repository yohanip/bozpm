"use strict"

let React = require ('react'),
  TaskLogic = require ('../task-logic')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let TaskEditor = React.createClass({
  getInitialState: function () {
    return {
      title: '',
      description: ''
    }
  },

  onShow: function () {
    this.setState({
      title: this.props.task && this.props.task.title ? this.props.task.title : '',
      description: this.props.task && this.props.task.description ? this.props.task.description : ''
    })
  },

  close: function () {
    this.props.hide()
  },

  save: function (e) {
    e.preventDefault()

    // alert(this.state.title + this.state.description)
    if (this.props.task && this.props.task.id) {
      // editing
      TaskLogic.edit(this.props.task.id, this.state, this.props.task)
    } else {
      TaskLogic.create(this.state, this.props.parent)
    }
    this.props.hide()
  },

  render: function () {
    return (
      <Modal show={this.props.visible} onHide={this.close} onShow={this.onShow}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Task Editor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form horizontal={true} onSubmit={this.save}>
            <FormGroup>
              <Col sm={2}>Title</Col>
              <Col sm={10}>
                <input
                  className="form-control" type="text" placeholder="Title"
                  value={this.state.title}
                  onChange={(e) => this.setState({title: e.target.value})}
                  autoFocus
                  tabStop={1}
                  />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={2}>Description</Col>
              <Col sm={10}>
                <textarea
                  className="form-control" placeholder="Description"
                  value={this.state.description}
                  onChange={(e) => this.setState({description: e.target.value})}
                  tabStop={2}
                  />
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.save} bsStyle="primary" tabStop={3}>Save</Button>
          <Button onClick={this.close} tabStop={4}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
})

module.exports = TaskEditor