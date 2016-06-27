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
            sails.models.task.publishCreate(newTask);
            res.send(newTask)
            next()
          })
      })

      .catch(err => res.negotiate(err))
  }
}

