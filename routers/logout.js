// login router
import express from 'express';

const logoutRouter = express.Router();

logoutRouter.post('/', (req, res) => {
    req.session.destroy(error => {
        if(error){
            console.log("Error destroying session: " + error);
        }
        res.redirect('/login');
    })
})

export default logoutRouter;