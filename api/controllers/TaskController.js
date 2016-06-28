/**
 * TaskController
 *
 * @description :: Server-side logic for managing tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict"

module.exports = {
  // override blueprint here..
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
            sort: 'position desc',
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
          sort: 'position desc',
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

        return sails.models.task
          .create(req.body)
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

