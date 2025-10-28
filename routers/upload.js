import db_connection_pool from "../connections.js";
import express from "express";
import multer from "multer";

const uploadRouter = express.Router();
const upload = multer({dest: "uploads/"});

uploadRouter.post('/', upload.single("file"), async (req, res) => {
    try{
        const upload_info = req.body;
        const connection = await db_connection_pool.getConnection();

        try{
            const statement = 'INSERT INTO reports (sdw_id, spu_id, file_size, upload_date, type) VALUES(?, ?, ?, ?, ?)';
            
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            (await connection).execute(statement, [upload_info.sdw_id, 0, upload_info.file_size, dateTime, upload_info.type]);
            
            res.json({ success: true });
        } catch(err){
            console.error("ERROR: upload.js uploadRouter DB Operation " + err);
        } finally{
            connection.release();
        }

    } catch(err){
        console.error("ERROR: upload.js uploadRouter POST " + err);
    }
});

export default uploadRouter;