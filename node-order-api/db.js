async function connect(){
    if(global.connection && global.connection.state !== 'disconnected')
        return global.connection;
 
    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: 3306,
        user: 'test',
        password: 'test',
        database: 'finalProject',
        multipleStatements: true
      } );
    console.log("Conectou no MySQL!");
    global.connection = connection;
    return connection;
}

async function getAllOrders(){
    const conn = await connect();
    
    const query = `SELECT * FROM orders LIMIT 1000;`;

    const [rows, fields] = await conn.execute(query);
    console.log(`Rows: ${JSON.stringify(rows)}`);
    return rows;
}

async function getOrderById(id){
    const conn = await connect();
    
    const query = `SELECT * FROM orders WHERE id=?;`;
    
    const [rows, fields] = await conn.execute(query, [id]);

    return rows;
}

async function getOrderByClientId(id){
    const conn = await connect();
    
    const query = `SELECT * FROM orders WHERE client_id =?;`;
    
    const [rows, fields] = await conn.execute(query, [id]);

    return rows;
}

async function updateOrderById(id, clientId, productId, amount){
    try{
        const conn = await connect();
    
        const query = `UPDATE orders SET client_id =?", product_id =?, amount =? WHERE id =?;`;
        
        const [rows] = await conn.execute(query, [clientId, productId, amount, id]);
        return rows;
    }catch(err){
        throw {code: 500, message: 'Erro inesperado ao tentar cadastrar pedido'};
    }
}

async function deleteOrderById(id){
    const conn = await connect();
    
    const query = `DELETE FROM orders WHERE id =?;`;

    await conn.execute(query, [id]);
}

async function insertOrder(id, clientId, productId, amount){
    const conn = await connect();

    const query = `INSERT INTO orders(id, client_id, product_id, amount) VALUES (?, ?, ?, ?);`;

    try{
        await conn.execute(query, [id, clientId, productId, amount]);
    }catch(err){
        if(err.errno === 1062){
            throw {code: 400, message: 'Já existe um pedido cadastrado com este id!'};
        }else if(err.errno === 1452){
            throw {code: 400, message: 'Produto não encontrado!'};
        }else{
            throw {code: 500, message: 'Erro inesperado ao tentar cadastrar pedido'};
        }
    }
}

module.exports = {getOrderById, getOrderByClientId, getAllOrders, insertOrder, updateOrderById, deleteOrderById}
