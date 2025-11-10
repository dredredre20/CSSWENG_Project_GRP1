import db_connection_pool from '../connections.js';
import express from 'express';

const homeRouter = express.Router();

// get all sdws under the specific supervisor
async function getSdws(connection, supervisor_id){
    try{
        // Changed this query to correctly fetch sdws
        const [sdws] = await connection.execute(
            `SELECT s.sdw_id, s.first_name, s.last_name 
             FROM sdws s 
             JOIN supervisors sup ON s.supervisor_id = sup.supervisor_id
             WHERE s.supervisor_id = ?`,
            [supervisor_id]
        );
        return sdws;
    } catch(err){
        console.error('ERROR in login.js getSdws() function: ' + err);
    }
}

homeRouter.get('/', async (req, res) => {
    //if the user is in session,, only
    if(req.session.logged_user){
        const connection = await db_connection_pool.getConnection();
        // obtain the logged user in the session
        const user = req.session.logged_user;
        //here just pass stuff to render in the page based on role
        if(user.staff_type === 'admin'){
            res.render('home', { 
                user: user
            });
        } else if(user.staff_type === 'supervisor'){ 
            // for supervisor, include the list of sdws under them for rendering
            const sdws = await getSdws(connection, user.id);
            // console.log('SDWs data:', sdws); Just used this to debug
            res.render('supervisor_homepage', { //renders supervisor_homepage.ejs
                user: user,
                sdws: sdws
            });
        } else if(user.staff_type === 'sdw'){
            res.render('sdw_homepage', {  // route to sdw_homepage.ejs page
                user: user
            });
        }

        await connection.release();

    } else {
        //if no user just go back to /login route
        res.redirect('/login');
    }
});


export default homeRouter;