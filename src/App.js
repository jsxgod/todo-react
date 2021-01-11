import React from "react";
import './App.css';
import config from './config'

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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
        showError: false,
        errorMessage: '',
        editMessage: '',
      }
      this.fetchTasks = this.fetchTasks.bind(this)
      this.handleChange = this.handleChange.bind(this)
      this.handleSubmit = this.handleSubmit.bind(this)
      this.startEdit = this.startEdit.bind(this)
      this.deleteItem = this.deleteItem.bind(this)
      this.crossOutItem = this.crossOutItem.bind(this)
      this.cancelEdit = this.cancelEdit.bind(this)
      this.shakeComponent = this.shakeComponent.bind(this)
      this.fixError = this.fixError.bind(this)
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

    const inputValue = document.getElementById('title').value
    if (inputValue === ""){
      document.getElementById('form-wrapper').style.paddingBottom = '6px';
      this.shakeComponent(document.getElementById('title'), true);
      this.setState({showError: true, errorMessage: "Please enter title"});
    }

    let url = `https://${ config.ip }:${ config.port }/api/task-create/`;

    if (this.state.editing === true){
      url = `https://${ config.ip }:${ config.port }/api/task-update/${ this.state.activeItem.id }/`
      document.getElementById('form-wrapper').style.paddingBottom = '30px';
      document.getElementById('title').style.boxShadow = 'none';
      this.setState({
        editing: false,
        editMessage: '',
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

  cancelEdit = () => {
    document.getElementById('form-wrapper').style.paddingBottom = '30px';
    document.getElementById('title').style.boxShadow = 'none';
    this.setState({
      activeItem:{
        id: null,
        title: '',
        completed: false,
      },
      editing: false, editMessage: ''
    })
  }

  startEdit(task){
    document.getElementById('form-wrapper').style.paddingBottom = '1px';
    document.getElementById('error').style.paddingTop = '5px';
    this.shakeComponent(document.getElementById('title'), false);
    this.setState({
      activeItem: task,
      editing: true,
      showError: false,
      editMessage: "Cancel edit",
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

  shakeComponent = (inputBox, isError) => {
    const msg = document.getElementById('error');
    if (isError){
      msg.style.color = 'red';
      inputBox.style.boxShadow= '0 1px 1px rgba(229, 103, 23, 0.075) inset, 0 0 8px rgba(229, 103, 23, 0.6)';
      const interval = setInterval(shake, 40);
      let px = 7;
      function shake() {
          inputBox.style.marginLeft = px + 'px';
          px = px < 0 ? ((px * -1) - 1) : ((px * -1) + 1);
          if (px === 1) clearInterval(interval);
      }
    } else {
      msg.style.color = 'black';
      inputBox.style.boxShadow= '0 1px 1px #ffdd00 inset, 0 0 8px #fae034';
    }
  }

  fixError = () => {
    if (this.state.showError){
      document.getElementById('form-wrapper').style.paddingBottom = '30px';
      document.getElementById('title').style.boxShadow = 'none';
      this.setState({showError: false, errorMessage: ''})
    }
  }

  render() {
    const tasks = this.state.todoList;
    const self = this;
    return(
        <div className="container">
        <h1 style={{textAlign: 'center'}}>{days[new Date().getDay().toLocaleString('pl-PL', { weekday: 'long' })]}</h1>
          <div id="todo-container">
            <div onSubmit={ this.handleSubmit } onClick={this.fixError} id="form-wrapper">
              <form id="form">
                <div className="flex-wrapper">
                  <div style={{flexBasis: '80%', marginRight: '10px'}}>
                    <input onChange={ this.handleChange } onFocus={this.fixError} className="form-control" id="title" type="text" name="title" placeholder="Task title... ✍" value={ this.state.activeItem.title }/>
                  </div>
                  <div style={{flexBasis: '20%'}}>
                    <input id="submit" className="btn btn-primary" type="submit" name="Add task" value="📝" />
                  </div>
                </div>
              </form>
              <div className="error-container">
                <p className="error" id="error">
                  {this.state.showError ? this.state.errorMessage : this.state.editing ? <button onClick={this.cancelEdit} className="btn btn-danger">{this.state.editMessage}</button>: ''}
                </p>
              </div>
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
          <div className="footer">
            <p style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '0px'}}>Made with ❤️ by <a href="https://github.com/jsxgod/todo-react">JS</a></p>
          </div>
        </div>
    )
  }
}

export default App;
