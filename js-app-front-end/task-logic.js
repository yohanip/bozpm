"use strict"

let fetch = require('./helpers/fetch'),
  Promise = require('bluebird'),
  StreamLogic = require('./stream-logic'),
  TaskLogic = {

    remove: function (taskId) {
      return fetch('delete', '/task/' + taskId)
        .then(payload => {

          if (payload.status == 200) {
            StreamLogic.add(global.user, JSON.stringify({msg: 'Removing Task', title: payload.data.title}, null, 2))
          }
          else {
            alert('Delete Task: ' + payload.data)
          }
        })
        .catch(err => alert('Delete Task: ' + err))
    },

    edit: function (taskId, editedFields, oldFields, log) {
      return fetch('put', '/task/' + taskId, editedFields)
        .then(payload => {
          if (log === false) return true

          if (payload.status == 200) {
            StreamLogic.add(global.user, JSON.stringify({msg: 'Edit Task', to: editedFields, was: oldFields}, null, 2))
          }
          else {
            alert('Delete Task: ' + payload.data)
          }

        })
        .catch(err => alert('Edit Task: ' + err))
    },

    create: function (newTask, parent) {
      // creating something..
      let payload = newTask
      if (parent && parent.id) {
        payload.parent = parent.id
      }

      return fetch('post', '/task', payload)
        .then(() => {

          if (payload.status == 200) {
            StreamLogic.add(global.user, JSON.stringify({msg: 'Adding Task', newTask}, null, 2))
          }
          else {
            alert('Create Task: ' + payload.data)
          }

        })
        .catch(err => alert('Create Task: ' + err))
    },

    recursiveFindTaskChildren: function (socket, targetTask) {
      return new Promise((resolve, reject) => {
        socket
          .get('/task?sort=position', {
            where: {
              parent: targetTask.id,
            }
          }, (tasks) => {
            // add those children..
            if (tasks.length > 0) {
              targetTask.children = tasks

              // for each children find those grand children..
              Promise
                .each(targetTask.children, (task, k) => {
                  // console.log(task)
                  return this.recursiveFindTaskChildren(socket, targetTask.children[k])
                })
                .then(() => resolve(true))
            }
            else {
              resolve(true)
            }
          })
      })
    },

    getTasks: function (socket) {
      // put JWT token here..
      socket.headers = {
        Authorization: 'Bearer ' + global.user.token
      }
      return new Promise((resolve, reject) => {
        socket
          .get('/task?sort=position', {
            where: {
              parent: [null, '']
            }
          }, (tasks, resp) => {
            if (resp.statusCode != 200)
              return reject(resp.body.error)

            // find children tasks..
            Promise
              .each(tasks, (task, k) => {
                return this.recursiveFindTaskChildren(socket, tasks[k])
              })
              .then(() => {
                resolve(tasks)
              })
          })
      })
    }
  }

module.exports = TaskLogic