import React, { Component } from 'react';
import AuthContext from '../context/authContext';

import './Auth.css';

class AuthPage extends Component {
  constructor(props) {
    super(props);
    this.emailEl = React.createRef();
    this.passwordEl = React.createRef();
  }

  state = {
    isLogin: true
  };

  static contextType = AuthContext;

  switchMode = e => {
    this.setState({ isLogin: !this.state.isLogin });
  };

  submitHandler = e => {
    const email = this.emailEl.current.value;
    const password = this.passwordEl.current.value;

    if (email.trim().length === 0 || password.trim().length === 0) {
      return;
    }

    let body = {
      query: `
        query {
          login(email: "${email}", password: "${password}") {
            userId
            token
            tokenExpiration
          }
        }
      `
    };

    if (!this.state.isLogin) {
      body = {
        query: `
          mutation {
            createUser(data: {
              email: "${email}",
              password: "${password}"
            }) {
              _id
              email
            }
          }
        `
      };
    }

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Epic Fail!');
        }

        return res.json();
      })
      .then(data => {
        const { token, tokenExpiration, userId } = data.data.login;
        if (token) {
          this.context.login(token, userId, tokenExpiration);
        }
      })
      .catch(err => {
        console.log(err);
      });
    e.preventDefault();
  };

  render() {
    return (
      <form className="auth-form" onSubmit={this.submitHandler}>
        <div className="form-control">
          <label htmlFor="email">E-Mail</label>
          <input id="email" type="email" ref={this.emailEl} />
        </div>
        <div className="form-control">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" ref={this.passwordEl} />
        </div>
        <div className="form-action">
          <button type="submit">
            {this.state.isLogin ? 'Login' : 'Register'}
          </button>
          <button type="button" onClick={this.switchMode}>
            {this.state.isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </form>
    );
  }
}

export default AuthPage;
