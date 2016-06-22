"use strict"

// campur sari dweehhh..
import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

let React = require('react'),
  ReactDom = require('react-dom'),
  fetch = require('./helpers/fetch'),
  Promise = require('bluebird'),
  _ = require('lodash')

// one task
let Task = React.createClass({

  deleteTask: function (e) {
    fetch('delete', '/task/' + this.props.task.id)
    // io.socket.delete('/task/' + this.props.task.id)
  },

  render: function () {
    let task = this.props.task

    return (
      <p>
        {task.title}
        <Button bsSize="xs" bsStyle="info"
                onClick={()=>this.props.showTaskEditor(this.props.parent || null, task)}><Glyphicon glyph="pencil"
                                                                                                    title="edit sub task"/></Button>
        <Button bsSize="xs" bsStyle="warning" onClick={()=>this.props.showTaskEditor(task, null)}><Glyphicon
          glyph="th-list" title="add sub task"/></Button>

        <Button bsSize="xs" bsStyle="danger"
                onClick={this.deleteTask}><Glyphicon glyph="remove" title="delete"/>
        </Button>
      </p>
    )
  }
})

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
      fetch('put', '/task/' + this.props.task.id, this.state)
      // io.socket.post('/task/' + this.props.task.id, this.state)
    } else {
      // creating something..
      let payload = this.state
      if (this.props.parent && this.props.parent.id) {
        payload.parent = this.props.parent.id
      }
      fetch('post', '/task', payload)
      // io.socket.post('/task', payload)
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

/**
 * tasks list
 * render semua task dan anak2nya..
 * untuk menambahkan task, ada di bawah..
 * untuk mengedit task, ada di samping masing2 task..
 */
let TaskRenderer = React.createClass({
  render: function () {
    let childrens = this.props.tasks.map(task => {
      if (task.children) {
        // console.log('have children!', task.children)
        // render sub tasks..
        return (
          <li key={task.id}>
            <Task task={task} showTaskEditor={this.props.showTaskEditor}/>
            <TaskRenderer
              tasks={task.children}
              parent={task}
              showTaskEditor={this.props.showTaskEditor}
              />
          </li>
        )
      }
      else {
        // simple task without children
        return (
          <li key={task.id}>
            <Task task={task} showTaskEditor={this.props.showTaskEditor}/>
          </li>
        )
      }
    })

    return (
      <div>
        <ul>
          {childrens}
        </ul>
        <Button bsSize="xs" onClick={()=>this.props.showTaskEditor(this.props.parent || null, null)}>
          <Glyphicon glyph="plus"/>
        </Button>
      </div>
    )
  }
})

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

  recursiveFindChildren: function (target) {
    // subscribe to socket task events..
    return new Promise(resolve => {
      io.socket
        .get('/task', {
          where: {
            parent: target.id
          }
        }, (tasks) => {
          // add those children..
          if (tasks.length > 0) {
            target.children = tasks

            Promise.each(target.children, (task, k) => {
              // console.log(task)
              return this.recursiveFindChildren(target.children[k])
            }).then(() => resolve(true))
          }
          else {
            resolve(true)
          }
        })
    })
  },

  componentDidMount: function () {
    // subscribe to socket task events..
    // step 1. register.. by fetching those data
    io.socket.get('/task', {
      where: {
        parent: null
      }
    }, (tasks) => {
      // find children tasks..
      Promise.each(tasks, (task, k) => {
        return this.recursiveFindChildren(tasks[k])
      }).then(results => {
        // after those task tree found...
        this.setState({tasks})
      })
    })

    // step 2. on tasks events..
    io.socket.on('task', (payload) => {
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
        // search for the task..
        tasks.some((u, k) => {
          let result = this.deleteId(tasks[k], payload.id)

          console.log(result)

          if (result == 1 || result == 2) {
            if (result == 1) {
              delete tasks[k]
            }

            this.setState(tasks)
            return true
          }
        })
      }

      // show models events.. <tracking..>
      console.log(payload)
    })

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
        <h1>Task Lists</h1>

        <p>ctrl+ins</p>

        <TaskRenderer
          tasks={this.state.tasks}
          showTaskEditor={this.showTaskEditor}
          />

        <TaskEditor
          parent={this.state.currentTaskParent}
          task={this.state.currentTask}
          visible={this.state.showTaskEditor}
          hide={()=>this.setState({showTaskEditor: false})}
          />

      </div>
    )
  }

})


ReactDom.render(<MainApp/>, document.getElementById('my-app'))