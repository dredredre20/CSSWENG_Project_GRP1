import express from 'express';
import db_connection_pool from '../connections.js';

const reportRouter = express.Router();
const redirectRouter = express.Router();

reportRouter.get('/:category', async (req, res) => {
    let connection;
    try {
        const category = req.params.category;
        let categoryId;
        switch (category) {
            case "Upload Page":
                res.redirect('/home');
                categoryId = -1;
                break;
            case "DSWD Annual Report":
                categoryId = 1;
                break;
            case "Community Profile":
                categoryId = 2;
                break;
            case "Target Vs ACC & SE":
                categoryId = 3;
                break;
            case "Caseload Masterlist":
                categoryId = 4;
                break;
            case "Education Profile":
                categoryId = 5;
                break;
            case "Assistance to Families":
                categoryId = 6;
                break;
            case "Poverty Stoplight":
                categoryId = 7;
                break;
            case "CNF Candidates":
                categoryId = 8;
                break;
            case "Retirement Candidates":
                categoryId = 9;
                break;
            case "VM Accomplishments":
                categoryId = 10;
                break;
            case "Correspondence":
                categoryId = 11;
                break;
            case "Leaders Directory":
                categoryId = 12;
                break;
            case "Logout":
                res.redirect('/');
                categoryId = -1;
                break;
            default:
                    categoryId = 0; // fallback
        }
        
        if(categoryId == -1){
            return
        }
        
        let account;
        if (req.session.logged_user){
            account = req.session.logged_user; // should contain staff_info
        } else {
            res.redirect('/login');
        }

        

        connection = await db_connection_pool.getConnection();

        let sdw_id_query = `SELECT sdw_id
                            FROM sdws s
                            JOIN staff_info si ON si.staff_id = s.staff_info_id
                            WHERE si.staff_id = ?`;
        const [sdw_rows] = await connection.execute(sdw_id_query, [account.staff_id]);
        
        if (sdw_rows.length === 0) {
            console.log("No SDW found for staff_id:", account.staff_id);
            return res.render('sdw_reports', { reports: [], currentCategory: category });
        }

        const sdw_id = sdw_rows[0].sdw_id;

        let reports_query = `SELECT r.report_id as id,
                                    r.report_name as name,
                                    r.file_size as size,
                                    r.upload_date as date,
                                    CONCAT(s.first_name, ' ', s.last_name) AS uploader
                             FROM reports r
                             JOIN sdws s ON r.sdw_id = s.sdw_id
                             WHERE r.sdw_id = ?
                             AND r.type = ?`;
        const [rows] = await connection.execute(reports_query, [sdw_id, categoryId]);
        console.log(rows);
        res.render('sdw_reports', { reports: rows, currentCategory: category });

    } catch (err){
        console.log(err);
        res.status(500).send('Server error from view_report.js');
    } finally {
        connection.release();
    }
});

export default reportRouter;





