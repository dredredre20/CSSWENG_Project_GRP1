import express from 'express';
import db_connection_pool from '../connections.js';

const homeRouter = express.Router();

const homePage = (req, res) => {
    res.render('home');
}

homeRouter.get('/', (req, res) => {
    //if the user is in session,, only
    if(req.session.logged_user){
        // obtain the logged user in the session
        const user = req.session.logged_user;
  
        //here just pass stuff to render in the page based on role
        if(user.stafftype === 'A'){
            res.render('home', { 
                user: user,
                role: 'Admin Dashboard',
            });
        } else if(user.stafftype === 'S'){ 
            res.render('home', { 
                user: user,
                role: 'User Dashboard',
            });
        } else if(user.stafftype === 'D'){
            res.render('home', { 
                user: user,
                role: 'User Dashboard',
            });
        }
    } else {
        //if no user just go back to /login route
        res.redirect('/login');
    }
});

export default homeRouter;