"use strict"

let request = require('request'),
  FileCookieStore = require('tough-cookie-filestore'),
  j = request.jar(new FileCookieStore('./cookies.json')),
  _ = require('lodash')

request = request.defaults({jar: j})

let requestCount = 0

function promised(method, url, options) {
  return new Promise((resolve, reject) => {
    request[method](url, options, (e, r, b) => {
      // saving request
      let fs = require('fs')
      let fn = `bca-request-${++requestCount}`
      fs.writeFile(`${fn}.txt`, JSON.stringify(r, null, 2), () => {
        console.log(`${fn} was saved!`)
      })

      // return result..
      if (e) return reject(e)
      resolve(b)
    })
  })
}

let myOptions = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; U; Android 2.3.7; en-us; Nexus One Build/GRK39F) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
    'Upgrade-Insecure-Requests': 1,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate, sdch, br',
    'Accept-Language': 'en-US,en;q=0.8,af;q=0.6,id;q=0.4,ms;q=0.2',
    'Connection': 'keep-alive',
    'Cache-Control': 'max-age=0'
  }
}

let myIp = '',
  lastUrl = ''

// 1. retrieve the ip
return promised('get', 'http://myjsonip.appspot.com', {json: true})
  .then((res) => {
    return myIp = res.ip
  })
  // 2. open login page
  .then(() => {
    lastUrl = 'https://m.klikbca.com/login.jsp'
    return promised('get', lastUrl, myOptions)
  })
  // 3. post login
  .then(() => {
    myOptions.headers.Referer = lastUrl
    myOptions.headers.Origin = 'https://m.klikbca.com'
    myOptions.form = {
      'value(user_id)': 'YUNUSIND1125',
      'value(pswd)': '753159',
      'value(Submit)': 'LOGIN',
      'value(actions)': 'login',
      'value(user_ip)': myIp,
      'user_ip': myIp,
      'value(mobile)': 'true',
      'mobile': 'true',
    }

    lastUrl = 'https://m.klikbca.com/authentication.do'
    return promised('post', lastUrl, myOptions)
  })
  // 4. open menu
  .then(() => {
    delete myOptions.form
    myOptions.headers.Referer = lastUrl
    lastUrl = 'https://m.klikbca.com/accountstmt.do?value(actions)=menu'
    return promised('get', lastUrl, myOptions)
  })
  // 5. balance inquiry
  .then(() => {
    myOptions.headers.Referer = lastUrl
    lastUrl = 'https://m.klikbca.com/balanceinquiry.do'
    return promised('get', lastUrl, myOptions)
  })
  .catch((e) => {
    console.log('Errorrrrrrrr!', e)
  })

