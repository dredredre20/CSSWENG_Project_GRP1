import express from 'express';
import { supabase } from '../middleware/supabase_client.js';

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

        const {data: sdw, error: err1} = await supabase
            .from('sdws')
            .select('sdw_id, first_name, last_name, spu_id')
            .eq('staff_info_id', account.id)
            .single();

        if(err1) throw err1;
        
        if (!sdw) {
            return res.render('sdw_reports', { reports: [], currentCategory: category });
        }

        const sdw_id = sdw.sdw_id;

        const {data: reports, error: err2} = await supabase
            .from('reports')
            .select(`
                report_id,
                report_name,
                file_size,
                upload_date
            `)
            .eq('sdw_id', sdw_id)
            .eq('type', categoryId);

        if(err2) throw err2;

        res.render('sdw_reports', {reports: reports, currentCategory: category, staff_type: account.staff_type, sdw_id: sdw_id, staff_name: sdw.first_name + " " + sdw.last_name, spu_id: sdw.spu_id });

    } catch (err){
        console.log(err);
        res.status(500).send('Server error.');
    }
});

// for per report categories routing
supervisorSdwReportRouter.get('/report/:sdw_id/:category', async (req, res) => {
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
        
        const {data: sdw, error: err1} = await supabase
            .from('sdws')
            .select('sdw_id, first_name, last_name, spu_id')
            .eq('sdw_id', sdw_id)
            .single()
        
        if(err1) throw err1;

        if (!sdw) {
            return res.render('supervisor_reports_folder', { reports: [], currentCategory: category });
        }

        const id = sdw.sdw_id;

        const { data: reports, error: err2 } = await supabase
            .from('reports')
            .select(`
                report_id,
                report_name,
                file_size,
                upload_date`)

            .eq('sdw_id', sdw_id)
            .eq('type', categoryId);

        if(err2) throw err2;

        res.render('supervisor_reports_folder', { reports: reports, currentCategory: category, staff_type: account.staff_type, sdw_id: sdw_id, staff_name: sdw.first_name + " " + sdw.last_name, spu_id: sdw.spu_id });

    } catch (err){
        console.log(err);
        res.status(500).send('Server error.');
    }
});

export {reportRouter, supervisorSdwReportRouter};