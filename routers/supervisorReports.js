import db_connection_pool from "../connections.js";
import express from "express";

const supervisorReportsRouter = express.Router();

supervisorReportsRouter.get('/', async (req, res) => {
    return res.render('supervisor_reports');
});

export default supervisorReportsRouter;