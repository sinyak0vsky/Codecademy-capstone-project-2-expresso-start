const express = require('express');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './db.sqlite');
const menuItemsRouter = express.Router({mergeParams: true});

//
// Middleware
//

// GET /api/menus/:menuId/menu-items
menuItemsRouter.get('/', (req, res, next) => {
  const menuId = req.params.menuId;
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {$menuId: menuId}, (err, rows) => {
    if (err) return next(err);
    res.status(200).send({menuItems: rows});
  });
});

// POST /api/menus/:menuId/menu-items
menuItemsRouter.post('/', (req, res, next) => {
  const {name, description, inventory, price} = req.body.menuItem;
  const menuId = req.params.menuId;

  if (!name || !inventory || !price) {
    return res.status(400).send();
  }

  const sqlQuery = 'INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)';
  const params = {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  };

  db.run(sqlQuery, params, function(err) {
    if (err) return next(err);
    db.get('SELECT * FROM MenuItem WHERE id = $id', {$id: this.lastID}, (err, row) => {
      if (err) return next(err);
      res.status(201).send({menuItem: row});
    });
  });
});

module.exports = menuItemsRouter;