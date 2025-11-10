import db_connection_pool from "../connections.js";
import express from "express";

const adminRouter = express.Router();

adminRouter.post('/:spu_type', async (req, res) => {
    const spu_type = req.params.spu_type;
    try {
        res.render('admin_spu');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.get('/edit/:edit_sdw_id', async (req, res) => {
    const edit_sdw_id = req.params.edit_sdw_id;
    try {
        res.render('admin_editacc');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.post('/create', async (req, res) => {
    const create_sdw_id = req.params.create_sdw_id;
    try {
        res.render('admin_createacc');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});
export default adminRouter;