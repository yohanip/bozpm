"use strict"

// campur sari dweehhh..
import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let React = require('react'),
  ReactDom = require('react-dom'),
  Promise = require('bluebird'),
  _ = require('lodash'),
  TaskLogic = require('./task-logic')

// components..
let TaskEditor = require('./components/task-editor'),
  TaskRenderer = require('./components/task-renderer'),
  Streamer = require('./components/stream')

// main app
let MainApp = React.createClass({

  getInitialState: function () {
    return {
      tasks: [],
      currentTask: null,
      currentTaskParent: null
    }
  },

  updateId: function (oldTask, id, newVal, oldValue) {
    // console.log('checking', oldTask.id, id)
    if (oldTask.id && oldTask.id == id) {
      // console.log('found?')
      // update the old values..
      oldTask = _.extend(oldTask, newVal)

      return true
    }
    else if (oldTask.children) {
      let found = false

      // check on each children
      oldTask.children.some((task, k) => {
        // console.log('testing', task.id, id)
        found = this.updateId(oldTask.children[k], id, newVal, oldValue)
        return found
      })

      // console.log(found)
      return found
    }
    else {
      return false
    }
  },

  // return 1 if the caller need to delete the task himself, 2 if the task deleted internally
  deleteId: function (targetTask, id) {

    // target task is an array
    if (Array.isArray(targetTask)) {
      // search for the task..
      targetTask.some((u, k) => {
        let result = this.deleteId(targetTask[k], id)

        // console.log(result)

        if (result == 1 || result == 2) {
          if (result == 1) {
            delete targetTask[k]
          }

          return true
        }
      })
    }
    //targetTask is singular
    else {
      // console.log('checking', oldTask.id, id)
      if (targetTask.id && targetTask.id == id) {
        return 1
      }
      else if (targetTask.children) {
        let found = false

        // check on each children
        targetTask.children.some((task, k) => {
          // console.log('testing', task.id, id)
          found = this.deleteId(targetTask.children[k], id)

          if (found == 1) {
            delete targetTask.children[k]
            found = 2
            // break loop
            return true
          }
        })

        // console.log(found)
        return found
      }
      else {
        return false
      }
    }
  },

  insertNewTask: function (tasks, newTask) {
    if (!(newTask.parent)) {
      return tasks.push(newTask)
    }
    else {
      tasks.some((task, k) => {
        if (task.id == newTask.parent) {
          if (!task.children) tasks[k].children = []

          tasks[k].children.push(newTask)

          return true
        }
        else if (task.children) {
          return this.insertNewTask(task.children, newTask)
        }
      })
    }
  },

  findTask: function (tasks, taskId) {
    if (Array.isArray(tasks)) {
      let found = false

      tasks.some((task, k) => {
        if (task.id == taskId) {
          found = task
          return true
        } else if (task.children) {
          found = this.findTask(task.children, taskId)
          if (found) return true
        }
      })

      return found
    }
    // we are giving an object to this function..
    else {
      let found = false

      if (tasks.id == taskId) {
        found = tasks
        return true
      } else if (tasks.children) {
        found = this.findTask(tasks.children, taskId)
        if (found) return true
      }
    }
  },

  moveTask: function (taskId, toParent, position) {
    let task = this.findTask(this.state.tasks, taskId)

    if (typeof toParent == 'undefined') toParent = null

    if (task) {
      // delete that task from the tree..
      let tasks = this.state.tasks

      this.deleteId(tasks, task.id)

      // return console.log(task, toParent, position)

      // update the task to server..
      TaskLogic
        .edit(taskId, {parent: toParent, position}, {
          title: task.title,
          description: task.description,
          parent: task.parent
        })
        .then(() => {
          // show the representation..
          if(!toParent) {
            tasks.splice(position, 0, task)
            this.setState({tasks})
          }
          else {
            // search for the parent
            let p = this.findTask(tasks, toParent)

            if(p){
              if(!p.children) p.children = []
              p.children.push(task)
            }

            // set the tree..
            this.setState({tasks})
          }
        })
    }
  },

  componentDidMount: function () {
    // subscribe to socket task events..

    TaskLogic
      .getTasks(io.socket)
      // step 1. register.. by fetching those data
      .then(tasks => this.setState({tasks}))
      // step 2. on tasks events..
      .then(() => {
        io.socket.on('task', (payload) => {
          // save current tasks state..
          let tasks = this.state.tasks

          if (payload.verb === 'created') {
            this.insertNewTask(tasks, payload.data)
            this.setState({tasks})
          }
          else if (payload.verb === 'updated') {
            // search for the task..
            tasks.some((u, k) => {
              if (this.updateId(tasks[k], payload.id, payload.data, payload.previous)) {
                this.setState({tasks})
                // console.log('found!')
                return true
              }
            })
          }
          else if (payload.verb === 'destroyed') {
            // delete that task from the tree..
            this.deleteId(tasks, payload.id)
            this.setState(tasks)
          }

          // show models events.. <tracking..>
          console.log('task payload', payload)
        })
      })

    // calculating the height..
    // console.log($)

    // binds the shortcuts..
    Mousetrap.bind('ctrl+ins', () => {
      this.showTaskEditor(null, null)
    })
  },

  showTaskEditor: function (parent, task) {
    this.setState({
      showTaskEditor: true,
      currentTask: task,
      currentTaskParent: parent
    })
  },

  render: function () {
    // console.log(this.state.tasks)

    return (
      <div className="container-fluid">
        <Row className="full-height">
          <Col md={9} className="full-height">
            <h1>Task Lists</h1>

            <p>ctrl+ins</p>

            <TaskRenderer
              tasks={this.state.tasks}
              showTaskEditor={this.showTaskEditor}
              showChildren={true}
              moveTask={this.moveTask}
              />

            <Button bsSize="xs" onClick={()=>this.showTaskEditor(null, null)}>
              <Glyphicon glyph="plus"/>
            </Button>

            <TaskEditor
              parent={this.state.currentTaskParent}
              task={this.state.currentTask}
              visible={this.state.showTaskEditor}
              hide={()=>this.setState({showTaskEditor: false})}
              />

          </Col>

          <Col md={3} className="full-height">
            <h1>Stream</h1>

            <Streamer />
          </Col>
        </Row>
      </div>
    )
  }
})

ReactDom.render(<MainApp/>, document.getElementById('my-app'))