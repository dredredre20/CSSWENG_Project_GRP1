import db_connection_pool from "../connections.js";
import express from "express";
import multer from "multer";
import fs from "fs";

import { oauth2Client, drive } from "../middleware/googleAuth.js";

const uploadRouter = express.Router();
const upload = multer({dest: "uploads/"});

uploadRouter.post('/', upload.single("file"), async (req, res) => {
    let response;
    try{
        const upload_info = req.body;
        const file = req.file;
        const connection = await db_connection_pool.getConnection();
        const account = req.session.logged_user;
        console.log(account)

        if (!account) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }
        // using staff_info_id to get sdw_id from sdws table
        let sdw_id_query = `SELECT sdw_id
                            FROM sdws s
                            JOIN staff_info si ON si.staff_id = s.staff_info_id
                            WHERE si.staff_id = ?`;
        const [sdw_rows] = await connection.execute(sdw_id_query, [account.id]);
        
        if (sdw_rows.length === 0) {
            console.log("No SDW found for staff_id:", account.staff_id);
            return res.render('sdw_homepage'); // idk how to handle this
        }

        const sdw_id = sdw_rows[0].sdw_id;

        // create google drive file
        try{
            response = await drive.files.create({
                requestBody: {
                    name: upload_info.report_name,
                    mimeType: file.mimetype || 'application/vnd.ms-excel',
                },
                media: {
                    mimeType: file.mimetype || 'application/vnd.ms-excel',
                    body: fs.createReadStream(file.path),
                }
            });
            console.log("Uploaded to Google Drive", response.data);
        }catch(err){
            console.error("Google Drive Error: ", err);
            return res.status(500).send("Failed to upload to Google Drive." );
        }finally {
            // Always delete local file
            if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        // insert into database
        // VERY IMPORTANT -- the google drive ID is now file_path in the database
        try{
            const statement = 'INSERT INTO reports (sdw_id, report_name, file_size, upload_date, type, file_path) VALUES(?, ?, ?, ?, ?, ?)';
            
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            // spu_id attrib is currently 0, since there is no db relations yet
            await connection.execute(statement, [sdw_id, upload_info.report_name, file.size, dateTime, upload_info.type, response.data.id]);
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