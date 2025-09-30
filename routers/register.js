// register router
import express from 'express';

const registerRouter = express.Router();

const registerPage = (req, res) => {
    res.render('register');
}

registerRouter.get('/', registerPage);

registerRouter.post('/', (req, res) => {
    try{
        //get the inputs from the form
        const {name, email, password, type} = req.body;
        //same as with the login router, there will be db operation here
        // initally just log input for now
        console.log(`(REGISTER) Name: ${name}, Email: ${email}, Password: ${password}, Usertype: ${type}`);
        res.redirect('/login'); // redirect to login page
    } catch(err){
        console.error(err);
    }
})

export default registerRouter;