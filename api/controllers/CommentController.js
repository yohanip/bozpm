/**
 * CommentController
 *
 * @description :: Server-side logic for managing comments
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict"

module.exports = {
// override blueprint here..
  create: function (req, res, next) {
    let p = Promise.resolve(true)

    if (req.body.isProgress) {
      //check if the posted task has children?
      p = sails.models.task
        .find({
          where: {
            parent: req.body.taskId
          }
        })
        .then(tasks => {
          if (tasks.length > 0) throw 'Could not set progress on this task (it have children)'

          // find the task..
          return sails.models.task.findOne(req.body.taskId)
        })
        .then(task => {
          if (!task) throw 'Invalid task!'

          // update task progress..
          return sails.models.task
            .update(req.body.taskId, {progress: req.body.progress})
            .then(updated => {
              console.log(updated)
              sails.models.task.publishUpdate(updated[0].id, {progress: updated[0].progress})
            })
        })
    }

    return p.then(() => {
      sails.models.comment
        .create(_.extend({author: req.token}, req.body))
        .then(newComment => {
          sails.models.comment.publishCreate(newComment)
          res.send(newComment)
          next()
        })
        .catch(err => res.negotiate(err))
    })

  }
}


