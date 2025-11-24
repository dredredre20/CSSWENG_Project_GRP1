import express from "express";
import multer from "multer";
import { dbx } from "../middleware/dropboxAuth.js";
import { supabase } from '../middleware/supabase_client.js';

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // so it doesnt make a temp file


// appends (n) based on how many exists in the dropbox with the same name AND same report type
async function getUniqueDropboxPath(fileName, reportType, dbx) {
    let baseName = fileName;
    let ext = '';
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1) {
        baseName = fileName.slice(0, dotIndex);
        ext = fileName.slice(dotIndex);
    }

    let uniqueName = baseName + ext;
    let counter = 1;

    const { data: dbFiles, error: dbErr } = await supabase
        .from('reports')
        .select('report_name')
        .eq('type', reportType);

    if (dbErr) {
        console.error("Supabase error:", dbErr);
    }

    const dbNames = dbFiles?.map(f => f.report_name) ?? [];

    async function dropboxExists(path) {
        try {
            await dbx.filesGetMetadata({ path: "/" + path });
            return true;
        } catch (e) {
            return false;
        }
    }

    while (dbNames.includes(uniqueName) || await dropboxExists(uniqueName)) {
        uniqueName = `${baseName} (${counter})${ext}`;
        counter++;
    }

    return uniqueName;
}



uploadRouter.post('/', upload.single("file"), async (req, res) => {
    let response;
    try {
        const upload_info = req.body;
        const file = req.file;
        const account = req.session.logged_user;

        if (!account) {
            return res.status(401).json({ success: false, message: "Please log in." });
        }

        const { data, error } = await supabase.from('sdws').select('sdw_id').eq('staff_info_id', account.id);
        if (error) throw error;
        
        const sdw_id = data?.[0]?.sdw_id;
        
        if (sdw_id == null) {
            return res.status(400).json({ success: false, message: "No SDW found" });
        }

        
        // Get unique filename with consideration of report type to avoid non-repeated names outside same type
        const uniqueName = await getUniqueDropboxPath(upload_info.report_name, upload_info.type, dbx);

        response = await dbx.filesUpload({
            path: "/" + uniqueName,
            contents: file.buffer,
            mode: { ".tag": "add" },
            autorename: true
        });

        try {
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            const { error: insertError } = await supabase.from('reports')
                .insert({ 
                    sdw_id: sdw_id,
                    report_name: response.result.name,
                    file_size: file.size,
                    upload_date: dateTime,
                    type: upload_info.type,
                    file_path: response.result.path_lower
                });
            
            if (insertError) throw insertError;

            res.json({ success: true, finalFileName: response.result.name });
        } catch(err) {
            console.error("ERROR: upload.js uploadRouter DB Operation " + err);
            res.status(500).json({ success: false, message: "Database operation failed" });
        }

    } catch(err) {
        console.error("ERROR: upload.js uploadRouter POST ", err);
        res.status(500).json({ success: false, message: "Upload failed" });
    }
});


export default uploadRouter;