const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Event = require('./models/event');

const app = express();

app.use(bodyParser.json());

const PORT = process.env.PORT;
const USER = process.env.MONGO_USER;
const PASS = process.env.MONGO_PASSWORD;
const DB = process.env.MONGO_DB;

app.use(
  '/graphql',
  graphqlHttp({
    schema: buildSchema(`
      type Event {
        _id: ID!
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type User {
        _id: ID!
        email: String!
        password: String
      }

      input UserInput {
        email: String!
        password: String!
      }

      input EventInput {
        title: String!
        description: String!
        price: Float!
        date: String!
      }

      type RootQuery {
        events: [Event!]!
        users: [User!]!
      }

      type RootMutation {
        createEvent(data: EventInput!): Event!
        createUser(data: UserInput!): User!
      }
      schema {
        query: RootQuery
        mutation: RootMutation
      }
    `),
    rootValue: {
      async events() {
        const events = await Event.find();
        try {
          return events.map(event => {
            return { ...event._doc };
          });
        } catch (err) {
          throw err;
        }
      },

      // createEvent(args) {
      //   const event = new Event({
      //     title: args.data.title,
      //     description: args.data.description,
      //     price: +args.data.price,
      //     date: new Date(args.data.date),
      //     creator: '5c7cd3ec13460c04a82df986'
      //   });

      //   let createdEvent;

      //   return event.save()
      //     .then(result => {
      //       createdEvent = { ...result._doc }
      //       return User.findById('5c7cd3ec13460c04a82df986')
      //     })
      //     .then(user => {
      //       if (!user) {
      //         throw new Error('User not found.');
      //       }

      //       user.createdEvents.push(event);
      //       return user.save()
      //     })
      //     .then(() => createdEvent)
      //     .catch(err => console.log(err))
      // },

      async createEvent(args) {
        const event = new Event({
          title: args.data.title,
          description: args.data.description,
          price: +args.data.price,
          date: new Date(args.data.date),
          creator: '5c7cd3ec13460c04a82df986'
        });

        const result = await event.save();
        const creator = await User.findById('5c7cd3ec13460c04a82df986');
        if (!creator) {
          throw new Error('A user with that ID does not exist');
        }

        creator.createdEvents.push(event);
        await creator.save();
        try {
          return { ...result._doc };
        } catch (err) {
          console.log(err);
          throw err;
        }
      },

      async createUser(args) {
        const existingUser = await User.findOne({ email: args.data.email });

        if (existingUser) {
          throw new Error('User with that email already exists');
        }

        const hashPass = await bcrypt.hash(args.data.password, 12);
        try {
          const user = new User({
            email: args.data.email,
            password: hashPass
          });
          const result = await user.save();
          try {
            return { ...result._doc, password: null };
          } catch (err) {
            console.log(err);
          }
        } catch (err) {
          console.log(err);
        }
      }
    },
    graphiql: true
  })
);

mongoose
  .connect(
    `mongodb+srv://${USER}:${PASS}@graphql-event-booking-qqfgb.mongodb.net/${DB}?retryWrites=true`,
    { useNewUrlParser: true }
  )
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server Running on Port ${PORT}`);
      console.log(`MongoDB Connected`);
    });
  })
  .catch(err => {
    console.log(err);
  });
