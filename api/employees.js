const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./db.sqlite');
const employeesRouter = express.Router();


module.exports = employeesRouter;