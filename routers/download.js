import db_connection_pool from "../connections.js";
import express from "express";
import { dbx } from "../middleware/dropboxAuth.js";

const downloadRouter = express.Router();

downloadRouter.get('/:report_id', async (req, res) => {
    const reportId = req.params.report_id;
    let connection;

    try {
        connection = await db_connection_pool.getConnection();

        const [rows] = await connection.execute(
            "SELECT file_path, report_name FROM reports WHERE report_id = ?",
            [reportId]
        );

        if (rows.length === 0) {
            return res.status(404).send("Report not found.");
        }

        const filePath = rows[0].file_path; // this is now google drive id
        const fileName = rows[0].report_name; // includes the extension (.txt, .xlsx)

        try {
            const response = await dbx.filesDownload({ path: filePath });

            res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
            res.setHeader("Content-Type", response.result.content_type || "application/octet-stream");
            res.send(response.result.fileBinary);

            console.log("Downloaded from Google Drive");
        } catch (err) {
            console.error("Google Drive API Download Error: ",err);
        }

    } catch (err) {
        console.error("ERROR in downloadRouter:", err);
        res.status(500).send("Server error while downloading file.");
    } finally {
        if (connection) connection.release();
    }
});
export default downloadRouter;