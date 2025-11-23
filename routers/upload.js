import express from "express";
import multer from "multer";
import { dbx } from "../middleware/dropboxAuth.js";
import { supabase } from '../middleware/supabase_client.js';

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // so it doesnt make a temp file

// appends (n) based on how many exists in the dropbox with the same name
async function getUniqueDropboxPath(fileName) {
    let baseName = fileName;
    let ext = '';
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1) {
        baseName = fileName.slice(0, dotIndex);
        ext = fileName.slice(dotIndex);
    }

    let uniqueName = fileName;
    let counter = 2;

    while (true) {
        try {
            await dbx.filesGetMetadata({ path: uniqueName });
            // file exists, generate next name
            uniqueName = `${baseName}(${counter})${ext}`;
            counter++;
        } catch (err) {
            if (err.status === 409) {
                // File does not exist, break loop
                break;
            } else {
                throw err; // other errors
            }
        }
    }

    return uniqueName;
}

uploadRouter.post('/', upload.single("file"), async (req, res) => {
    let response;
    try{
        const upload_info = req.body;
        const file = req.file;
        const account = req.session.logged_user;
        console.log(account)

        if (!account) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }
        // using staff_info_id to get sdw_id from sdws table
        /*let sdw_id_query = `SELECT sdw_id
                            FROM sdws s
                            JOIN staff_info si ON si.staff_id = s.staff_info_id
                            WHERE si.staff_id = ?`;*/

        const { data, error } = await supabase.from('sdws').select('sdw_id').eq('staff_info_id', account.id);
        if (error) throw error;
        
        console.log("sdws query result:", data);
        const sdw_id = data?.[0]?.sdw_id;
        
        if (sdw_id == null) {
            return res.status(400).json({ success: false, message: "No SDW found" });
        }

        // when implementing supabase use this for the path instead of upload_info.report_name
        const uniquePath = await getUniqueDropboxPath(`/${upload_info.report_name}`);
        // remvoes the / at the beginning of the path
        const uniqueName = uniquePath.slice(1);

        response = await dbx.filesUpload({
            path: uniquePath,
            contents: file.buffer,
            mode: { ".tag": "add" }
        });

        try{
            //const statement = 'INSERT INTO reports (sdw_id, report_name, file_size, upload_date, type, file_path) VALUES(?, ?, ?, ?, ?, ?)';
            
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            //await connection.execute(statement, [sdw_id, upload_info.report_name, file.size, dateTime, upload_info.type, response.result.id]);

            const { error } = await supabase.from('reports')
                                                    .insert({   sdw_id: sdw_id,
                                                                report_name: uniqueName,
                                                                file_size: file.size,
                                                                upload_date: dateTime,
                                                                type: upload_info.type,
                                                                file_path: response.result.id});
            if (error) throw error;

            res.json({ success: true });
        } catch(err){
            console.error("ERROR: upload.js uploadRouter DB Operation " + err);
        }

    } catch(err){
        console.error("ERROR: upload.js uploadRouter POST ", err);
    }
});

export default uploadRouter;