// register router
import express from 'express';
import bcrypt from 'bcrypt';
import { supabase } from '../middleware/supabase_client.js';

const registerRouter = express.Router();

const registerPage = (req, res) => {
    res.render('register');
}

registerRouter.get('/', registerPage);

// this contains the logic for admin's "create user" function
registerRouter.post('/', async (req, res) => {

    try{
        const {email, password, type} = req.body;
        const hashed = await bcrypt.hash(password,10);

        try{
            const {data: registerAccount, error: err1} = await supabase
                .from('staff_info')
                .insert({
                    staff_type: type,
                    email: email,
                    password: hashed
                })
            
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