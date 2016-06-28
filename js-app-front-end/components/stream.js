"use strict"

let React = require('react'),
  StreamLogic = require('../stream-logic'),
  _ = require('lodash'),
  ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
  Gravatar = require ('react-gravatar')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'


let ReportItemDisplay = React.createClass({
  render: function() {
    let item = this.props.item

    return (
      <div className="stream-item">
        <p className="meta">
              <span className="author">
                <Gravatar email={item.author.email} size={20} rating="pg" https default="monsterid" className="CustomAvatar-image" />
                {item.author.nickname}
              </span>
          <span className="datetime"><TimeDisplay datetime={item.createdAt} className=""/></span>

          <span className="clearfix"/>
        </p>

        <p className="content">
          Task Title: <strong>{item.taskTitle?item.taskTitle:'#NA#'}</strong><br/>
          {item.comment}<br/>
          Progress: <strong>{item.progress} %</strong>, Time: <strong>{item.timeTaken}h</strong>
        </p>
      </div>
    )
  }
})

let LogItemDisplay = React.createClass({

  render: function() {
    let item = this.props.item

    return (
      <div className="stream-item">
        <p className="meta">
              <span className="author">
                <Gravatar email={item.author.email} size={20} rating="pg" https default="monsterid" className="CustomAvatar-image" />
                {item.author.nickname}
              </span>
          <span className="datetime"><TimeDisplay datetime={item.createdAt} className=""/></span>

          <span className="clearfix"/>
        </p>

        <pre className="content">
          {item.content}
        </pre>
      </div>
    )
  }

})

let
  TimeDisplay = require('./time-display'),
  Stream = React.createClass({
    getInitialState: function () {
      return {
        logs: [],
        loading: false
      }
    },

    componentDidUpdate: function() {
      $(this.refs.logStream).getNiceScroll().resize()
    },

    componentDidMount: function () {
      // prepare nice scroll
      $(this.refs.logStream).niceScroll()

      // load the logs
      StreamLogic
        .get(io.socket, this.props.url, 1)
        .then((logs) => {
          // console.log(logs)
          this.setState({logs})
        })

      // subscribe to created events..
      io.socket.on(this.props.watch, (payload) => {
        // save current logs state..
        let logs = this.state.logs

        if (payload.verb === 'created') {
          let add = true

          if(this.props.renderType == 'report'){
            // we dont add those without isProgress
            if(String(payload.data.isProgress).toLowerCase() != 'true'){
              add = false
            }
          }

          if(add){
            logs.unshift(payload.data)
            this.setState({logs})
          }

        }
        else if (payload.verb === 'updated') {
        }
        else if (payload.verb === 'destroyed') {
        }

        // show models events.. <tracking..>
        // console.log('log payload:', payload)
      })
    },

    loadMore: function () {
      this.setState({
        loading: true
      }, () => {
        let page = this.page || 1

        ++page

        StreamLogic
          .get(io.socket, this.props.url, page)
          .then((logs) => {
            // console.log(logs, logs.length)

            if (logs.length > 0) {
              this.page = page
              logs = _.concat(this.state.logs, logs)
              this.setState({logs})
            }

            this.setState({loading: false})
          })
          .catch(() => this.setState({loading: false}))
      })

    },

    render: function () {
      let items = this.state.logs.map(item => {
        if(this.props.renderType) {
          return (
            <ReportItemDisplay key={item.id} item={item} />
          )
        }
        else {
          return (
            <LogItemDisplay key={item.id} item={item} />
          )
        }
      })


      return (
        <div className="the-streams" ref="logStream">
          <ReactCSSTransitionGroup transitionName="example" transitionEnterTimeout={500} transitionLeaveTimeout={300}>
            {items}
          </ReactCSSTransitionGroup>

          <div className="more">
            <Button onClick={this.loadMore} disabled={this.state.loading}>More</Button>
          </div>
        </div>
      )
    }
  })

module.exports = Stream