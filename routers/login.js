// login router
import express from 'express';
import bcrypt from 'bcrypt';
//import * as bigQ from '@google-cloud/bigquery';

import {supabase} from '../middleware/supabaseClient.js';

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
        var account, firstName, lastName;
        
        await supabase.from('staff_info').select('*').eq('email', email).then((result) => {
            if(result.data.length > 0){
                account = result.data[0];
            }
        });

        console.log(account);
        
        
        // if an account is returned and compare password hashes via bcrypt
        if(account && await bcrypt.compare(password, account.password)){
            //store the user in the session
            //req.session.logged_user = account;

            // using a single home route for cleaner file directory
            //tho we can define routes for each user, it would be tedious
            if(account.staff_type == "sdw"){

                await supabase.from('sdws').select('*').eq('email', email).then((result) =>{
                    if(result.data.length > 0){
                        const sdw_account = result.data[0];
                        req.session.logged_user = {
                            id: sdw_account.sdw_id,
                            staff_type: account.staff_type,
                            first_name: sdw_account.first_name,
                            last_name: sdw_account.last_name,
                             
                        };
                    }
                });

            }
            else if (account.staff_type == "supervisor"){
                try{
                    

                    await supabase.from('supervisor').select('*').eq('email',email).then((result) =>{
                        if(result.data.length > 0){
                            const supervisor_account = result.data[0];
                            req.session.logged_user = {
                                id: supervisor_account.supervisor_id, 
                                staff_type: account.staff_type, 
                                first_name: supervisor_account.first_name, 
                                last_name: supervisor_account.last_name
                            };
                        }
                    });

                    // add the id as well for the /sdw route
                    
                }catch(err){
                    console.error("ERROR FROM: login.js loginRouter supervisor fetch " + err);
                }
            }
            else if(account.staff_type == "admin"){
               await supabase.from('admins').select('*').eq('email', email).then((result) =>{
                    if(result.data.length > 0){
                        const admin_account = result.data[0];
                        req.session.logged_user = {
                            id: admin_account.admin_id,
                            staff_type: account.staff_type,
                            first_name: admin_account.first_name,
                            last_name: admin_account.last_name,
                        };
                    }
               });
                
                
            }
            
            
            
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