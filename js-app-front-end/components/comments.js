"use strict"

import {Button} from 'react-bootstrap'

let React = require('react')
let Gravatar = require('react-gravatar')
let TimeDisplay = require('./time-display')

let Editor = require('./comment-editor')

let Comments = React.createClass({
  getInitialState: function () {
    return {
      task: this.props.task,
      comments: [],
      showEditor: false
    }
  },

  componentDidMount: function () {
    $(this.refs.comments).niceScroll()
  },

  componentWillReceiveProps: function (nextProps) {
    // if nextProps define a task, and our task is not defined or differ..
    if (nextProps.task && (!this.state.task || (nextProps.task.id != this.state.task.id))) {
      this.setState({
        task: nextProps.task,
        comments: []
      }, () => {
        console.log(nextProps)
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
          if (resp.statusCode == 200) {
            console.log(comments)
            this.setState({comments})
          }
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

  showEditor: function(showEditor) {
    if(typeof showEditor == 'undefined') showEditor = true
    this.setState({showEditor})
  },

  hideEditor: function() {
    this.showEditor(false)
  },

  render: function () {
    // non display if there are no task assigned..
    if(!this.state.task) return null

    let comments = this.state.comments.map(item => {
      let progressReport = null

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
            {progressReport}
          </div>
        </div>
      )
    })


    return (
      <div id="comments" className="full-height flex flex-vertical">
        <div id="comments-top-section">
          <p>Task: <strong>{this.state.task.title}</strong></p>
          <Button onClick={()=>this.showEditor(true)}>Add Comment/Report</Button>
        </div>
        <div id="comments-bottom-section" ref="comments">
          {comments}
        </div>
        <Editor visible={this.state.showEditor} hide={this.hideEditor} task={this.state.task}/>
      </div>
    )
  }
})

module.exports = Comments