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
            const {data: fetchAccount, error: err1} = await supabase
                .from('staff_info')
                .select('*')
                .eq('email', email)
            
            account = fetchAccount;

            if(err1) throw err1;
        } catch(err){
            console.error(err);
        }

        console.log(account);
        
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
                return res.redirect('/home');
            }
            else if (account.staff_type == "supervisor"){
                try{
                    const {data: supervisorAccount, error: err2} = await supabase
                        .from('supervisor')
                        .select('*')
                        .eq('email', email)
                        .single()
                    
                    if(err2) throw err2;
                    // add the id as well for the /sdw route
                    req.session.logged_user = {
                        id: supervisorAccount.supervisor_id, 
                        staff_type: account.staff_type, 
                        first_name: supervisorAccount.first_name, 
                        last_name: supervisorAccount.last_name
                    };
                } catch(err){
                    console.error(err);
                }
            }
            else if(account.staff_type == "admin"){              
                try{
                    const {data: adminAccount, error: err3} = await supabase
                        .from('admins')
                        .select('*')
                        .eq('email', email)
                        .single()
                    
                    if(err3) throw err3;

                    req.session.logged_user = {
                        id: adminAccount.admin_id,
                        staff_type: account.staff_type,
                        first_name: adminAccount.first_name,
                        last_name: adminAccount.last_name,
                    };
                } catch(err){
                    console.error(err);
                } 
            }
            
            return res.redirect('/home');
        } else{
            console.log('No account found');
        }
        
        res.redirect('/login');
    } catch(err){
        console.error(err);
    }
})

export default loginRouter;