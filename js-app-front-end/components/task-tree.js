"use strict"

let React = require('react'),
  fetch = require('../helpers/fetch'),
  _ = require('lodash'),
  TaskEditor = require('./task-editor'),
  TaskLogic = require('../task-logic'),
  Comments = require('./comments')

import { Button,
  Glyphicon,
  Modal,
  Col, Row,
  Form, FormGroup, FormControl,
  OverlayTrigger, Tooltip,
  ProgressBar} from 'react-bootstrap'

// one task
let TaskTree = React.createClass({
  getInitialState: function () {
    return {
      tree: [],
      current: (this.props.tree ? this.props.tree[0] : null),
      taskEditor: {
        visible: false,
        task: null,
        parent: null
      },
      hideComment: true,
      commentedTask: null
    }
  },

  getChildContext: function () {
    return {
      currentData: this.state.current,
      showEditor: this.showEditor,
      setCommented: this.setCommented,
      setCurrentTask: this.setCurrentTask
    }
  },

  // a linear representation of our tree
  plainTree: function (tree, level) {
    let data = []

    function recurse(item, level) {
      item.level = level
      data.push(item)

      if (item.childrenNodes) {
        $.each(item.childrenNodes, function (i, it) {
          it.parentNode = item
          recurse(it, level + 1)
        })
      }
    }

    $.each(tree, function (i, leaf) {
      // console.log(leaf)
      recurse(leaf, level)
    })

    // console.log(data)

    return data
  },

  findData: function (data, id) {
    let idx = -1
    data.some(function (item, i) {
      if (item.id == id) {
        idx = i
        return true
      }
    })
    return idx
  },

  setCurrentTask: function (task) {
    this.setState({current: task})
  },

  selectPrev: function (e) {
    if (e && e.preventDefault) {
      e.preventDefault()
      e.stopPropagation()
    }

    let data = this.plainTree(this.state.tree, 0)
    let dataIdx = this.findData(data, this.state.current.id)
    if (dataIdx > 0) {
      this.setCurrentTask(data[--dataIdx])
    }
  },

  selectNext: function (e) {
    if (e && e.preventDefault) {
      e.preventDefault()
      e.stopPropagation()
    }

    let data = this.plainTree(this.state.tree, 0)
    let dataIdx = this.findData(data, this.state.current.id)
    if (dataIdx < data.length - 1) {
      this.setCurrentTask(data[++dataIdx])
    }
  },

  dragdropable: function () {
    let rr = this,
      hl = this.hl

    // from elements under the cursor, retrieve the real target..
    function findRealDOMDropTarget(elements) {
      let ele = []

      $.each(elements, function (i, dom) {
        let $dom = $(dom),
          hasClass = $dom.hasClass('drop'),
          id = $dom.attr('id')

        // only those with s-main and listitem-here are drop able!
        if ( hasClass && id && (id=='s-main' || id.indexOf('listitemhere-')) >= 0) {
          ele.push(dom)
        }
      })

      if (ele.length > 0) {
        return ele[0]
      }
      else {
        return null
      }
    }

    //check that a dom should not positioned at it self and it's children..
    function checkDeepDomParent(potentialChild, parent) {
      let domParent = parent, domChild = potentialChild

      if (parent instanceof jQuery) {
        domParent = parent[0]
      }

      if (potentialChild instanceof jQuery) {
        domChild = potentialChild[0]
      }

      if (domParent == domChild) return false

      let contained = jQuery.contains(domChild, domParent)

      return !contained
    }

    $('.drag').draggable({

      helper: "clone",
      opacity: 0.5,
      scroll: false,
      zIndex: 99999,

      drag: function (event, ui) {
        // fetch elements under the mouse
        let elements = document.elementsFromPoint(event.clientX, event.clientY),
          target = findRealDOMDropTarget(elements)

        if (target) {
          target = $(target)
          // remove previous highlight
          $('.hilite-bg').removeClass('hilite-bg')
          // highlight the current
          target.addClass('hilite-bg')

          // check if target have children..
          let children = target.children('.drop')

          if (children.length > 0) {
            hl.show()

            let mouseY = event.pageY,
              prependLast = true

            children.each(function (i, dom) {
              let offset = $(dom).offset()

              if (offset.top > mouseY) {
                hl.css({top: offset.top})
                prependLast = false
                return false
              }
            })

            if (prependLast) {
              let lastChildIdx = children.length - 1
              // cek siapa tahu anak terakhir merupakan 'clone' helper drag..
              if (children[lastChildIdx] == ui.helper[0])
                --lastChildIdx

              let t = children.eq(lastChildIdx).offset().top + children.eq(lastChildIdx).outerHeight() + 5
              hl.css({top: t})
            }
          }
          else {
            hl.hide()
          }
        }

      },

      stop: function (event, ui) {
        $('.hilite-bg').removeClass('hilite-bg')
        hl.hide()

        function moveToParent(childJDOM, targetJDOM, atPos) {
          if (!(childJDOM instanceof jQuery)) childJDOM = $(childJDOM)
          if (!(targetJDOM instanceof jQuery)) targetJDOM = $(targetJDOM)

          // update the positions..
          // get the target position..
          let targetId = targetJDOM.attr('id').split('-')
          let childId = childJDOM.attr('id').split('-')

          // data bank
          let tree = rr.state.tree
          let data = rr.plainTree(tree, 0)

          // find data index from our linear tree representation
          let targetIdx = rr.findData(data, targetId[1])
          let childIdx = rr.findData(data, childId[1])

          // our states data..
          let parent = targetIdx >= 0 ? data[targetIdx] : null
          let child = data[childIdx]
          let lastParent = child.parentNode

          if (!parent) {
            // we are inserting to the tree..
            // todo: move this to task logic?
            fetch('post', '/task/' + child.id, {parent: null, position: atPos})
              .catch(err => alert('Error moving task!' + err))
          }
          else {
            // todo: move this to task logic?
            fetch('post', '/task/' + child.id, {parent: parent.id, position: atPos})
              .catch(err => alert('Error moving task!' + err))
          }
        }

        // get the element under the cursor..
        let elements = document.elementsFromPoint(event.clientX, event.clientY),
          target = findRealDOMDropTarget(elements)

        if (target) {
          // console.log('target', target)
          target = $(target)

          let children = target.children('.drop')
          let that = this

          // we can't move ourself inside our self..
          //if(this == target[0]) return;
          if (!checkDeepDomParent(this, target)) return;

          if (children.length > 0) {
            // where should we insert our element?
            let mouseY = event.pageY,
              prependLast = true,
              idx = -1

            children.each(function (i, dom) {
              let offset = $(dom).offset()

              if (offset.top > mouseY) {
                idx = i
                prependLast = false
              }

              return prependLast
            })

            // console.log(idx, prependLast)

            if (idx >= 0) {
              moveToParent(this, target, idx)
            }

            if (prependLast) {
              moveToParent(this, target, children.length)
            }
          }
          else {
            // append directly
            moveToParent(this, target, 0)
          }
        }
      }
    })

    $('.drop').droppable({
      out: function (event, ui) {
        $('.hilite-bg').removeClass('hilite-bg')
      }
    })
  },

  componentDidMount: function () {

    // prepare the highlighter..
    let hl = $('<div id="the-highlighter-yohan-shows-on-inserts"></div>')

    hl.css({
      display: 'none',
      position: 'absolute',
      width: 100,
      height: 3,
      margin: 0,
      padding: 0,
      lineHeight: 3,
      backgroundColor: 'red',
      zIndex: 999,
    })

    $('#s-main').append(hl)

    this.hl = hl

    this.dragdropable()

    // retrieve the data from server..
    // todo: move this to task logic..
    io.socket.headers = {
      Authorization: 'Bearer ' + global.user.token
    }

    this.context.setLoading(true)

    io.socket.get('/task', (tree, resp) => {
      if (resp.statusCode == 200) {
        this.plainTree(tree, 0)
        this.setState({tree: tree, current: (tree.length > 0) ? tree[0] : null}, () => {
          // set loading as off..
          this.context.setLoading(false)
        })
      }
      else {
        alert('error fetching data..' + resp.statusText)
      }
    })

    io.socket.on('task', payload => {
      // console.log('task payload', payload)

      switch (payload.verb) {
        case 'created':
        {
          // console.log('createds')
          let tree = this.state.tree
          let newTask = payload.data

          if (newTask.parent) {
            let data = this.plainTree(tree, 0)
            let idx = this.findData(data, newTask.parent)

            if (idx >= 0) {
              let parent = data[idx]
              if (!parent.childrenNodes) parent.childrenNodes = []

              let position = parseInt(newTask.position)
              if (!_.isFinite(position)) position = 0

              parent.childrenNodes.splice(position, 0, newTask)
            }
          }
          else {
            // adding this to the tree
            let position = parseInt(newTask.position)
            if (!_.isFinite(position)) position = 0

            tree.splice(position, 0, newTask)
          }

          this.plainTree(tree, 0)
          this.setState({tree})
        }
          break

        case 'destroyed':
        {
          let tree = this.state.tree
          let data = this.plainTree(tree, 0)

          let currentIdx = this.findData(data, payload.id)
          if (currentIdx >= 0) {
            // this.selectPrev();

            let task = data[currentIdx]
            if (task.parentNode) {
              // delete from parent
              let idx = task.parentNode.childrenNodes.indexOf(task)
              if (idx >= 0) {
                task.parentNode.childrenNodes.splice(idx, 1)
                // console.log('deleted from parent node', task.parentNode.title)
              }
            }
            else {
              // delete from tree
              let idx = tree.indexOf(task)
              if (idx >= 0) {
                tree.splice(idx, 1)
                // console.log('deleted from tree')
              }
            }
            this.setState({tree})
          }
        }
          break

        case 'updated':
        {
          let tree = this.state.tree
          let data = this.plainTree(tree, 0)

          let currentIdx = this.findData(data, payload.id)

          if (currentIdx >= 0) {
            let currentData = data[currentIdx]

            // update the current data..
            _.each(payload.data, (v, k) => {
              currentData[k] = v
            })

            // if defined previous data..
            if (payload.previous) {
              // is it moving?
              if ((payload.previous.parent != currentData.parent) || (payload.previous.position != currentData.position)) {
                // yes we are moving..
                {
                  if (currentData.parentNode && currentData.parentNode.childrenNodes) {
                    let idx = currentData.parentNode.childrenNodes.indexOf(currentData)
                    if (idx >= 0) {
                      console.log('removing from old parent', currentData.parentNode.title)
                      currentData.parentNode.childrenNodes.splice(idx, 1)
                      currentData.parentNode = null
                    } else {
                      console.log('could not found child on parent')
                    }
                  }
                  else {
                    // removing from the tree..
                    let idx = tree.indexOf(currentData)
                    if (idx >= 0) {
                      console.log('removing from tree')
                      tree.splice(idx, 1)
                    } else {
                      console.log('could not found child on tree')
                    }
                  }
                }

                if (currentData.parent) {
                  let parentIdx = this.findData(data, currentData.parent)
                  let parent = data[parentIdx]
                  if (!parent.childrenNodes) parent.childrenNodes = []
                  parent.childrenNodes.splice(parseInt(currentData.position), 0, currentData)
                }
                else {
                  // adding to the tree
                  tree.splice(parseInt(currentData.position), 0, currentData)
                }

                this.plainTree(tree, 0)
              }
            }

            // update the tree..
            this.setState({tree})
          }

        }
          break
      }
    })

    // defining shortcuts..
    Mousetrap.bind('ctrl+up', this.selectPrev)
    Mousetrap.bind('ctrl+down', this.selectNext)
    Mousetrap.bind('ctrl+ins', (e) => {
      e.preventDefault()
      this.showEditor(null, null)
    })
    Mousetrap.bind('ctrl+shift+ins', (e) => {
      e.preventDefault()
      if (this.state.current) {
        // creating sub task on the currentTask
        this.showEditor(null, this.state.current)
      }
    })

    // niceScroll
    $(this.refs.theTree).niceScroll()
  },

  componentDidUpdate: function () {
    this.dragdropable()
    // niceScroll
    $(this.refs.theTree).getNiceScroll().resize()
  },

  hideEditor: function () {
    this.setState({taskEditor: {visible: false}})
  },

  showEditor: function (currentTask, currentParent) {
    this.setState({
      taskEditor: {
        visible: true,
        task: currentTask,
        parent: currentParent
      }
    })
  },

  setCommented: function (commentedTask) {
    this.setState({commentedTask})
  },

  render: function () {

    let a = this.state.tree.map(function (task) {
      return <DataLine key={task.id} task={task} visible={true}/>
    })

    return (
      <div className="full-height flex flex-horizontal">
        <div ref="theTree" className="full-height" id="tree-container">
          <div className="list drag drop" id="s-main">
            {a}
          </div>
          <TaskEditor
            task={this.state.taskEditor.task}
            parent={this.state.taskEditor.parent}
            visible={this.state.taskEditor.visible}
            hide={this.hideEditor}/>

          <Button
            bsSize="sm" bsStyle="default"
            onClick={()=>this.showEditor(null, null)}>
            <Glyphicon glyph="th-list" title="add task"/>
          </Button>
        </div>

        <div ref="theComments" className="full-height" id="comments-container">
          <Comments task={this.state.commentedTask}/>
        </div>
      </div>
    )
  }
})

