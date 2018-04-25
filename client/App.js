import React, { Component } from "react";
import { hot } from "react-hot-loader";
import io from "socket.io-client";
import styles from "./App.css";
import MessageForm from "./MessageForm";
import MessageList from "./MessageList";
import UsersList from "./UsersList";
import UserForm from "./UserForm";

const socket = io("/");

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { users: [], messages: [], text: "", name: "" };
  }

  componentDidMount() {
    socket.on("message", message => this.messageReceive(message));
    socket.on("update", ({ users, message }) => {
      this.chatUpdate(users);
      this.messageReceive(message);
    });
    socket.on("getMessages", ({ messages }) => this.messageReceive(messages));
  }

  messageReceive(message) {
    const messages = [...this.state.messages, ...message];
    this.setState({ messages });
  }

  chatUpdate(users) {
    this.setState({ users });
  }

  handleMessageSubmit(message) {
    const messages = [...this.state.messages, message];
    this.setState({ messages });
    socket.emit("message", message);
  }

  handleUserSubmit(name) {
    this.setState({ name });
    socket.emit("join", name);
  }

  renderLayout() {
    return (
      <div className={styles.App}>
        <div className={styles.AppHeader}>
          <div className={styles.AppTitle}>ChatApp</div>
          <div className={styles.AppRoom}>Hello {this.state.name}</div>
        </div>
        <div className={styles.AppBody}>
          <UsersList users={this.state.users} />
          <div className={styles.MessageWrapper}>
            <MessageList
              messages={this.state.messages}
              name={this.state.name}
            />
            <MessageForm
              onMessageSubmit={message => this.handleMessageSubmit(message)}
              name={this.state.name}
            />
          </div>
        </div>
      </div>
    );
  }

  renderUserForm() {
    return <UserForm onUserSubmit={name => this.handleUserSubmit(name)} />;
  }

  render() {
    return this.state.name !== "" ? this.renderLayout() : this.renderUserForm();
  }
}

export default App;
