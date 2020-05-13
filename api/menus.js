const express = require('express');
const sqlite3 = require('sqlite3');

const menusRouter = express.Router();
const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');

//
// Middleware
//
menusRouter.param('menuId', (req, res, next, menuId) => {
  db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (err, row) => {
    if (err) return next(err);
    if (!row) {
      return res.status(404).send();
    }
    next();
  })
});


// GET api/menus
menusRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (err, rows) => {
    if (err) return next(err);
    res.status(200).send({menus: rows});
  });
});

// POST api/menus

// GET api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (err, row) => {
    if (err) return next(err);
    res.status(200).send({menu: row});
  });  
});

module.exports = menusRouter;