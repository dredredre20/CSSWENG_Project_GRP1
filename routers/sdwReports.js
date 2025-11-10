import express from 'express';
import db_connection_pool from '../connections.js';

const reportRouter = express.Router();
const supervisorSdwReportRouter = express.Router();

// Converted the category cases into a reusable helper function
function categoryOf(category){
        switch (category) {
            case "Upload Page":
                return -1;
            case "DSWD Annual Report":
                return 1;
            case "Community Profile":
                return 2;
            case "Target Vs ACC & SE":
                return 3;
            case "Caseload Masterlist":
                return 4;
            case "Education Profile":
                return 5;
            case "Assistance to Families":
                return 6;
            case "Poverty Stoplight":
                return 7;
            case "CNF Candidates":
                return 8;
            case "Retirement Candidates":
                return 9;
            case "VM Accomplishments":
                return 10;
            case "Correspondence":
                return 11;
            case "Leaders Directory":
                return 12;
            case "Logout":
                return -1;
            default:
                return 0; // fallback
        }
}

reportRouter.get('/:category', async (req, res) => {
    let connection;
    try {
        const category = req.params.category;

        const categoryId = categoryOf(category);
        
        if(categoryId === -1){
            return res.redirect('/home');
        }

        if(categoryId === -2){
            return res.redirect('/');
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
        const [sdw_rows] = await connection.execute(sdw_id_query, [account.id]);
        
        if (sdw_rows.length === 0) {
            console.log("No SDW found for staff_id:", account.id);
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
        res.render('sdw_reports', { reports: rows, currentCategory: category, staff_type: account.staff_type, sdw_id: sdw_id });

    } catch (err){
        console.log(err);
        res.status(500).send('Server error from view_report.js');
    } finally {
        connection.release();
    }
});

// for per report categories routing
supervisorSdwReportRouter.get('/report/:sdw_id/:category', async (req, res) => {
     let connection;
     try {
        const sdw_id = req.params.sdw_id;
        const category = req.params.category;

         const categoryId = categoryOf(category);
        
        if(categoryId == -1){
            return;
        }
        
        let account;
        if (req.session.logged_user){
            account = req.session.logged_user; // should contain staff_info
        } else {
            res.redirect('/login');
        }

        connection = await db_connection_pool.getConnection();

        let sdw_id_query = `SELECT sdw_id FROM sdws WHERE sdw_id = ?`;

        const [sdw_rows] = await connection.execute(sdw_id_query, [sdw_id]);
        
        if (sdw_rows.length === 0) {
            console.log("No SDW found for staff_id:", account.staff_id);
            return res.render('sdw_reports', { reports: [], currentCategory: category });
        }

        const id = sdw_rows[0].sdw_id;

        let reports_query = `SELECT r.report_id as id,
                                    r.report_name as name,
                                    r.file_size as size,
                                    r.upload_date as date,
                                    CONCAT(s.first_name, ' ', s.last_name) AS uploader
                             FROM reports r
                             JOIN sdws s ON r.sdw_id = s.sdw_id
                             WHERE r.sdw_id = ?
                             AND r.type = ?`;
        const [rows] = await connection.execute(reports_query, [id, categoryId]);
        console.log(rows);
        res.render('sdw_reports', { reports: rows, currentCategory: category, staff_type: account.staff_type, sdw_id: id});

    } catch (err){
        console.log(err);
        res.status(500).send('Server error from view_report.js');
    } finally {
        connection.release();
    }
});

export {reportRouter, supervisorSdwReportRouter};