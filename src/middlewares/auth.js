const authConfig = require('../config/auth.json');
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const authHeader = req.headers.authorization;

    if(!authHeader){
        return res.status(401).send({error: 'No Token Provider!'})
    }

    const parts = authHeader.split(' ');

    if(!parts.lenght == 2){
        return res.status(401).send({error: 'Token Error!'})
    }

    const [ scheme, token ] = parts ;
    
    if(!/^Bearer$/i.test(scheme)){
        return res.status(401).send({error: 'Token malFormatted!'})
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) return res.status(401).send({error: 'Token Invalid!'})

        req.userId = decoded.id;
        // console.log(decoded.id);

        return next();
    });

};