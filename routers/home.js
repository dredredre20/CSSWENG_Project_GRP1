import db_connection_pool from '../connections.js';
import express from 'express';
import {supabase} from '../middleware/supabase_client.js';

const homeRouter = express.Router();

// get all sdws under the specific supervisor
async function getSdws(supervisor_id){
    try{
        // Changed this query to correctly fetch sdws
        /*const [sdws] = await connection.execute(
            `SELECT s.sdw_id, s.first_name, s.last_name 
             FROM sdws s 
             JOIN supervisors sup ON s.supervisor_id = sup.supervisor_id
             WHERE s.supervisor_id = ?`,
            [supervisor_id]
        );*/

        const sdws = await supabase.from('sdws').select('*').eq('supervisor_id', supervisor_id).then((result)=>{
            if(result.data)
                return result.data;
        });

        return sdws;
    } catch(err){
        console.error('ERROR in home.js getSdws() function: ' + err);
    }
}

// get all spus under the admin
async function getSpus(connection, admin_id){
    try{
        const spus = await supabase.from('spus_has_admins').select('*').then((result)=>{
            if(result.data)
                return result.data;
        });

        return spus;
    } catch(err){
        console.error('ERROR in home.js getSpus() function: ' + err);
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
            return res.redirect('/admin');
        } else if(user.staff_type === 'supervisor'){ 
            // for supervisor, include the list of sdws under them for rendering
            const supervisor_user = await supabase.from('supervisor').select('*').eq('staff_info_id', user.id).then((result) =>{
                if(result.data)
                    return result.data;
            });
            const sdws = await getSdws(supervisor_user.supervisor_id);
            // console.log('SDWs data:', sdws); Just used this to debug
            res.render('supervisor_homepage', { //renders supervisor_homepage.ejs
                user: supervisor_user,
                sdws: sdws
            });
        } else if(user.staff_type === 'sdw'){

            const sdw_user = await supabase.from('sdws').select('*').eq('staff_info_id', user.id).then((result) =>{
                if(result.data)
                    return result.data;
            });

            res.render('sdw_homepage', {  // route to sdw_homepage.ejs page
                user: sdw_user
            });
        }

        //await connection.release();

    } else {
        //if no user just go back to /login route
        res.redirect('/login');
    }
});


export default homeRouter;