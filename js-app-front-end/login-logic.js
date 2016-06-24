"use strict"

module.exports = function(email, password) {
  return new Promise((resolve, reject) => {
    io.socket.post('/auth', {email: email, password: password}, (resp, r) => {
      if(r.statusCode != 200){
        reject(r.body.error)
      }
      else {
        // return the user along with the JWT
        resp.user.token = resp.token
        resolve(resp.user)
      }
    })
  })
}