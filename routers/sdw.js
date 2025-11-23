// import db_connection_pool from "../connections.js";
import express from "express";
import {supabase} from "../middleware/supabase_client.js";  

const sdwRouter = express.Router();

// function for validating if the sdw/staff with the `sdw_id` exists in the database
async function findUser(sdw_id){
    // try{
    //     const [rows] = await connection.execute(
    //         'SELECT * FROM reports_db.sdws WHERE sdw_id = ?',
    //         [sdw_id]
    //     );

    //     if(rows.length > 0){
    //         return rows[0];
    //     }

    //     return null;
    // } catch(err){
    //     console.error("ERROR in sdw.js findUser(): " + err);
    // }
    try{
        const {data: sdw, error: err1} = await supabase
            .from('sdws')
            .select('*')
            .eq('sdw_id', sdw_id)
            .single()
    
        if(err1) throw err1;

        if(sdw) return sdw;
    } catch(err){
        console.error(err);
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
        return res.render( //Go to supervisor_reports.js
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
