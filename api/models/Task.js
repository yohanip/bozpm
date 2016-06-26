/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";


module.exports = {
  attributes: {},

  // giving the positions before creating..
  beforeCreate: function (values, next) {
    let p

    if (values.parent) {
      //find that parent..
      p = sails.models.task.find({
        where: {
          parent: values.parent
        }
      }).then(rows => {
        if (rows.length < 1) throw 'Invalid Parent'
      })
    }
    else {
      // no parent
      p = sails.models.task.count({
        where: {
          or: [
            {parent: ''},
            {parent: null}
          ]
        }
      })
    }

    p
      .then((count) => {
        console.log("count: ", count)
        values.position = count + 1
        next()
      })
      .catch(err => {
        // returning next with parameter means there is an error
        next(err)
      })
  },
}

