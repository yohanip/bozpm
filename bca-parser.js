"use strict"

let request = require('request'),
  FileCookieStore = require('tough-cookie-filestore'),
  j = request.jar(new FileCookieStore('./cookies.json')),
  _ = require('lodash'),
  fs = require ('fs')

request = request.defaults({jar: j})

let requestCount = 0,
  lastUrl = ''

let myOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; U; Android 2.3.7; en-us; Nexus One Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    //'Upgrade-Insecure-Requests': 1,
    //'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //'Accept-Encoding': 'gzip, deflate, sdch, br',
    //'Accept-Language': 'en-US,en;q=0.8,af;q=0.6,id;q=0.4,ms;q=0.2',
    //'Connection': 'keep-alive',
    //'Cache-Control': 'max-age=0'
  }
}

let myIp = '',
  username = 'YUNUSIND1125',
  password = '753159'

let LETS_DEBUG = true

function promised(method, url, options) {

  if (lastUrl)
    myOptions.headers.Referer = lastUrl

  lastUrl = url

  return new Promise((resolve, reject) => {
    request[method](url, options, (e, r, b) => {
      // saving request
      if (LETS_DEBUG) {
        let fs = require('fs')
        let fn = `bca-request-${++requestCount}`
        fs.writeFile(`${fn}.txt`, JSON.stringify(r, null, 2), () => {
          console.log(`${fn} was saved!`)
        })
      }

      // return result..
      if (e) return reject(e)
      resolve(b)
    })
  })
}

// 1. retrieve the ip
return promised('get', 'http://myjsonip.appspot.com', {json: true})
  .then((res) => {
    return myIp = res.ip
  })
  // 2. open login page
  .then(() => {
    return promised('get', 'https://m.klikbca.com/login.jsp', myOptions)
  })
  // 3. post login
  .then(() => {
    // myOptions.headers.Origin = 'https://m.klikbca.com'
    myOptions.form = {
      'value(user_id)': username,
      'value(pswd)': password,
      'value(Submit)': 'LOGIN',
      'value(actions)': 'login',
      'value(user_ip)': myIp,
      'user_ip': myIp,
      'value(mobile)': 'true',
      'mobile': 'true',
    }

    return promised('post', 'https://m.klikbca.com/authentication.do', myOptions)
  })
  // 4. open menu
  .then(() => {
    delete myOptions.form
    return promised('post', 'https://m.klikbca.com/accountstmt.do?value(actions)=menu', myOptions)
  })
  // 5. balance inquiry
  .then(() => {
    return promised('post', 'https://m.klikbca.com/balanceinquiry.do', myOptions)
  })
  // parse the balance..
  .then(balancePage => {
    let fs = require('fs')
    let fn = `bca-balance`
    fs.writeFile(`${fn}.html`, balancePage, () => {
      console.log(`${fn} was saved!`)
    })
  })
  // 6. re-open menu
  .then(() => {
    return promised('post', 'https://m.klikbca.com/accountstmt.do?value(actions)=menu', myOptions)
  })
  // 7. transactions inquiry
  .then(() => {
    return promised('post', 'https://m.klikbca.com/accountstmt.do?value(actions)=acct_stmt', myOptions)
  })
  // 8. posting inquiry
  .then(() => {
    let moment = require('moment'),
      endDate = moment().utcOffset(7),
      startDate = endDate.subtract(3, 'days'),
      beginDate = {
        d: startDate.format('DD'),
        m: startDate.format('MM'),
        y: startDate.format('YYYY')
      },
      finDate = {
        d: endDate.format('DD'),
        m: endDate.format('MM'),
        y: endDate.format('YYYY')
      }

    myOptions.form = {
      r1: 1,
      'value(D1)': 0,
      'value(startDt)': beginDate.d,
      'value(startMt)': beginDate.m,
      'value(startYr)': beginDate.y,
      'value(endDt)': finDate.d,
      'value(endMt)': finDate.m,
      'value(endYr)': finDate.y,
    }
    return promised('post', 'https://m.klikbca.com/accountstmt.do?value(actions)=acctstmtview', myOptions)
  })
  // parse the transactions..
  .then(transactionPage => {
    delete myOptions.form
    let fs = require('fs')
    let fn = `bca-transactions`
    fs.writeFile(`${fn}.html`, transactionPage, () => {
      console.log(`${fn} was saved!`)
    })
  })
  // Final: Logout
  .then(() => {
    // last url should be the menu?..
    // lastUrl = 'https://m.klikbca.com/accountstmt.do?value(actions)=menu'
    return promised('post', 'https://m.klikbca.com//authentication.do?value(actions)=logout', myOptions)
  })
  .catch((e) => {
    console.log('Errorrrrrrrr!', e)
  })