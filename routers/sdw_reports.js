import express from 'express';
import db_connection_pool from '../connections.js';

const reportRouter = express.Router();

reportRouter.get('/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const account = req.session.logged_user; // should contain staff_info
        const connection = await db_connection_pool.getConnection();

        let sdw_id_query = `SELECT sdw_id
                            FROM sdws s
                            JOIN staff_info si ON si.staff_info_id = s.
                            WHERE si.staff_id = ?`;
        const sdw_id = await connection.execute(sdw_id_query, [account.staff_id]);

        let reports_query = `SELECT r.report_id as id,
                                    r.report_name as name,
                                    r.file_path as path,
                                    r.file_size as size,
                                    r.upload_date as date,
                                    CONCAT(s.first_name, ' ', s.last_name) AS uploader
                             FROM reports r
                             JOIN sdws s ON r.sdw_id = s.sdw_id
                             WHERE r.sdw_id = ?
                             AND r.type = ?`;
        const [rows] = await connection.execute(reports_query, [sdw_id, report_type]); // access this as [rows],[fields]

        res.render('sdw_reports', { reports: rows, currentCategory: category });

    } catch (err){
        console.log(err);
        res.status(500).send('Server error from view_report.js');
    }
});

export default reportRouter;





