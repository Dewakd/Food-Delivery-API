import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import mysql from 'mysql'
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});


const swaggerDocument = YAML.parse(fs.readFileSync('food-delivery-api.yml', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.get('/api/v1/users', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) {
            res.status(500).send('Error getting users');
            return;
        }
        res.json(results);
    });
});

app.post('/api/v1/users', (req, res) => {
    const { username, email, password, fullName, phoneNumber, address } = req.body;

    if (!username || !email || !password) {
        res.status(400).send('Username, email and password are required');
        return;
    }

    const query = `INSERT INTO users (username, email, password, full_name, phone_number, address) 
                   VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(query, [username, email, password, fullName, phoneNumber, address], (err, result) => {
        if (err) {
            res.status(500).send('Error creating user');
            return;
        }
        res.status(201).send('User created successfully');
    });
});

app.get('/api/v1/users/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query('SELECT * FROM users WHERE id = ?', [userId], (err, results) => {
        if (err) {
            res.status(500).send('Error getting user');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.json(results[0]);
    });
});

app.put('/api/v1/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const { fullName, phoneNumber, address, email } = req.body;

    const query = `UPDATE users 
                   SET full_name = ?, phone_number = ?, address = ?, email = ? 
                   WHERE id = ?`;

    db.query(query, [fullName, phoneNumber, address, email, userId], (err, result) => {
        if (err) {
            res.status(500).send('Error updating user');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.send('User updated successfully');
    });
});

app.delete('/api/v1/users/:userId', (req, res) => {
    const userId = req.params.userId;

    db.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
        if (err) {
            res.status(500).send('Error deleting user');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('User not found');
            return;
        }
        res.send('User deleted successfully');
    });
});

app.get('/api/v1/restaurants', (req, res) => {
    db.query('SELECT * FROM restaurants', (err, results) => {
        if (err) {
            res.status(500).send('Error getting restaurants');
            return;
        }
        res.json(results);
    });
});

app.post('/api/v1/restaurants', (req, res) => {
    const { name, description, image, rating } = req.body;

    if (!name) {
        res.status(400).send('Restaurant name is required');
        return;
    }

    const query = `INSERT INTO restaurants (name, description, image, rating) 
                   VALUES (?, ?, ?, ?)`;

    db.query(query, [name, description, image, rating], (err, result) => {
        if (err) {
            res.status(500).send('Error creating restaurant');
            return;
        }
        res.status(201).send('Restaurant created successfully');
    });
});

app.get('/api/v1/restaurants/:restaurantId/menu', (req, res) => {
    const restaurantId = req.params.restaurantId;

    db.query('SELECT * FROM menu_items WHERE restaurant_id = ?', [restaurantId], (err, results) => {
        if (err) {
            res.status(500).send('Error getting menu items');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('No menu items found for this restaurant');
            return;
        }
        res.json(results);
    });
});

app.post('/api/v1/restaurants/:restaurantId/menu', (req, res) => {
    const restaurantId = req.params.restaurantId;
    const { name, description, price, image } = req.body;

    if (!name || !price) {
        res.status(400).send('Menu item name and price are required');
        return;
    }


    db.query('SELECT id FROM restaurants WHERE id = ?', [restaurantId], (err, results) => {
        if (err) {
            res.status(500).send('Error checking restaurant');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Restaurant not found');
            return;
        }


        const query = `INSERT INTO menu_items (restaurant_id, name, description, price, image) 
                       VALUES (?, ?, ?, ?, ?)`;

        db.query(query, [restaurantId, name, description, price, image], (err, result) => {
            if (err) {
                res.status(500).send('Error adding menu item');
                return;
            }
            res.status(201).send('Menu item added successfully');
        });
    });
});

app.get('/api/v1/restaurants/:restaurantId', (req, res) => {
    const restaurantId = req.params.restaurantId;

    db.query('SELECT * FROM restaurants WHERE id = ?', [restaurantId], (err, results) => {
        if (err) {
            res.status(500).send('Error getting restaurant');
            return;
        }
        if (results.length === 0) {
            res.status(404).send('Restaurant not found');
            return;
        }
        res.json(results[0]);
    });
});

app.put('/api/v1/restaurants/:restaurantId', (req, res) => {
    const restaurantId = req.params.restaurantId;
    const { name, description, image, rating } = req.body;

    if (!name) {
        res.status(400).send('Restaurant name is required');
        return;
    }

    const query = `UPDATE restaurants 
                   SET name = ?, description = ?, image = ?, rating = ? 
                   WHERE id = ?`;

    db.query(query, [name, description, image, rating, restaurantId], (err, result) => {
        if (err) {
            res.status(500).send('Error updating restaurant');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Restaurant not found');
            return;
        }
        res.send('Restaurant updated successfully');
    });
});

app.delete('/api/v1/restaurants/:restaurantId', (req, res) => {
    const restaurantId = req.params.restaurantId;

    db.query('DELETE FROM restaurants WHERE id = ?', [restaurantId], (err, result) => {
        if (err) {
            res.status(500).send('Error deleting restaurant');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Restaurant not found');
            return;
        }
        res.send('Restaurant deleted successfully');
    });
});

app.get('/api/v1/cart', (req, res) => {
    const query = `
        SELECT c.id, c.quantity, m.name, m.price, (m.price * c.quantity) as total_price 
        FROM cart_items c 
        JOIN menu_items m ON c.menu_item_id = m.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            res.status(500).send('Error getting cart items');
            return;
        }


        const totalAmount = results.reduce((sum, item) => sum + item.total_price, 0);

        res.json({
            items: results,
            totalAmount: totalAmount
        });
    });
});

