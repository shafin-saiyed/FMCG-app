const express = require('express');
const mongoose = require('mongoose');
const router = require('./routes');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger_output.json')
dotenv.config()
const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use('/', router);

app.use('/api-docs',swaggerUi.serve, swaggerUi.setup(swaggerDocument));

mongoose
 .connect('mongodb://localhost:27017/FMCG_DB')
 .then(() => {
  console.log('Connected to the Database successfully');
 });

app.listen(3000, () =>  console.log(`server is up http://localhost:${port}`));