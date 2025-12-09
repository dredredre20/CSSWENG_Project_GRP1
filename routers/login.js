// login router
import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../middleware/supabase_client.js';

const loginRouter = express.Router();

const loginPage = (req, res) => {
    res.render('login');
}

loginRouter.get('/', loginPage);

// fetch the user account by querying `sdws` table
async function get_sdw_info(account){
    try{
        const {data: sdw_account, error: err1} = await supabase
            .from('sdws')
            .select('*')
            .eq('email', account.email)
            .single();
        
        if(err1) throw err1;
        
        return sdw_account || null;
    } catch(err){
        console.error(err);
        return null;
    }
}

loginRouter.post('/', async (req, res) => {
    try{
        // get the inputs from the form
        const {email, password} = req.body;
        var account, firstName, lastName;

        // find user in the database using email only
        try{
            // use prepared statements

            const {data, error} = await supabase
                .from('staff_info')
                .select('*')
                .eq('email', email).single();
        
            if(error) throw error;
            else {account = data;}

        } catch(err){
            console.error(err);
            return res.status(401).json({error: 'invalid_credentials', message: 'Incorrect Password or Email'});
        }
        
        // if an account is returned and compare password hashes via bcrypt
        if(account && await bcrypt.compare(password, account.password)){
            //store the user in the session
            if(account.staff_type == "sdw"){
                req.session.logged_user = {
                    id: account.staff_id,
                    staff_type: account.staff_type,
                    first_name: account.first_name,
                    last_name: account.last_name,
                };
                return res.json({success: true, redirect: '/home'});
            }
            else if (account.staff_type == "supervisor"){
                var supervisor;
                try{
                    //const {data, error} = await supabase
                    const {data, error} = await supabase
                        .from('supervisor')
                        .select('*')
                        .eq('email', email)
                        .single();
                    
                    if(error) throw error;
                    else{
                        console.log(data);
                        supervisor = data;
                    }
                    
                    // add the id as well for the /sdw route
                    req.session.logged_user = {
                        id: supervisor.supervisor_id, 
                        staff_type: account.staff_type, 
                        first_name: supervisor.first_name, 
                        last_name: supervisor.last_name
                    };
                    supervisor = null;
                    return res.json({success: true, redirect: '/home'});
                } catch(err){
                    console.error(err);
                    return res.status(500).json({error: 'server_error', message: 'Server error occurred'});
                }
            }
            else if(account.staff_type == "admin"){     
                var admin;         
                try{
                    const {data, error} = await supabase
                        .from('admins')
                        .select('*')
                        .eq('email', email)
                        .single();
                    
                    if(error) throw error;
                    else{
                        admin = data;
                    }

                    req.session.logged_user = {
                        id: admin.admin_id,
                        staff_type: account.staff_type,
                        first_name: admin.first_name,
                        last_name: admin.last_name,
                        email: admin.email
                    };
                    admin = null;
                    return res.json({success: true, redirect: '/home'});
                } catch(err){
                    console.error(err);
                    return res.status(500).json({error: 'server_error', message: 'Server error occurred'});

                } 
            }
            
            // return res.redirect('/home');
        } else{
            console.log('Invalid Credentials');
            return res.status(401).json({error: 'invalid_credentials', message: 'Incorrect Password or Email'});

        }
        
        res.redirect('/login');
    } catch(err){
        console.error(err);
        return res.status(500).json({error: 'server_error', message: 'Server error occurred'});

    }
})

export default loginRouter;