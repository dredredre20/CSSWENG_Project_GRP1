import express from 'express';
import {supabase} from '../middleware/supabase_client.js';

const homeRouter = express.Router();

// get all sdws under the specific supervisor
async function getSdws(supervisor_id){
    /*try{
        const {data: sdws, error: err1} = await supabase
            .from('sdws')
            .select('sdw_id, first_name, last_name')
            .eq('supervisor_id', supervisor_id);
        
        if(err1) throw err1;

        return sdws;
    } catch(err){
        console.error(err);
    }*/
    try {
        const { data: spuData, error: spuErr } = await supabase
            .from('spus')
            .select('spu_id')
            .eq('supervisor_id', supervisor_id)
            .single();

        if (spuErr) throw spuErr;

        if (!spuData) {
            console.log('Supervisor not assigned to any SPU.');
            return [];
        }

        const spuId = spuData.spu_id;

        const { data: sdws, error: sdwErr } = await supabase
            .from('sdws')
            .select('sdw_id, first_name, last_name')
            .eq('spu_id', spuId);

        if (sdwErr) throw sdwErr;

        return sdws || [];

    } catch (err) {
        console.error('Error fetching SDWs:', err);
        return [];
    }
}

// get all spus under the admin
async function getSpus(admin_id){
    try{
        const {data: spus, error: err1} = await supabase
            .from('spus_has_admins')
            .select('*')
            .eq('admins_admin_id', admin_id)
        
        if(err1) throw err1;

        return spus;
    } catch(err){
        console.error(err);
    }
}

homeRouter.get('/', async (req, res) => {
    //if the user is in session,, only
    if(req.session.logged_user){        
        // obtain the logged user in the session
        const user = req.session.logged_user;

        if(user.staff_type === 'admin'){
            return res.redirect('/admin');
        } else if(user.staff_type === 'supervisor'){ 
            // for supervisor, include the list of sdws under them for rendering
            const sdws = await getSdws(user.id);
            // console.log('SDWs data:', sdws); Just used this to debug
            console.log();
            console.log(sdws);
            res.render('supervisor_homepage', { //renders supervisor_homepage.ejs
                user: user,
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

    } else {
        //if no user just go back to /login route
        res.redirect('/login');
    }
});


export default homeRouter;