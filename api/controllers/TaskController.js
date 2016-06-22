/**
 * TaskController
 *
 * @description :: Server-side logic for managing tasks
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

"use strict"

let bluebird = require('bluebird'),
  _ = require ('lodash')

function recursively(arr, parent) {
  return Task.find({where: {parent: parent}, order: 'position ASC'})
    .then((tasks) => {
      tasks.forEach(task => arr.push(task))
      return arr
    })
}

module.exports = {
  getAll: function (req, res) {
    let tasks = []
    recursively(tasks, null).then(tasks => {
      res.send(tasks)

      // if this is a socket request.. let's subscribe it..
      if(req.isSocket === true) {
        let ids = _.pluck(tasks, 'id')
        console.log(ids)
        Task.subscribe(req, ids)
      }
    })
  }
};

