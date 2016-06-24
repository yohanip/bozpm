"use strict"

// will throw exception if could not connect to server!
module.exports = function (method, url, data) {
  let opt = {
    method: method || 'get'
  }

  return new Promise((resolve, reject) => {
    jQuery.ajax({
      method,
      url,
      data,
      headers: {
        Authorization: 'Bearer ' + global.user.token
      },
      success: (dat) => {
        return resolve({
          status: 200,
          data: dat
        })
      },
      error: (xhr) => {
        if(xhr.status == 0)
          return reject('Server Offline')

        return resolve({
          status: xhr.status,
          data: xhr.statusText
        })
      }
    })
  })
}