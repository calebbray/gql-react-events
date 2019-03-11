import React, { Component } from 'react';

import Modal from '../components/Modal/Modal';
import Backdrop from '../components/Backdrop/Backdrop';
import AuthContext from '../context/authContext';
import './Events.css';

class EventsPage extends Component {
  constructor(props) {
    super(props);
    this.titleEl = React.createRef();
    this.priceEl = React.createRef();
    this.dateEl = React.createRef();
    this.descEl = React.createRef();
  }

  state = {
    creating: false,
    events: []
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchEvents();
  }

  createEvent = () => {
    this.setState({ creating: true });
  };

  modalCancel = () => {
    this.setState({ creating: false });
  };

  modalConfirm = () => {
    this.setState({ creating: false });
    const event = {
      title: this.titleEl.current.value,
      price: Number(this.priceEl.current.value),
      date: this.dateEl.current.value,
      description: this.descEl.current.value
    };

    if (
      event.title.trim().length === 0 ||
      event.price.length === 0 ||
      event.date.trim().length === 0 ||
      event.description.trim().length === 0
    ) {
      throw new Error('All Fields Required');
    }

    let body = {
      query: `
        mutation {
          createEvent(data: {
            title: "${event.title}",
            price: ${event.price},
            date: "${event.date}",
            description: "${event.description}"
          }) {
            title
            price
            date
            description
          }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not create event');
        }

        return res.json();
      })
      .then(data => {
        this.fetchEvents();
      })
      .catch(err => console.log(err));
  };

  fetchEvents = () => {
    let body = {
      query: `
        query {
          events {
            _id
            title
            price
            date
            description
            creator {
              _id
              email
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('Could not create event');
        }

        return res.json();
      })
      .then(data => {
        const { events } = data.data;
        this.setState({ events });
      })
      .catch(err => console.log(err));
  };

  render() {
    const eventList = this.state.events.map(event => (
      <li key={event._id} className="events-list-item">
        {event.title}
      </li>
    ));
    return (
      <React.Fragment>
        {this.state.creating && (
          <React.Fragment>
            <Backdrop />
            <Modal
              title="Add Event"
              canCancel
              canConfirm
              onCancel={this.modalCancel}
              onConfirm={this.modalConfirm}
            >
              <form>
                <div className="form-control">
                  <label htmlFor="title">Title</label>
                  <input type="text" id="title" ref={this.titleEl} />
                </div>
                <div className="form-control">
                  <label htmlFor="price">Price</label>
                  <input type="number" id="price" ref={this.priceEl} />
                </div>
                <div className="form-control">
                  <label htmlFor="date">Date</label>
                  <input type="datetime-local" id="date" ref={this.dateEl} />
                </div>
                <div className="form-control">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    cols="30"
                    rows="4"
                    ref={this.descEl}
                  />
                </div>
              </form>
            </Modal>
          </React.Fragment>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Create an Event</p>
            <button className="btn" onClick={this.createEvent}>
              Create Event
            </button>
          </div>
        )}
        <ul className="events-list">{eventList}</ul>
      </React.Fragment>
    );
  }
}

export default EventsPage;
