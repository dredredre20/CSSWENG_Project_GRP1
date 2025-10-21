// register router
import express from 'express';
import db_connection_pool from '../connections.js';

const registerRouter = express.Router();

const registerPage = (req, res) => {
    res.render('register');
}

registerRouter.get('/', registerPage);

// this contains the logic for admin's "create user" function
registerRouter.post('/', async (req, res) => {
    try{
        //get the inputs from the form
        const {email, password, type} = req.body;

        // get a connection to the db
        const connection = await db_connection_pool.getConnection();

        // find user in the database
        try{
            // use prepared statements
            const statement = 'INSERT INTO new_reports_db.staffinfo (stafftype, email, password)  VALUES(?, ?, ?)';
            // email/password as parameters to validate --then execute query
            await connection.execute(statement, [type, email, password]); //req.session.logged_user.email - took this out for now 
        } catch(err){
            console.log(err);
        }

        res.redirect('/home'); // redirect to home page
    } catch(err){
        console.error(err);
    }
})

export default registerRouter;