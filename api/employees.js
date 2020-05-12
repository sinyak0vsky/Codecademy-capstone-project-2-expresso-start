const express = require('express');
const sqlite3 = require('sqlite3');
const timesheetsRouter = require('./timesheets');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');
const employeesRouter = express.Router();

//
// Middleware
//
employeesRouter.param('employeeId', (req, res, next, employeeId) => {  
  db.get('SELECT * FROM Employee WHERE id = $id', {$id: employeeId}, (err, row) => {        
    if (err) return next(err);      
    if (!row) {      
      return res.status(404).send();
    }    
    req.employee = row;
    req.employeeId = employeeId;
    return next();
  });
});

employeesRouter.use('/:employeeId/timesheets', timesheetsRouter);

//
// Routes
//

// GET /api/employees
employeesRouter.get('/', (req, res, next) => {
  db.all("SELECT * FROM Employee WHERE is_current_employee = 1", (err, rows) => {
    if (err) return next(err);    
    return res.status(200).send({employees: rows});
  });
});

// POST /api/employees
employeesRouter.post('/', (req, res, next) => {
  const {name, position, wage} = req.body.employee;
  const isCurrentEmployee = req.body.employee.is_current_employee ? req.body.employee.is_current_employee : 1;

  if (!name || !position || !wage) {
    return res.status(400).send();
  }
  const sqlQuery = 'INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)';
  const params = {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  };

  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM Employee WHERE id = $id', {$id: this.lastID}, (err, row) => {
      if (err) return next(err);
      res.status(201).send({employee: row});
    });
  });  
});

// GET /api/employees/:employeeId
employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).send({employee: req.employee});
});

// PUT /api/employees/:employeeId
employeesRouter.put('/:employeeId', (req, res, next) => {
  const {name, position, wage} = req.body.employee;
  if (!name || !position || !wage) {
    return res.status(400).send();
  }
  const sqlQuery = 'UPDATE Employee SET name = $name, position = $position, wage = $wage WHERE id = $id';
  const params = {
    $name: name,
    $position: position,
    $wage: wage, 
    $id: req.employeeId   
  };

  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM Employee WHERE id = $id', {$id: req.employeeId}, (err, row) => {
      if (err) return next(err);
      res.status(200).send({employee: row});
    });
  });
});

// PUT /api/employees/:employeeId
employeesRouter.delete('/:employeeId', (req, res, next) => {
  const sqlQuery = 'UPDATE Employee SET is_current_employee = 0 WHERE id = $id';
  const params = {$id: req.employeeId};

  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM Employee WHERE id = $id', params, (err, row) => {
      if (err) return next(err);
      res.status(200).send({employee: row});
    });
  });
});

module.exports = employeesRouter;