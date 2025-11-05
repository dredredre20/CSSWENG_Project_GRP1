// logout.js
import express from 'express';

const logoutRouter = express.Router();

logoutRouter.all('/', (req, res) => {
    console.log('Logout initiated for user:', req.session.logged_user?.email);
    
    req.session.destroy((error) => {
        if (error) {
            console.log("Error destroying session: " + error);
            return res.status(500).send('Logout failed');
        }
        
        // Clear the session cookie
        res.clearCookie('connect.sid'); 
        
        console.log("User logged out successfully");
        res.redirect('/login');
    });
});

export default logoutRouter;