app.post('/api/v1/cart', (req, res) => {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || !quantity) {
        res.status(400).send('Menu item ID and quantity are required');
        return;
    }

    if (quantity <= 0) {
        res.status(400).send('Quantity must be greater than 0');
        return;
    }


    db.query('SELECT id FROM menu_items WHERE id = ?', [menuItemId], (err, results) => {
        if (err) {
            res.status(500).send('Error checking menu item');
            return;
        }

        if (results.length === 0) {
            res.status(404).send('Menu item not found');
            return;
        }

        const userId = 1;

        db.query('SELECT id, quantity FROM cart_items WHERE menu_item_id = ? AND user_id = ?', 
            [menuItemId, userId], (err, results) => {
                if (err) {
                    res.status(500).send('Error checking cart');
                    return;
                }

                if (results.length > 0) {
                    const newQuantity = results[0].quantity + quantity;
                    db.query('UPDATE cart_items SET quantity = ? WHERE menu_item_id = ? AND user_id = ?', 
                        [newQuantity, menuItemId, userId], (err, result) => {
                            if (err) {
                                res.status(500).send('Error updating cart');
                                return;
                            }
                            res.send('Cart updated successfully');
                        });
                } else {
                    db.query('INSERT INTO cart_items (menu_item_id, user_id, quantity) VALUES (?, ?, ?)', 
                        [menuItemId, userId, quantity], (err, result) => {
                            if (err) {
                                res.status(500).send('Error adding item to cart');
                                return;
                            }
                            res.status(201).send('Item added to cart successfully');
                        });
                }
            });
    });
});

app.put('/api/v1/cart', (req, res) => {
    const { menuItemId, quantity } = req.body;

    if (!menuItemId || quantity === undefined) {
        res.status(400).send('Menu item ID and quantity are required');
        return;
    }

    if (quantity === 0) {
        db.query('DELETE FROM cart_items WHERE menu_item_id = ?', [menuItemId], (err, result) => {
            if (err) {
                res.status(500).send('Error removing item from cart');
                return;
            }
            res.send('Item removed from cart');
        });
    } else if (quantity > 0) {
        db.query('UPDATE cart_items SET quantity = ? WHERE menu_item_id = ?', 
            [quantity, menuItemId], (err, result) => {
                if (err) {
                    res.status(500).send('Error updating cart');
                    return;
                }
                if (result.affectedRows === 0) {
                    res.status(404).send('Item not found in cart');
                    return;
                }
                res.send('Cart updated successfully');
            });
    } else {
        res.status(400).send('Quantity must be 0 or greater');
    }
});

app.delete('/api/v1/cart', (req, res) => {
    db.query('DELETE FROM cart_items', (err, result) => {
        if (err) {
            res.status(500).send('Error clearing cart');
            return;
        }
        res.send('Cart cleared successfully');
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


