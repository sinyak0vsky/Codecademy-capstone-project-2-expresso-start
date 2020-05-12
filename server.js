const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const apiRouter = require('./api/api');

const app = express();
const PORT = process.env.PORT || 4000;

//
// Middleware
//
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use('/api', apiRouter);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({message: 'Server ERROR'});
});


app.listen(PORT, () => console.log(`Server started on PORT: ${PORT}`));