"use strict"

let React = require('react'),
  TaskLogic = require('../task-logic')

import { Button,
  Glyphicon,
  Modal,
  Col, Row,
  Form, FormGroup, FormControl,
  ProgressBar} from 'react-bootstrap'

// one task
let Task = React.createClass({

  getInitialState: function () {
    return {
      showChildren: true,
      showToolbar: false,
    }
  },

  showChildrenToggle: function () {
    this.setState({
      showChildren: !this.state.showChildren
    })
  },

  deleteTask: function (e) {
    TaskLogic.remove(this.props.task.id)
  },

  render: function () {
    if(!global.user) return null

    let task = this.props.task,
      childrenShowHide = null

    if (task.children) {
      childrenShowHide = (
        <Button
          bsSize="xs" bsStyle="default"
          onClick={this.showChildrenToggle}>

          <Glyphicon
            glyph={this.state.showChildren?"eye-open":"eye-close"}
            title="show hide children"/>

        </Button>
      )
    }

    let TaskRenderer = require('./task-renderer')

    // console.log('task: show children', this.state.showChildren)

    let progress = <ProgressBar now={task.progress ? parseInt(task.progress) : 0}
                                label={`${task.progress ? task.progress : 0}%`}/>

    // this is the marker for task currently assigned to me..
    let thumbs = task.assignedTo && task.assignedTo.id == global.user.id ?
      <Glyphicon glyph="thumbs-up" title="my task" style={{fontSize: '1.2em', fontWeight: 'bold', color: '#f00'}}/> : null

    return (
      <div style={{color: task.color ? task.color.hex : 'black'}}>
        <div
          onMouseEnter={()=>this.setState({showToolbar: true})}
          onMouseLeave={()=>this.setState({showToolbar: false})}
          >

          {thumbs} {task.title || '--No Title--'} {progress}

          {childrenShowHide}

          <span style={{display: this.state.showToolbar ? 'inline':'none'}}>
            <Button
              bsSize="xs" bsStyle="info"
              onClick={()=>this.props.showTaskEditor(this.props.parent || null, task)}>

              <Glyphicon glyph="pencil" title="edit sub task"/>
            </Button>

            <Button
              bsSize="xs" bsStyle="warning"
              onClick={()=>this.props.showTaskEditor(task, null)}>

              <Glyphicon
                glyph="th-list" title="add sub task"/>

            </Button>

            <Button
              bsSize="xs" bsStyle="danger"
              onClick={()=>{if(confirm('delete task?')){this.deleteTask()}}}>

              <Glyphicon glyph="remove" title="delete"/>

            </Button>

            <Button
              bsSize="xs" bsStyle="info"
              onClick={()=>this.props.showTaskComment(task)}>

              <Glyphicon glyph="comment" title="comment"/>
            </Button>
          </span>
        </div>

        <TaskRenderer
          tasks={task.children?task.children:[]}
          parent={task}
          showTaskEditor={this.props.showTaskEditor}
          moveTask={this.props.moveTask}
          showChildren={this.state.showChildren}
          showTaskComment={this.props.showTaskComment}
          />
      </div>
    )
  }
})

module.exports = Task