"use strict"

let React = require('react'),
  TaskLogic = require('../task-logic'),
  _ = require('lodash')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'
import {SliderPicker} from 'react-color'

let TaskEditor = React.createClass({
  getInitialState: function () {
    return {
      activeUsers: [global.user],
      title: '',
      description: '',
      color: '#000',
      position: 1000000,
      assignedTo: null // user object (id and nickname here..)
    }
  },

  componentDidMount: function(){
    // retrieve and subscribe for user changes..
    io.socket.headers = {
      Authorization: 'Bearer ' + global.user.token
    }
    io.socket.get('/user', (body, resp) => {
      if(resp.statusCode == 200){
        let activeUsers = this.state.activeUsers,
          newUsers = body.filter(u => u.id != global.user.id)

        newUsers.forEach(nu => activeUsers.push(nu))

        this.setState({activeUsers})
      }
    })

  },

  onShow: function () {
    let task = this.props.task
    this.setState({
      title: task && task.title ? task.title : '',
      description: task && task.description ? task.description : '',
      color: task && task.color ? task.color : '#000',
      position: task && task.position ? task.position : 1000000,
      assignedTo: task && task.assignedTo ? task.assignedTo : null,
    })
  },

  close: function () {
    this.props.hide()
  },

  save: function (e) {
    e.preventDefault()

    let payload = _.omit(this.state, 'childrenNodes,activeUsers,parentNode'.split(',')),
      taskWas = _.omit(this.props.task, 'childrenNodes,parentNode'.split(','))

    // alert(this.state.title + this.state.description)
    if (this.props.task && this.props.task.id) {
      // editing
      TaskLogic.edit(this.props.task.id, payload, taskWas)
    } else {
      TaskLogic.create(payload, this.props.parent)
    }
    this.props.hide()
  },

  render: function () {
    let chooseUsers = this.state.activeUsers.map((usr) => {
      return (
        <option key={usr.id} value={JSON.stringify({id:usr.id, nickname: usr.nickname})}>{usr.nickname}</option>
      )
    })

    let ifParented = this.props.parent ? '@' + this.props.parent.title : '@root'

    return (
      <Modal show={this.props.visible} onHide={this.close} onShow={this.onShow}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Task Editor {ifParented}</Modal.Title>
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

            <FormGroup>
              <Col sm={2}>Assign To</Col>
              <Col sm={10}>
                <FormControl
                    componentClass="select" placeholder="select"
                    value={JSON.stringify(this.state.assignedTo)}
                    onChange={e => this.setState({assignedTo: JSON.parse(e.target.value)})}>

                  <option value={JSON.stringify(null)}>Anyone</option>
                  {chooseUsers}

                </FormControl>
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