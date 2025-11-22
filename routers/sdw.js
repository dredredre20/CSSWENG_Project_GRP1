import db_connection_pool from "../connections.js";
import express from "express";
import {supabase} from '../middleware/supabaseClient.js';

const sdwRouter = express.Router();

// function for validating if the sdw/staff with the `sdw_id` exists in the database
async function findUser(sdw_id){
    try{

        const rows = await supabase.from('sdws').select('*').eq('sdw_id', sdw_id).then((result) =>{
            if(result.data.length > 0)
                return result.data;
            
        });

        if(rows.length > 0){
            return rows;
        }

        return null;
    } catch(err){
        console.error("ERROR in sdw.js findUser(): " + err);
    }
}

// sdw routes for supervisors viewing sdw reports
sdwRouter.get('/sdw/:sdw_id', async (req, res) => {
    const sdw_id = req.params.sdw_id;
    const supervisor = req.session.logged_user;

    if(!supervisor){
        return res.redirect('/login');
    }

   
    const sdw = await findUser(sdw_id);
    if(sdw){
        return res.render(
            'supervisor_reports', {
                supervisor,
                sdw
            }
        );
    } else{
        return res.status(404).send("SDW with ID " + sdw_id +  " not found.");
    }
});

export default sdwRouter;
