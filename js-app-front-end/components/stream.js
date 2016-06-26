"use strict"

let React = require('react'),
  StreamLogic = require('../stream-logic'),
  _ = require('lodash'),
  ReactCSSTransitionGroup = require('react-addons-css-transition-group'),
  Gravatar = require ('react-gravatar')

import { Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl } from 'react-bootstrap'

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
      $(this.refs.logStream).niceScroll({
        cursorwidth: "10px",
        // autohidemode: 'leave',
      })

      // load the logs
      StreamLogic
        .get(io.socket, 1)
        .then((logs) => {
          // console.log(logs)
          this.setState({logs})
        })

      // subscribe to created events..
      io.socket.on('log', (payload) => {
        // save current logs state..
        let logs = this.state.logs

        if (payload.verb === 'created') {
          logs.unshift(payload.data)
          this.setState({logs})
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
          .get(io.socket, page)
          .then((logs) => {
            console.log(logs, logs.length)

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
        return (
          <div key={item.id} className="stream-item">
            <p className="meta">
              <span className="author">
                <Gravatar email={item.author.email} size={20} rating="pg" https default="monsterid" className="CustomAvatar-image" />
                {item.author.nickname}
              </span>
              <span className="datetime"><TimeDisplay datetime={item.createdAt} className=""/></span>

              <span className="clearfix"/>
            </p>

            <p className="content">
              {item.content}
            </p>
          </div>
        )
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