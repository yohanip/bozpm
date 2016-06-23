"use strict"

let fetch = require ('./helpers/fetch')

let StreamLogic = {
  get: function(socket, page) {

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
        // console.log(logs, r)
        resolve(logs)
      })
    })
  },

  add: function(author, content) {
    // console.log('adding logs')
    return fetch('post', '/log', {author, content})
  }
}

module.exports = StreamLogic