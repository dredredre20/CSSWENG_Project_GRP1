import express from "express";
import fs from "fs";
import path from "path";
import { supabase } from "../middleware/supabase_client.js";
import { dbx } from "../middleware/dropboxAuth.js";

const downloadRouter = express.Router();

downloadRouter.get('/:report_id', async (req, res) => {
    const reportId = req.params.report_id;
    try{
        const {data: report, error: err1} = await supabase
            .from('reports')
            .select('file_path, report_name')
            .eq('report_id', reportId)
            .single()
        
        if(err1) throw err1;

        if(!report){
            return res.status(404).send("Report not found.");
        }

        const filePath = report.file_path;
        const fileName = report.report_name;

        try {
            const response = await dbx.filesDownload({ path: filePath });

            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", response.result.content_type || "application/octet-stream");
            res.send(response.result.fileBinary);

            console.log("Downloaded from Dropbox");
        } catch (err) {
            console.error(err);
        }
    } catch(err){
        res.status(500).send("Server error while downloading file.");
        console.error(err);
    }
});
export default downloadRouter;