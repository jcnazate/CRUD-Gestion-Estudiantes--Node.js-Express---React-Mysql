// 1) Cargar variables de entorno ANTES de cualquier uso de process.env
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// 2) Imports
const express = require('express');
const cors = require('cors');
const ConnectDB = require('./db/ConnectDB');
const router = require('./routes/DBOperRoutes');

// Verificar que la clave JWT_SECRET esté configurada
if (!process.env.JWT_SECRET) {
    console.error('Error: JWT_SECRET no está configurado en el archivo .env');
    process.exit(1);
}

// Inicializar la aplicación de Express
const app = express();

//using the port in environmental variable or 5000
const port = process.env.PORT || 5000;

// middleware to parse incoming request in bodies
app.use(express.json());
app.use(cors())
// initialize the database connection pool
let pool;

(async () => {
    pool = await ConnectDB();

    // pass the pool to the routes
    app.use((req, res, next) => {
        req.pool = pool;
        next();
    });

    // use the router
    app.use("/", router);

    // start the server
    app.listen(port, () => {
        console.log(`Example app listening on port http://localhost:${port}`);
    });
})();
