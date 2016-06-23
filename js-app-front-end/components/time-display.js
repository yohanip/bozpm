"use strict"

let React = require('react'),
  moment = require('moment')

// one task
let TimeDisplay = React.createClass({
  getInitialState: function () {
    return {
      text: ''
    }
  },

  componentDidMount: function() {
    this.timer = setInterval(()=>{
      let text = '',
        a = moment(this.props.datetime),
        b = moment(),
        c = parseInt(a.diff(b)) // 86400000


      // if they are larger than 2 days ago.. shows the normal date
      if(c >= 3 * 86400000) {
        text = a.format('ddd, MMM Do YY, h:mm:ss a')
      } else {
        text = a.from(b)
      }

      this.setState({text})
    }, 1000)
  },

  componentWillUnmount: function() {
    clearInterval(this.timer)
  },

  render: function() {
    return (
      <span>{this.state.text}</span>
    )
  }
})

module.exports = TimeDisplay