import db_connection_pool from "../connections.js";
import express from "express";
import fs from "fs";
import path from "path";
import { oauth2Client, drive } from "../services/googleAuth.js";

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

        //if (!fs.existsSync(filePath)) {
        //    return res.status(404).send("File not found on server.");
        //}
        // res.download(path.resolve(filePath), fileName); OLD local method

        try {
            const response = await drive.files.get({
                fileId: filePath,
                alt: 'media',
            }, { responseType: "stream" });

            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${fileName}"`
            );
            response.data.pipe(res);

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