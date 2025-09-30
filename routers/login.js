// login router
import express from 'express';
import db_connection_pool from '../connections.js';

const loginRouter = express.Router();

const loginPage = (req, res) => {
    res.render('login');
}

loginRouter.get('/', loginPage);

loginRouter.post('/', async (req, res) => {
    try{
        // get the inputs from the form
        const {email, password} = req.body;
        var account;
        
        // get a connection to the db
        const connection = await db_connection_pool.getConnection();

        // find user in the database
        try{
            // use prepared statements
            const statement = 'SELECT * FROM users WHERE email = ? AND passkey = ?';
            // email/password as parameters to validate --then execute query
            const [rows] = await connection.execute(statement, [email, password]); 
            account = rows[0];
        } catch(err){
            console.log(err);
        }
        
        // end connection
        connection.release();

        // if an account is returned
        if(account){
            // for now, initiallyt just log input for testing (validate in console)
            console.log(`(LOGIN) Email: ${email} Password: ${password}`);
            return res.send(`<h1>Welcome ${account.usertype}!<h1>`);
        } else{
            console.log('No account found');
        }
        res.redirect('/login');
    } catch(err){
        console.error(err); 
    }
})

export default loginRouter;