const express = require('express')
require(dotenv).config();
const cors = require(cors);
const helmet  = require(helmet)
const mongoose = require('mongoose');
const logger = require('./utils/logger');
const ioredis = require('ioredis');
const errorHandler = require('./middlewares/errorHandlers');


const app = express();
app.use(helmet())
app.use(cors())
app.use(express.json());
app.use(errorHandler);
