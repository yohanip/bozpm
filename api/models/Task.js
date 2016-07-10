/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";


module.exports = {
  attributes: {},

  updateParentTaskProgress: function (parentId) {
    return sails.models.task
      .findOne({
        id: parentId
      })
      .then((task) => {
        if (task) {
          // get the children..
          return sails.models.task
            .find({
              where: {parent: task.id}
            })
            .then(tasks => {
              return [task, tasks]
            })
        }
        else {
          // invalid parent specified..
          throw 10002
        }
      })
      .spread((task, tasks) => {
        let total = 0

        tasks.forEach(t => {
          let progress = parseInt(t.progress)
          if (isFinite(progress))
            total += progress
        })

        let progress = Math.ceil(total / tasks.length)

        // update that task progress
        return [task, progress]
      })
      .spread((task, progress) => {
        return sails.models.task
          // update the progress
          .update(task.id, {progress})
          .then(updated => {
            // console.log(updated)
            // publish it
            sails.models.task.publishUpdate(updated[0].id, {progress: updated[0].progress})

            // if having parent, update that parent progress..
            if (task.parent) {
              return sails.models.task.updateParentTaskProgress(task.parent)
            }
          })
      })
      .catch((e) => {
        if (e !== 10002) sails.log.error(e)
        return false
      })

  }
}

