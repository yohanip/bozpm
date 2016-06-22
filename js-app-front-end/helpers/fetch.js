"use strict"

module.exports = function (method, url, data) {
  let opt = {
    method: method || 'get'
  }

  if (data) {
    opt['headers'] = {
      'content-type': 'application/json'
    }
    opt['body'] = JSON.stringify(data)
  }

  return fetch(url, opt)
}