// 0, try to logout first?
request.get('https://m.klikbca.com/authentication.do?value(actions)=logout', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36',
    Referer: 'https://m.klikbca.com/authentication.do?value(actions)=menu'
  }
}, (e, r, b) => {


  let fs = require('fs')
  fs.writeFile("bca-logout-response.html", b, function (err) {
    console.log("bca-logout-response was saved!")
  })

  // 1. get cookie session
  request.get('https://m.klikbca.com/login.jsp', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36'
      }
    },
    (e, r, b) => {

      let fs = require('fs')
      fs.writeFile("bca-request-1.txt", JSON.stringify(r, null, 2), function (err) {
        console.log("bca-request-1.txt!")
      })

      if (r.statusCode == 200) {
        // 2. try to login..
        // value(user_id)=$username,
        // value(pswd)=$password
        // value(Submit)=LOGIN
        // value(actions)=login
        // value(user_ip)=$ourPubIP
        // user_ip=$ourPubIP,
        // value(mobile)=true,
        // mobile=true

        // 2.a get our ip
        request.get('http://myjsonip.appspot.com', {json: true}, (e, r, b) => {

          if (r.statusCode == 200) {
            let ourPubIp = b.ip,
              username = 'YUNUSIND1125',
              password = '753159'

            // let's login!
            let payload = {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36',
                Referer: 'https://m.klikbca.com/login.jsp',
              },
              form: {
                'value(user_id)': username,
                'value(pswd)': password,
                'value(Submit)': 'LOGIN',
                'value(actions)': 'login',
                'value(user_ip)': ourPubIp,
                'user_ip': ourPubIp,
                'value(mobile)': 'true',
                'mobile': 'true',
              }
            }

            // 3. Try to login!
            request.post('https://m.klikbca.com/authentication.do', payload, (e, r, b) => {

              let fs = require('fs')
              fs.writeFile("bca-request-2.txt", JSON.stringify(r, null, 2), function (err) {
                console.log("bca-request-2.txt!")
              })


              let cookie_string = j.getCookieString('m.klikbca.com')
              console.log('cookie string: ', cookie_string)

              fs.writeFile("bca-login-response.html", b, function (err) {
                console.log("bca-login-response was saved!")
              })

              fs.writeFile("bca-login-response-headers.txt", JSON.stringify(r.headers, null, 2), function (err) {
                console.log("bca-login-response-headers was saved!")
              })

              if (r.statusCode == 200) {
                // console.log(b)
                //let cheerio = require('cheerio'),
                //  $ = cheerio.load(b),
                //  l1 = $('form[name=iBankForm]').length,
                //  l2 = $('a[href="authentication.do?value(actions)=logout"]').length
                //
                //if (l1 + l2 >= 2)
                {
                  // okay we are loged in!
                  // 4. check for transactions?
                  let payload = {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36',
                      Referer: 'https://m.klikbca.com/authentication.do'
                    }
                  }

                  // click on menu
                  request.get('https://m.klikbca.com/accountstmt.do?value(actions)=menu', payload, (e, r, b) => {

                    fs.writeFile("bca-request-3.txt", JSON.stringify(r, null, 2), function (err) {
                      console.log("bca-request-3.txt!")
                    })


                    fs.writeFile("bca-menu-response.html", b, function (err) {
                      console.log("bca-menu-response was saved!")
                    })

                    if (r.statusCode == 200) {

                      let payload = {
                        headers: {
                          'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36',
                          Referer: 'https://m.klikbca.com/accountstmt.do?value(actions)=menu',
                        }
                      }

                      // click on account statement
                      request.get('https://m.klikbca.com/accountstmt.do?value(actions)=acct_stmt', payload, (e, r, b) => {
                        fs.writeFile("bca-acct_stmt-response.html", b, function (err) {
                          console.log("bca-acct_stmt-response was saved!")
                        })

                        if (r.statusCode == 200) {

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

                          let payload = {
                            headers: {
                              'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.23 Mobile Safari/537.36',
                              Referer: 'https://m.klikbca.com/accountstmt.do?value(actions)=acct_stmt'
                            },
                            form: {
                              r1: 1,
                              'value(D1)': 0,
                              'value(startDt)': beginDate.d,
                              'value(startMt)': beginDate.m,
                              'value(startYr)': beginDate.y,
                              'value(endDt)': finDate.d,
                              'value(endMt)': finDate.m,
                              'value(endYr)': finDate.y,
                            }
                          }

                          // click on submit view statement..
                          request.post('https://m.klikbca.com/accountstmt.do?value(actions)=acctstmtview', payload, (e, r, b) => {
                            fs.writeFile("bca-transactions-response.html", b, function (err) {
                              console.log("bca-transactions-response was saved!");
                            });

                            if (r.statusCode == 200) {
                              console.log(b)
                            }
                            else {
                              console.log('failed retrieving transactions!')
                            }
                          })
                        }
                        else {
                          console.log('failed at step 4.b')
                        }
                      })

                    }
                    else {
                      console.log('failed at step 4.a')
                    }

                  })

                }
                //else {
                //  console.log('authentication failed!')
                //}
              }
              else {
                console.log('failed at step 3')
              }

            })

          }
          else {
            console.log('failed at step 2.a ~ get our public ip')
          }
        })

      }
      else {
        console.log('failed at step 1')
      }
    })
})