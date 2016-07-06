"use strict"

let React = require('react')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl, Checkbox, ControlLabel } from 'react-bootstrap'
import {SliderPicker} from 'react-color'
import ReactSliderNativeBootstrap from 'react-bootstrap-native-slider'

let fetch = require('../helpers/fetch'),
  _ = require('lodash')

/**
 * todo: edit comment..
 * @type {*|Function}
 */
let CommentEditor = React.createClass({
  defaultState: function () {
    return {
      isProgress: false,
      progress: 0,
      timeTaken: 0, // hour
      comment: '',
      loading: false
    }
  },

  getInitialState: function () {
    return this.defaultState()
  },

  onShow: function () {
    this.setState(this.defaultState)
  },

  close: function () {
    this.props.hide()
  },

  save: function (e) {
    e.preventDefault()

    this.setState({loading: true}, () => {
      fetch('post', '/comment', _.extend(
        {
          taskId: this.props.task.id
        }, _.omit(this.state, 'loading')))

        .then(resp => {
          this.setState({loading: false})

          if (resp.status == 200) {
            this.close()
          }
          else {
            alert(resp.data)
          }
        })
    })
  },

  render: function () {
    return (
      <Modal show={this.props.visible} onHide={this.close} onShow={this.onShow}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Comment Editor @{this.props.task.title}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form horizontal={true} onSubmit={this.save}>
            <FormGroup>
              <Col sm={2}>Comment</Col>
              <Col sm={10}>
                <FormControl
                  componentClass="textarea" placeholder="Comment here.."
                  value={this.state.comment}
                  onChange={(e)=>this.setState({comment: e.target.value})}
                  />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={6} smOffset={2}>
                <Checkbox checked={this.state.isProgress} onChange={e => this.setState({isProgress:e.target.checked})}>
                  Is Progress
                </Checkbox>
              </Col>
            </FormGroup>


            <FormGroup>
              <Col sm={2}>Time in Hour</Col>
              <Col sm={10}>
                <Row>
                  <Col sm={11}>
                    <ReactSliderNativeBootstrap
                      value={this.state.timeTaken}
                      handleChange={e => this.setState({timeTaken:e.target.value})}
                      step={1}
                      max={8}
                      min={1}/>
                  </Col>
                  <Col sm={1}>
                    {this.state.timeTaken}
                  </Col>
                </Row>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={2}>Progress %</Col>
              <Col sm={10}>
                <Row>
                  <Col sm={11}>
                    <ReactSliderNativeBootstrap
                      value={this.state.progress}
                      handleChange={e => this.setState({progress:e.target.value})}
                      step={1}
                      max={100}
                      min={0}/>
                  </Col>
                  <Col sm={1}>
                    {this.state.progress}
                  </Col>
                </Row>
              </Col>
            </FormGroup>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.save} bsStyle="primary" tabStop={3} disabled={this.state.loading}>Save</Button>
          <Button onClick={this.close} tabStop={4}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
  }
})

module.exports = CommentEditor