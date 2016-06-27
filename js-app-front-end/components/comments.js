"use strict"

import {Glyphicon} from 'react-bootstrap'

let React = require('react')
let Gravatar = require('react-gravatar')
let TimeDisplay = require('./time-display')

let Comments = React.createClass({
  getInitialState: function () {
    return {
      task: this.props.task,
      comments: []
    }
  },

  componentDidMount: function () {
    $(this.refs.comments).niceScroll()
  },

  componentWillReceiveProps: function (nextProps) {
    if (!this.state.task || (nextProps.task.id != this.state.task.id)) {
      this.setState({
        task: nextProps.task
      }, () => {

        // retrieve the comments...
        // todo: separate this to a logical file
        io.socket.headers = {
          Authorization: 'Bearer ' + global.user.token
        }
        io.socket.get(`/comment?sort=createdAt desc`, {
          where: {
            taskId: this.state.task.id
          }
        }, (comments, resp) => {
          console.log(comments)
          this.setState({comments})
        })

        // subscribe to events..
        io.socket.on('comment', payload => {
          if (payload.verb == 'created') {
            let comments = this.state.comments
            comments.unshift(payload.data)

            this.setState({
              comments
            })
          }
        })
      })
    }
  },


  componenetDidUpdate: function () {
    $(this.refs.comments).getNiceScroll().resize()
  },

  render: function () {
    let comments = this.state.comments.map(item => {
      return (
        <div className="media" key={item.id}>
          <div className="media-left">
            <Gravatar email={item.author && item.author.email?item.author.email:''} size={40} rating="pg" https
                      default="monsterid"
                      className="CustomAvatar-image"/>
          </div>
          <div className="media-body">
            <p className="media-heading">{item.author && item.author.nickname ? item.author.nickname : 'unknown'},
              <TimeDisplay datetime={item.createdAt}/></p>
            {item.comment ? item.comment : 'no-comment'}
          </div>
        </div>
      )
    })


    return (
      <div id="comments" className="full-height" ref="comments">
        {comments}
      </div>
    )
  }
})

module.exports = Comments