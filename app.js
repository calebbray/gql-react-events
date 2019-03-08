const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');
const isAuth = require('./middleware/isAuth');

const schema = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

const PORT = process.env.PORT;
const USER = process.env.MONGO_USER;
const PASS = process.env.MONGO_PASSWORD;
const DB = process.env.MONGO_DB || 'test';

app.use(
  '/graphql',
  graphqlHttp({
    schema,
    rootValue: resolvers,
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
