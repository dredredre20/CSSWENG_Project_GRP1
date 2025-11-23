// import db_connection_pool from "../connections.js";
import express from "express";
import { supabase } from "../middleware/supabase_client.js";
import { dbx } from "../middleware/dropboxAuth.js";

const deleteRouter = express.Router();

deleteRouter.delete('/:report_id', async (req, res) => {
    const reportId = req.params.report_id;

    try{
        const {data: rows, error: err1} = await supabase
            .from('reports')
            .select('file_path')
            .eq('report_id', reportId)

        if(err1) throw err1;

        if(rows.length === 0){
            return res.status(404).json({ error: "Report not found." });
        }

        const filePath = rows[0].file_path;
        try {
            await dbx.filesDeleteV2({ path: filePath });
            console.log("Deleted from Google Drive:", filePath);
        } catch(err){
            console.error(err);
        } finally{
            try{
                const {data: deleteReport, error: err2} = await supabase
                    .from('reports')
                    .delete()
                    .eq('report_id', reportId)

                if(err2) throw err2;

                res.json({ success: true, message: "Report deleted successfully." });
            } catch(err){
                console.error(err);
            }
        }

    } catch(err){
        res.status(500).json({ error: "Server error while deleting file." });
        console.error(err);
    }
});

export default deleteRouter;