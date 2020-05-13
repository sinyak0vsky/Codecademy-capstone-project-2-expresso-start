const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');

// GET api/menus
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    if (err) return next(err);
    res.status(200).send({menus: rows});
  });
});

module.exports = menusRouter;