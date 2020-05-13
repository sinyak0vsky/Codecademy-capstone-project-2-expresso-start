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
menusRouter.post('/', (req, res, next) => {
  const {title} = req.body.menu;
  if (!title) {
    return res.status(400).send();
  }  

  db.run('INSERT INTO Menu (title) VALUES ($title) ', {$title: title}, function(err) {
    if (err) return next(err);

    db.get('SELECT * FROM Menu WHERE id = $id', {$id: this.lastID}, (err, row) => {
      if (err) return next(err);
      res.status(201).send({menu: row});
    });
  });
});

// GET api/menus/:menuId
menusRouter.get('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (err, row) => {
    if (err) return next(err);
    res.status(200).send({menu: row});
  });  
});

// PUT api/menus/:menuId
menusRouter.put('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  const {title} = req.body.menu;
  if (!title) {
    return res.status(400).send();
  }  
  db.run('UPDATE Menu SET title = $title WHERE id = $menuId', {$title: title, $menuId: menuId}, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM Menu WHERE id = $menuId', {$menuId: menuId}, (err, row) => {
      if (err) return next(err);
      res.status(200).send({menu: row});
    });
  });
});

// DELETE api/menus/:menuId
menusRouter.delete('/:menuId', (req, res, next) => {
  const menuId = req.params.menuId;
  db.get('SELECT * FROM MenuItem WHERE menu_id = $menuId', {$menuId: menuId}, (err, row) => {
    if (err) return next(err);
    if (row) {
      return res.status(400).send();
    }
    db.run('DELETE FROM Menu WHERE id = $menuId', {$menuId: menuId}, function(err) {
      if (err) return next(err);
      res.status(204).send();
    });
  });  
});

module.exports = menusRouter;