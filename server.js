import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import fs from 'fs';
import mysql from 'mysql'

const app = express();
app.use(express.json());
const port = 3000;

const swaggerDocument = YAML.parse(fs.readFileSync('food-delivery-api.yml', 'utf8'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});




