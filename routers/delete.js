import db_connection_pool from "../connections.js";
import express from "express";
import { oauth2Client, drive } from "../middleware/googleAuth.js";

const deleteRouter = express.Router();

deleteRouter.delete('/:report_id', async (req, res) => {
    const reportId = req.params.report_id;
    let connection;

    try {
        connection = await db_connection_pool.getConnection();

        const [rows] = await connection.execute(
            "SELECT file_path FROM reports WHERE report_id = ?",
            [reportId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Report not found." });
        }

        const filePath = rows[0].file_path;
        try {
            await drive.files.delete({ fileId: filePath });
            console.log("Deleted from Google Drive:", filePath);

        } catch (err) {
            console.error("Google Drive Delete Error:", err.message);
        } finally {
            // Target file by id
            await connection.execute(
                "DELETE FROM reports WHERE report_id = ?",
                [reportId]
            );
            res.json({ success: true, message: "Report deleted successfully." });
        }

    } catch (err) {
        console.error("ERROR in deleteRouter:", err);
        res.status(500).json({ error: "Server error while deleting file." });
    } finally {
        if (connection) connection.release();
    }
});

export default deleteRouter;