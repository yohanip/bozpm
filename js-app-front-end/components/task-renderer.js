"use strict"

let React = require('react'),
  ReactCSSTransitionGroup = require('react-addons-css-transition-group')

import {
  Button, Glyphicon, Modal, Col, Row, Form, FormGroup, FormControl
}  from 'react-bootstrap'

/**
 * tasks list
 * render semua task dan anak2nya..
 * untuk menambahkan task, ada di bawah..
 * untuk mengedit task, ada di samping masing2 task..
 */

let TaskRenderer = React.createClass({

  componentDidMount: function () {
    let renderer = this
    // set the tree view as sortable..
    // console.log('task renderer did mount')
    jQuery('.sortable-task').sortable({
      connectWith: '.sortable-task',
      dropOnEmpty: true,
      placeholder: "ui-state-highlight",
      start: (e, ui) => {
        // find ul with no li..
        jQuery('ul.ui-sortable').each(function (idx, dom) {
          let target = jQuery(dom)
          if (target.find('li').length == 0) {
            target.addClass('ready-to-drop')
          }
        })
        // console.log('start', ui.item.attr('id'), ui.item.parent().children().index(ui.item), ui.item.parent().closest('li').attr('id'))
        Mousetrap.bind('escape', function () {
          jQuery('.sortable-task').sortable('cancel')
        })
      },
      stop: (e, ui) => {
        // console.log('stop', ui.item.attr('id'), ui.item.parent().children().index(ui.item), ui.item.parent().closest('li').attr('id'))
        let taskId = ui.item.attr('id'),
          parentId = ui.item.parent().closest('li').attr('id'),
          position = ui.item.parent().children().index(ui.item)

        jQuery('ul.ui-sortable').removeClass('ready-to-drop')
        jQuery('.sortable-task').sortable('cancel')

        renderer.props.moveTask(taskId, parentId, position)
      }
    })
  },

  render: function () {
    let Task = require('./task')

    let childrens = this.props.tasks.map(task => {
      // simple task without children
      return (
        <li key={task.id} id={task.id}>
          <Task task={task}
                showTaskEditor={this.props.showTaskEditor}
                moveTask={this.props.moveTask}
                showTaskComment={this.props.showTaskComment}/>
        </li>
      )
    })


    // console.log(this.props.showChildren)

    return (
      <div style={{display: this.props.showChildren?'block':'none'}}>
        <ul className="tree sortable-task">
          {childrens}
        </ul>
      </div>
    )
  }
})

module.exports = TaskRenderer