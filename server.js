import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import dotenv from 'dotenv';
import { getAllUsers, createUser, getUserById, updateUser, deleteUser, getAllRestaurants, createRestaurant, getRestaurantById, updateRestaurant, deleteRestaurant, getRestaurantMenu, createMenuItem, getCart, addToCart, updateCart, clearCart } from './queries.js';

dotenv.config();

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const swaggerDocument = YAML.parse(fs.readFileSync('food-delivery-api.yml', 'utf8'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// User
app.get('/api/v1/users', getAllUsers);
app.post('/api/v1/users', createUser);
app.get('/api/v1/users/:userId', getUserById);
app.put('/api/v1/users/:userId', updateUser);
app.delete('/api/v1/users/:userId', deleteUser);

// Restaurant
app.get('/api/v1/restaurants', getAllRestaurants);
app.post('/api/v1/restaurants', createRestaurant);
app.get('/api/v1/restaurants/:restaurantId', getRestaurantById);
app.put('/api/v1/restaurants/:restaurantId', updateRestaurant);
app.delete('/api/v1/restaurants/:restaurantId', deleteRestaurant);

// Menu
app.get('/api/v1/restaurants/:restaurantId/menu', getRestaurantMenu);
app.post('/api/v1/restaurants/:restaurantId/menu', createMenuItem);

// Cart
app.get('/api/v1/cart', getCart);
app.post('/api/v1/cart', addToCart);
app.put('/api/v1/cart', updateCart);
app.delete('/api/v1/cart', clearCart);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


