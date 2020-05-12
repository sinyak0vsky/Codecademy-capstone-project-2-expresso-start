const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');
const timesheetsRouter = express.Router({mergeParams: true});


// GET /api/employees/:employeeId/timesheets
timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', {$employeeId: req.params.employeeId}, (err, rows) => {
    if (err) return next(err);
    res.status(200).send({timesheets: rows});
  });
});

// POST /api/employees/:employeeId/timesheets
timesheetsRouter.post('/', (req, res, next) => {
  const {date, hours, rate} = req.body.timesheet;
  if (!date || !hours || !rate) {
    return res.status(400).send();
  }
  const sqlQuery = 'INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)';
  const params = {
    $hours: hours,
    $rate: rate,
    $date: date,    
    $employeeId: req.params.employeeId
  };
  
  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);    
    db.get('SELECT * FROM Timesheet WHERE id = $id', {$id: this.lastID}, (err, row) => {
      if (err) return next(err);
      res.status(201).send({timesheet: row});
    });
  });
});

module.exports = timesheetsRouter;