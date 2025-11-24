import express from "express";
import multer from "multer";
import { dbx } from "../middleware/dropboxAuth.js";
import { supabase } from '../middleware/supabase_client.js';

const uploadRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // so it doesnt make a temp file

// appends (n) based on how many exists in the dropbox with the same name AND same report type
async function getUniqueDropboxPath(fileName, reportType) {
    let baseName = fileName;
    let ext = '';
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex !== -1) {
        baseName = fileName.slice(0, dotIndex);
        ext = fileName.slice(dotIndex);
    }

    let uniqueName = baseName + ext; // Start with original name
    let counter = 1;

    // First, check if this exact filename already exists for this report type in database
    const { data: existingFiles, error } = await supabase
        .from('reports')
        .select('report_name')
        .eq('type', reportType)
        .like('report_name', `${baseName}%`); 

    if (error) {
        console.error("Error checking existing files:", error);
        return uniqueName; // Return original name if error
    }

    // Extract just the base names without extensions for comparison
    const existingBaseNames = existingFiles.map(file => {
        const fileDotIndex = file.report_name.lastIndexOf('.');
        return fileDotIndex !== -1 ? file.report_name.slice(0, fileDotIndex) : file.report_name;
    });

    // Check if original name exists
    if (existingBaseNames.includes(baseName)) {
        // Find the highest number already used
        const pattern = new RegExp(`^${baseName} \\((\\d+)\\)$`);
        let maxNumber = 0;
        
        existingBaseNames.forEach(name => {
            const match = name.match(pattern);
            if (match && match[1]) {
                const num = parseInt(match[1]);
                if (num > maxNumber) maxNumber = num;
            }
        });

        counter = maxNumber + 1;
        uniqueName = `${baseName} (${counter})${ext}`;
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
        const uniqueName = await getUniqueDropboxPath(upload_info.report_name, upload_info.type);
        const dropboxPath = `/${uniqueName}`;

        // Upload to Dropbox
        response = await dbx.filesUpload({
            path: dropboxPath,
            contents: file.buffer,
            mode: { ".tag": "add" }
        });

        // Insert into database
        try {
            const now = new Date();
            const dateTime = now.toISOString().slice(0, 19).replace("T", " ");

            const { error: insertError } = await supabase.from('reports')
                .insert({ 
                    sdw_id: sdw_id,
                    report_name: uniqueName, 
                    file_size: file.size,
                    upload_date: dateTime,
                    type: upload_info.type,
                    file_path: response.result.id
                });
            
            if (insertError) throw insertError;

            res.json({ success: true, finalFileName: uniqueName });
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