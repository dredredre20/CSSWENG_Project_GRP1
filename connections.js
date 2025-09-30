import mysql2 from 'mysql2/promise'

//----------------CONNECT TO DATABASE-----------------

// SEE MYSQL2 DOCUMENTATION FOR MORE INFO: https://sidorares.github.io/node-mysql2/docs
const db_connection_pool = mysql2.createPool({ // create a connection pool for multiple db connections
    // .createPool(config) flavor
    host: 'localhost',
    port: 3306,
    database: 'reports_db',
    user: 'root',
    password: 'sweng333' // -note: i just used this password initially --we can use another password !! 
});

export default db_connection_pool;