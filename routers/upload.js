import db_connection_pool from "../connections.js";
import express from "express";
import multer from "multer";

const uploadRouter = express.Router();
const upload = multer({dest: "uploads/"});

uploadRouter.post('/', upload.single("file"), async (req, res) => {
    try{
        const upload_info = req.body;
        const file = req.file;
        const connection = await db_connection_pool.getConnection();
        const account = req.session.logged_user;

        if (!account) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }
        // using staff_info_id to get sdw_id from sdws table
        let sdw_id_query = `SELECT sdw_id
                            FROM sdws s
                            JOIN staff_info si ON si.staff_id = s.staff_info_id
                            WHERE si.staff_id = ?`;
        const [sdw_rows] = await connection.execute(sdw_id_query, [account.staff_id]);
        
        if (sdw_rows.length === 0) {
            console.log("No SDW found for staff_id:", account.staff_id);
            return res.render('sdw_reports', { reports: [], currentCategory: category });
        }

        const sdw_id = sdw_rows[0].sdw_id;

        try{
            const statement = 'INSERT INTO reports (sdw_id, report_name, file_size, upload_date, type, file_path) VALUES(?, ?, ?, ?, ?, ?)';
            
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            // spu_id attrib is currently 0, since there is no db relations yet
            await connection.execute(statement, [sdw_id, upload_info.report_name, upload_info.file_size, dateTime, upload_info.type, file.path]);
            console.log(file.path);
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