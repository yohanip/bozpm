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
    let p = Promise.resolve(null)

    if (typeof req.body.isProgress != 'boolean') {
      req.body.isProgress = String(req.body.isProgress).toLowerCase() === 'true'
    }

    if (req.body.isProgress) {
      //check if the posted task has children?
      p = sails.models.task
        .find({
          where: {
            parent: req.body.taskId
          }
        })
        .then(tasks => {
          if (tasks.length > 0) throw {status: 400, error: 'Could not set progress on this task (it have children)'}

          // next, let's verify the task progressed..
          return sails.models.task.findOne({id: req.body.taskId})
        })
        .then(task => {
          if (!task) throw 'Invalid task!'

          // check if this task has a specific assignee
          if (task.assignedTo && (task.assignedTo.id != req.token))
            throw {status: 400, error: 'Sorry, this task is assigned for: ' + task.assignedTo.nickname}

          // update task progress..
          return sails.models.task
            .update(req.body.taskId, {progress: req.body.progress})
            .then(updated => {
              // console.log(updated)
              sails.models.task.publishUpdate(updated[0].id, {progress: updated[0].progress})

              if (task.parent) {
                return sails.models.task.updateParentTaskProgress(task.parent)
              }
            })
            .then(() => task)
        })
    }

    return p
      .then((task) => {
        let payload = _.extend({author: req.token}, req.body)

        if (task) payload.taskTitle = task.title

        return sails.models.comment
          .create(payload)
          .then(newComment => {
            sails.models.comment.publishCreate(newComment)
            res.send(newComment)
            next()
          })
      })
      .catch(err => res.negotiate(err))

  }
}


