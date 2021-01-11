import React from "react";
import './App.css';
import config from './config'

class App extends React.Component {
  constructor(props) {
    super(props);
      this.state = {
        todoList: [],
        activeItem: {
          id: null,
          title: '',
          completed: false,
        },
        editing: false,
      }
      this.fetchTasks = this.fetchTasks.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.startEdit = this.startEdit.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.crossOutItem = this.crossOutItem.bind(this)
  };

  componentWillMount() {
    this.fetchTasks()
  }

  fetchTasks(){
    fetch(`https://${ config.ip }:${ config.port }/api/task-list/`)
        .then(response => response.json())
        .then(data =>
            this.setState({
              todoList: data
            })
        )
  }

  handleChange(e){
    this.setState({
      activeItem:{
        ...this.state.activeItem,
        title: e.target.value
      }
    })
  }

  handleSubmit(e){
    e.preventDefault()

    let url = `https://${ config.ip }:${ config.port }/api/task-create/`;

    if (this.state.editing === true){
      url = `https://${ config.ip }:${ config.port }/api/task-update/${ this.state.activeItem.id }/`
      this.setState({
        editing: false,
      })
    }

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(this.state.activeItem)
    }).then((response) => {
      this.fetchTasks()
      this.setState({
        activeItem:{
          id: null,
          title: '',
          completed: false,
        }
      });
    }).catch(function(error){
      console.log(error)
    })
  }

  startEdit(task){
    this.setState({
      activeItem: task,
      editing: true,
    })
  }

  deleteItem(task){
    fetch(`https://${ config.ip }:${ config.port }/api/task-delete/${ task.id }/`, {
      method: "DELETE",
      headers: {
        "Content-type": "application/json"
      }
    }).then((response) => {
      this.fetchTasks()
    })
  }

  crossOutItem(task){
    const url = `https://${ config.ip }:${ config.port }/api/task-update/${ task.id }/`

    fetch(url, {
      method: 'POST',
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({'title': task.title, 'completed': !task.completed})
    }).then((response) => {
      this.fetchTasks()
    })
  }

  render() {
    const tasks = this.state.todoList;
    const self = this;
    return(
        <div className="container">
          <div id="task-container">
            <div onSubmit={ this.handleSubmit } id="form-wrapper">
              <form id="form">
                <div className="flex-wrapper">
                  <div style={{flexBasis: '80%', marginRight: '10px'}}>
                    <input onChange={ this.handleChange } className="form-control" id="title" type="text" name="title" placeholder="Task title..." value={ this.state.activeItem.title }/>
                  </div>
                  <div style={{flexBasis: '20%'}}>
                    <input id="submit" className="btn btn-primary" type="submit" name="Add task" value="📝" />
                  </div>
                </div>
              </form>
            </div>
            <div id="list-wrapper">
              {tasks.map(function(task, index){
                return(
                    <div key={index} className={"flex-wrapper task-wrapper"}>
                      <div onClick={() => self.crossOutItem(task)} style={{flex: 7}}>
                        {task.completed === false ?
                            (<span>{task.title}</span>) :
                            (<span style={{textDecoration: 'line-through'}}>{task.title}</span>)}
                      </div>

                      <div style={{flex: 1}}>
                        <button onClick={() => self.startEdit(task)} className="btn btn-outline-dark btn-light edit">✏️</button>
                      </div>

                      <div style={{flex: 1}}>
                        <button onClick={() => self.deleteItem(task)} className="btn btn-outline-dark btn-danger delete">🗑️</button>
                      </div>
                    </div>
                )
              })}
            </div>
          </div>
        </div>
    )
  }
}

export default App;
