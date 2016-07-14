/**
 * TaskController
 *
 * @description :: Server-side logic for managing tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict"

let Promise = require('bluebird')

function findChildren(parent, req, res) {
  return sails.models.task
    .find({
      where: {
        parent: parent.id
      },
      sort: 'position asc'
    })
    .then(tasks => {
      if (tasks.length > 0) {
        parent.childrenNodes = tasks

        if (req.isSocket) {
          sails.models.task.subscribe(req, tasks)
        }
      }

      return Promise.each(tasks, task => {
        return findChildren(task, req, res)
      })
    })
}

module.exports = {
  // override blueprint here..
  find: function (req, res, next) {
    // find all includes it children..
    return sails.models.task
      .find({
        where: {
          parent: ['', null]
        },
        sort: 'position ASC'
      })
      .then(tasks => {
        // automatically subscribing to create events..
        sails.models.task.watch(req)

        return Promise.each(tasks, task => {
          if (req.isSocket) {
            sails.models.task.subscribe(req, tasks)
          }

          return findChildren(task, req, res)
        }).then(() => tasks)
      })
      .then(tasks => res.send(tasks))
      .catch(e => res.negotiate(e))
  },

  update: function (req, res, next) {
    let pk = req.param('id')
    return sails.models.task.findOne({id: pk})
      .then(item => {
        if (!item) return res.notFound()

        // update the progress of previous task parent..
        let lastParentId = item.parent

        let lastData = _.cloneDeep(item)

        if (req.body.position) {
          req.body.position = parseInt(req.body.position)
        }
        else {
          req.body.position = 10000
        }

        let newParentScope = req.body.parent || ['', null]
        // console.log('parent: ', newParentScope)

        // updating position which are larger than mine..
        return sails.models.task
          .find({
            where: {
              position: {'>=': req.body.position},
              parent: newParentScope
            },
            sort: 'position ASC'
          })
          .then(tasks => {
            let wasIdx = req.body.position + 1
            return Promise.each(tasks, task => {
              let oldPosition = task.position
              // console.log()
              task.position = wasIdx++
              return sails.models.task
                .update(task.id, {position: task.position})
                .then(() => {
                  // console.log(task.title, task.position)
                  sails.models.task.publishUpdate(task.id, {position: task.position}, {position: oldPosition})
                })
            })
          })
          .then(() => {
            return sails.models.task.update(pk, req.body).then(records => {
              if (lastParentId)
                sails.models.task.updateParentTaskProgress(lastParentId)

              return [
                lastData, records[0]
              ]
            })
          })
      })
      .spread((oldData, newData) => {
        // re-find the last data..
        return sails.models.task.findOne(newData.id)
          .then(updatedData => {
            sails.models.task.publishUpdate(pk, req.body, null, {
              previous: oldData
            })

            // updating progress for the new parent..
            sails.models.task.updateParentTaskProgress(updatedData.parent)

            res.ok(updatedData)
          })
      })
      .catch(err => res.negotiate(err))
  },

  create: function (req, res, next) {
    let p

    if (req.body.parent) {
      // check the validity of that parent..
      p = sails.models.task
        .findOne({
          where: {
            id: req.body.parent
          }
        })
        .then(task => {
          if (!task) throw 'Invalid Parent!'
        })
        .then(() => {
          // count the children..
          return sails.models.task.findOne({
            where: {
              parent: req.body.parent
            },
            sort: 'position DESC',
          })
        })
        .then(task => {
          if (!task) return 0
          return task.position
        })
    }
    // no parent
    else {
      p = sails.models.task
        .findOne({
          where: {
            or: [{parent: null}, {parent: ''}]
          },
          sort: 'position DESC',
        })
        .then(task => {
          if (!task) return 0
          return task.position
        })
    }

    p.
      then(max => {
        req.body.position = max + 1
        req.body.author = _.pick(req.token, 'id,email,nickname'.split(','))

        let newTaskData = req.body

        if(newTaskData.color && newTaskData.color.hex){
          newTaskData.color = newTaskData.color.hex
        }

        return sails.models.task
          .create(newTaskData)
          .then(newTask => {
            sails.models.task.publishCreate(newTask)
            res.send(newTask)
            next()

            // update parent progress..
            if (newTask.parent) {
              return sails.models.task.updateParentTaskProgress(newTask.parent)
            }
          })
      })

      .catch(err => res.negotiate(err))
  },

  destroy: function (req, res, next) {
    return sails.models.task.findOne(req.params.id)
      .then(task => {
        if (!task) throw {status: 400, err: 'No task found!'}

        // check for children..
        return sails.models.task
          .find({
            where: {
              parent: task.id
            }
          })
          .then((tasks) => [task, tasks])
      })
      .spread((task, tasks) => {
        if (tasks.length > 0) throw {status: 400, err: 'Please delete the children first..'}

        return sails.models.task.destroy(task.id)
          .then((deleteds) => {
            // publish to socket..
            sails.models.task.publishDestroy(deleteds[0].id)

            // everything is in order..
            res.send(deleteds[0])
            next()

            // update parent progress..
            if (task.parent) {
              return sails.models.task.updateParentTaskProgress(task.parent)
            }
          })
      })
      .catch(e => {
        res.negotiate(e)

      })
  }
}

