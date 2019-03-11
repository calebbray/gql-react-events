import React from 'react';
import { NavLink } from 'react-router-dom';

import AuthContext from '../../context/authContext';

import './MainNavigation.css';

const MainNavigation = props => (
  <AuthContext.Consumer>
    {context => {
      return (
        <header className="main-navigation">
          <div className="main-navigation-logo">
            <h1>
              <NavLink to="/">EZ Events</NavLink>
            </h1>
          </div>
          <div className="main-navigation-item">
            <ul>
              {!context.token && (
                <li>
                  <NavLink to="/auth">Authentication</NavLink>
                </li>
              )}
              <li>
                <NavLink to="/events">Events</NavLink>
              </li>
              {context.token && (
                <React.Fragment>
                  <li>
                    <NavLink to="/bookings">Bookings</NavLink>
                  </li>
                  <li>
                    <button onClick={context.logout}>Logout</button>
                  </li>
                </React.Fragment>
              )}
            </ul>
          </div>
        </header>
      );
    }}
  </AuthContext.Consumer>
);

export default MainNavigation;
