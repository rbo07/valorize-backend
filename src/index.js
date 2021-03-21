const express = require('express');
const app = express();
const routes = require('./routes.js');
const cors = require('cors')

//setting port
app.set('port', process.env.POST||3000);

app.use(cors());

require('./database');

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use(routes);

app.listen(3000);