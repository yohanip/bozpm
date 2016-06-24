"use strict"

let fetch = require ('./helpers/fetch'),
  _ = require ('lodash')

let StreamLogic = {
  get: function(socket, page) {

    //JWT
    socket.headers = {
      Authorization: 'Bearer ' + global.user.token
    }

    if(typeof page == 'undefined' || !page || page < 0) page = 1

    page = parseInt(page)

    if(!isFinite(page)) page = 1

    let limit = 5,
      skip = (page - 1) * limit

    return new Promise((resolve, reject) => {
      let params = [];

      params.push('limit=' + limit)
      params.push('skip=' + skip)
      params.push('sort=' + encodeURIComponent('createdAt desc'))

      params = params.join('&')

      // console.log(params)

      socket.get('/log?' + params, (logs, r) => {
        if(r.statusCode != 200) return reject(r.body.error)
        // console.log(logs, r)
        resolve(logs)
      })
    })
  },

  add: function(entity, content) {
    // console.log('adding logs')
    let author = _.extend({}, entity)
    delete author.token
    return fetch('post', '/log', {author, content})
  }
}

module.exports = StreamLogic