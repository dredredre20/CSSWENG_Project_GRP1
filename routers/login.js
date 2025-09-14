// login router
import express from 'express';

const loginRouter = express.Router();

const loginPage = (req, res) => {
    res.render('login');
}

loginRouter.get('/', loginPage);

loginRouter.post('/', (req, res) => {
    try{
        //get the inputs from the form
        const {email, password} = req.body;

        // db READ should happen here
        // ...
        // for now, initiallyt just log input for testing (validate in console)
        console.log(`(LOGIN) Email: ${email} Password: ${password}`);
        res.redirect('/login');
    } catch(err){
        console.error(err);
    }
})

export default loginRouter;