const fs = require('fs')
const privateKey  = fs.readFileSync('./certificado-digital/selfsigned.key', 'utf8');
const certificate = fs.readFileSync('./certificado-digital/selfsigned.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const https = require('https');
var RateLimit = require('express-rate-limit');
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');


const express = require('express') 
const app = express()
const port = 3002

const db = require("./db");

var cookieParser = require('cookie-parser'); 
const bodyParser = require('body-parser');
const { randomUUID } = require('crypto');

const checkScopes = requiredScopes('openid');
const checkJwt = auth({
   audience: 'http://localhost:4200', // Chamadores habilitados
   issuerBaseURL: `https://dev-967p-ca5.us.auth0.com`,
});

var limiter = new RateLimit({
    windowMs: 15*60*1000,
    max: 50,
    delayMs: 0,
    message: "Too many accounts created from this IP, please try again after an hour"
});

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
 });

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(bodyParser.json());
app.use(cookieParser()); 
app.use(limiter);

app.get('/orders', checkJwt, checkScopes, async (req, res, next) => { 
    var resp = await db.getAllOrders();
    res.status(200).json(resp);
});

app.post('/orders', checkJwt, checkScopes, async (req, res, next) => { 

    try{
        var id = randomUUID();
        var clientId = req.body.client_id;
        var productId = req.body.product_id
        var amount = req.body.amount
        
        await db.insertOrder(id, clientId, productId, amount);
        return res.status(200).json({message: 'Pedido cadastrado com sucesso!', order_id: id});

    }catch(err){
        return res.status(err.code).json(err);
    }
});

app.get('/orders/:id', checkJwt, checkScopes, async (req, res, next) => { 

    try{
        var id = req.params.id;
        const [rows] = await db.getOrderById(id);
        if(rows){
            return res.status(200).send(rows);
        }
        return res.status(404).send(`Pedido ${id} não encontrado!`);
    }catch(err){
        return res.status(err.code).json(err);
    }
});

app.get('/ordersByClientId/:id', checkJwt, checkScopes, async (req, res, next) => { 

    try{
        var id = req.params.id;
        const [rows] = await db.getOrderByClientId(id);
        if(rows){
            return res.status(200).send(rows);
        }
        return res.status(404).send(`Pedido ${id} não encontrado!`);
    }catch(err){
        return res.status(err.code).json(err);
    }
});


app.put('/orders/:id', checkJwt, checkScopes, async (req, res, next) => { 

    try{
        var id = req.params.id;

        var clientId = req.body.client_id;
        var productId = req.body.product_id
        var amount = req.body.amount

        const rows = await db.updateOrderById(id, clientId, productId, amount);
        if(rows){
            return res.status(200).send({message: "Pedido atualizado com sucesso!"});
        }
        return res.status(404).send(`Pedido ${id} não encontrado!`);
    }catch(err){
        return res.status(err.code).json(err);
    }
});

app.delete('/orders/:id', checkJwt, checkScopes, async (req, res, next) => {

    try{
        var id = req.params.id;
        await db.deleteOrderById(id);
        return res.status(200).send({message: `Pedido ${id} deletado com sucesso!`}); 

    }catch(err){
        return res.status(err.code).json(err);
    }
});

var httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
    console.log(`Listening at https://localhost:${port}`)
});
