"use strict"

let React = require('react'),
  ReactDom = require('react-dom')


let Component = React.createClass({
  getInitialState: function() {
    return {
      users: []
    }
  },

  componentDidMount: function() {
    // subscribe to socket user events..
    io.socket.get('/user', (users) => {
      this.setState({
        users: users
      })
    })

    io.socket.on('user', (payload) => {
      let users = this.state.users

      if(payload.verb === 'created'){
        users.push(payload.data)
        this.setState({users})
      }
      else if(payload.verb === 'updated') {
        // search for the user..
        users.forEach((u, k) => {
          if(u.id == payload.previous.id){
            users[k] = payload.data
            this.setState({users})
            return false
          }
        })
      }
      else if(payload.verb === 'destroyed') {
        users = users.filter(u => u.id != payload.id)
        this.setState({users})
      }

      console.log(payload)
    })
  },

  render: function() {
    let users = this.state.users.map(user => <li key={user.id}>({user.id}) {JSON.stringify(user, null, 2)}</li>)
    return (
      <pre>
        <h1>User Lists</h1>
        <ul>
          {users}
        </ul>
      </pre>
    )
  }

})


ReactDom.render(<Component/>, document.getElementById('my-app'))