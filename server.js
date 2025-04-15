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


