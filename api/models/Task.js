/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
"use strict";


module.exports = {
  attributes: {},

  beforeUpdate: function(values, next) {
    return next()

    sails.models.task.get(values.id)
      .then(task => {
        // is it modifying the progress?
      })
  }
}

