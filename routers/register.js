// register router
import express from 'express';
import db_connection_pool from '../connections.js';
import bcrypt from 'bcrypt';
import { supabase } from '../middleware/supabase_client.js';

const registerRouter = express.Router();

const registerPage = (req, res) => {
    res.render('register');
}

registerRouter.get('/', registerPage);

// this contains the logic for admin's "create user" function
registerRouter.post('/', async (req, res) => {
    // try{
    //     //get the inputs from the form
    //     const {email, password, type} = req.body;

    //     // get a connection to the db
    //     const connection = await db_connection_pool.getConnection();

    //     // find user in the database
    //     try{
    //         const hashed = await bcrypt.hash(password,10);
    //         // use prepared statements
    //         const statement = 'INSERT INTO reports_db.staff_info (staff_type, email, password)  VALUES(?, ?, ?)';
    //         // email/password as parameters to validate --then execute query
    //         await connection.execute(statement, [type, email, hashed]); //req.session.logged_user.email - took this out for now 
    //     } catch(err){
    //         console.log(err);
    //     }

    //     res.redirect('/home'); // redirect to home page
    // } catch(err){
    //     console.error(err);
    // }
    try{
        const {email, password, type} = req.body;
        const hashed = await bcrypt.hash(password,10);

        try{
            const {data: registerAccount, error: err1} = await supabase
                .from('staff_info')
                .insert([{
                    staff_type: type,
                    email: email,
                    password: hashed
                }])
            
            if(err1) throw err1;
        } catch(err){
            console.error(err);
        }

        res.redirect('/home');
    } catch(err){
        console.error(err);
    }
})

export default registerRouter;