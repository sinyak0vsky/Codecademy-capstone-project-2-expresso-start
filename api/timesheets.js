const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');
const timesheetsRouter = express.Router({mergeParams: true});

//
// Middleware
//
timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
  db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: timesheetId}, (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).send();
    }
    next();
  });
});

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

// PUT /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  const {date, hours, rate} = req.body.timesheet;
  if (!date || !hours || !rate) {
    return res.status(400).send();
  }
  const sqlQuery = 'UPDATE Timesheet SET date = $date, hours = $hours, rate = $rate WHERE id = $timesheetId';
  const params = {
    $date: date,
    $hours: hours,
    $rate: rate,
    $timesheetId: timesheetId
  };

  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM Timesheet WHERE id = $timesheetId', {$timesheetId: timesheetId}, (err, row) => {
      if (err) return next(err);
      res.status(200).send({timesheet: row});
    });
  })
});

// DELETE /api/employees/:employeeId/timesheets/:timesheetId
timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  const timesheetId = req.params.timesheetId;
  db.run('DELETE FROM Timesheet WHERE id = $timesheetId', {$timesheetId: timesheetId}, function(err) {
    if (err) return next(err);
    res.status(204).send();
  });
});


module.exports = timesheetsRouter;