let SimpleDiv = React.createClass({
  render: function () {
    return (
      <div {...this.props}>{this.props.children}</div>
    )
  }
})

let DataLine = React.createClass({
  getInitialState: function () {
    return {
      hideChildren: false
    }
  },

  render: function () {
    let task = this.props.task
    let children = null

    if (task.childrenNodes) {
      children = task.childrenNodes.map((childTask) => {
        return <DataLine key={childTask.id} task={childTask} visible={!this.state.hideChildren}/>
      })
    }

    // task progress
    let progress = <ProgressBar now={task.progress ? parseInt(task.progress) : 0}
                                label={`${task.progress ? task.progress : 0}%`}/>

    // this is the marker for task currently assigned to me..
    let thumbs = task.assignedTo && task.assignedTo.id == global.user.id ?
      <Glyphicon glyph="thumbs-up" title="my task"
                 style={{color: '#f00', marginRight: '0.2em'}}/> : null

    // hide unhide children
    let hideUnhideChildren = (task.childrenNodes && task.childrenNodes.length > 0) ? (
      <Button
        bsSize="xs" bsStyle="default"
        onClick={()=>this.setState({hideChildren: !this.state.hideChildren})}>
        <Glyphicon glyph={this.state.hideChildren?"eye-close":"eye-open"} title="hide children"/>
      </Button>
    ) : null

    // mark of the currently selected task
    let cn = ''
    if (this.context.currentData && this.context.currentData.id == task.id) cn = 'selected'

    // beautifull tree..
    let lineLeft = null,
      lineDash = null,
      lineEraser = null

    // left side..
    if (task.childrenNodes && task.childrenNodes.length > 0 && !this.state.hideChildren) {
      lineLeft = (
        <div className="tree-line-left" style={{left: 15 + (task.level ? task.level : 0) * 15}}/>
      )
    }

    if (task.parentNode) {
      lineDash = (
        <div className="tree-line-dash" style={{left: (task.level ? task.level : 0) * 15}}/>
      )

      if (task.id == task.parentNode.childrenNodes[task.parentNode.childrenNodes.length - 1].id) {
        // this is the last children..
        lineEraser = (
          <div className="tree-line-eraser" style={{left: (task.level ? task.level : 0) * 15}}/>
        )
      }
    }

    //let useTooltip = (task.description && task.description.length >= 3),
    //  tooltip = useTooltip ? <Tooltip>{task.description}</Tooltip> : null,
    //  MyTooltipTrigger = useTooltip ? OverlayTrigger : SimpleDiv

    return (
      <div key={task.id} id={'listitemhere-' + task.id} className="list-item li drag drop"
           style={{color: task.color?task.color:'#000', display:this.props.visible?'block':'none'}}>

        {lineLeft}
        {lineDash}
        {lineEraser}

        <div className="data-line flex flex-horizontal">
          <span className={cn + ' currently'}></span>
          <span className="title" style={{paddingLeft: (task.level ? task.level : 0) * 15}}
                onDoubleClick={e => this.context.setCurrentTask(task)}>
              {task.title} {hideUnhideChildren} {thumbs}
          </span>
          <span className="progress">{progress}</span>
          <span className="task-toolbar">
            <Button
              bsSize="xs" bsStyle="info"
              onClick={()=>this.context.showEditor(task, task.parentNode)}>
              <Glyphicon glyph="pencil" title="edit task"/>
            </Button>

            <Button
              bsSize="xs" bsStyle="warning"
              onClick={()=>this.context.showEditor(null, task)}>
              <Glyphicon glyph="th-list" title="add sub task"/>
            </Button>

            <Button
              bsSize="xs" bsStyle="danger"
              onClick={()=>{if(confirm('delete task?')){TaskLogic.remove(task.id)}}}>
              <Glyphicon glyph="remove" title="delete"/>
            </Button>

            <Button
              bsSize="xs" bsStyle="info"
              onClick={()=>this.context.setCommented(task)}>
              <Glyphicon glyph="comment" title="comment"/>
            </Button>
          </span>
        </div>

        {children}

      </div>
    )
  }
})

// context from our root
TaskTree.childContextTypes = {
  currentData: React.PropTypes.object,
  showEditor: React.PropTypes.func,
  setCommented: React.PropTypes.func,
  setCurrentTask: React.PropTypes.func
}

TaskTree.contextTypes = {
  setLoading: React.PropTypes.func
}

DataLine.contextTypes = {
  currentData: React.PropTypes.object,
  showEditor: React.PropTypes.func,
  setCommented: React.PropTypes.func,
  setCurrentTask: React.PropTypes.func
}

module.exports = TaskTree