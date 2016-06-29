"use strict"
let _ = require ('lodash')
let a = {
  headers: {
    cool: 1000
  }
}

let b = _.extend({}, a, {headers: {some: 3000}})

b.headers.cool = 1

console.log(a, b)