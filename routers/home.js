import express from 'express';

const homeRouter = express.Router();

homeRouter.get('/', (req, res) => {
    //if the user is in session,, only
    if(req.session.logged_user){
        // obtain the logged user in the session
        const user = req.session.logged_user;
  
        //here just pass stuff to render in the page based on role
        if(user.staff_type === 'admin'){
            res.render('home', { 
                user: user,
                role: 'Admin Dashboard',
            });
        } else if(user.staff_type === 'supervisor'){ 
            res.render('home', { 
                user: user,
                role: 'Supervisor Dashboard',
            });
        } else if(user.staff_type === 'sdw'){
            res.render('sdw_homepage', {  // route to sdw_homepage.ejs page
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