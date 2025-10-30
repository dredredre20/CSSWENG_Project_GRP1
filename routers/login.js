// login router
import express from 'express';
import bcrypt from 'bcrypt';
import db_connection_pool from '../connections.js';

const loginRouter = express.Router();

const loginPage = (req, res) => {
    res.render('login');
}

loginRouter.get('/', loginPage);

// fetch the user account by querying `sdws` table
async function get_sdw_info(connection, account){
    try{
        // just experimenting with JOIN since both tables are accessed
        const statement = `SELECT sdws.* FROM sdws 
                           JOIN staff_info ON sdws.email = staff_info.email 
                           WHERE staff_info.email = ?`;
        const [rows] = await connection.execute(statement, [account.email]);
        const sdw_account = rows[0];

        return sdw_account || null;
    } catch(err){
        console.error("ERROR FROM: login.js get_sdw_info() " + err);
        return null;
    }
}

loginRouter.post('/', async (req, res) => {
    try{
        // get the inputs from the form
        const {email, password} = req.body;
        var account;
        
        // get a connection to the db
        const connection = await db_connection_pool.getConnection();

        // find user in the database using email only
        try{
            // use prepared statements
            const statement = 'SELECT * FROM staff_info WHERE email = ?';
            // email/password as parameters to validate --then execute query
            const [rows] = await connection.execute(statement, [email]); 
            account = rows[0];
            console.log("Found email")
        } catch(err){
            console.error("ERROR FROM: login.js loginRouter database operation " + err);
        }
        
        // end connection
        connection.release();

        // if an account is returned and compare password hashes via bcrypt
        if(account && await bcrypt.compare(password, account.password)){
            //store the user in the session
            req.session.logged_user = account;

            // for now, initiallyt just log input for testing (validate in console)
            console.log(`(LOGIN) Email: ${email} Password: ${password}`);

            /*if(account.staff_type == "sdw"){
                const sdw_info = await get_sdw_info(connection, account);
                return res.render('sdw_homepage', {
                    user: sdw_info
                });
            }*/

            // using a single home route for cleaner file directory
            //tho we can define routes for each user, it would be tedious
            return res.redirect('/home'); 
        } else{
            console.log('No account found');
        }
        res.redirect('/login');
    } catch(err){
        console.error("ERROR FROM: login.js loginRouter POST " + err);
    }
})

export default loginRouter;