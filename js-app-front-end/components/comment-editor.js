"use strict"

let React = require('react')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'
import {SliderPicker} from 'react-color'

let CommentEditor = React.createClass({
  getInitialState: function () {
    return {
      isProgress: false,
      progress: 0,
      timeTaken: 0, // hour
      comment: ''
    }
  },

  onShow: function () {
    //let comment = this.props.comment
    //this.setState({
    //  title: task && task.title ? task.title : '',
    //  description: task && task.description ? task.description : '',
    //  color: task && task.color ? task.color : '#000',
    //  position: task && task.position ? task.position : 1000000,
    //})
  },

  close: function () {
    //this.props.hide()
  },

  save: function (e) {
    e.preventDefault()


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
            <FormGroup>
              <Col sm={2}>Color</Col>
              <Col sm={10}>
                <SliderPicker color={this.state.color} onChange={color => this.setState({color})}/>
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

module.exports = CommentEditor