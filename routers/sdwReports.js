import express from 'express';
import { supabase } from '../middleware/supabase_client.js';
import exceljs from 'exceljs';
import fs from 'fs';
import { cp } from 'node:fs/promises'

const reportRouter = express.Router();
const supervisorSdwReportRouter = express.Router();

// used dictionaries instead for cleaner code
const categoryOf = {
    "Upload Page": -1,
    "DSWD Annual Report": 1,
    "Community Profile": 2,
    "Target Vs ACC & SE": 3,
    "Caseload Masterlist": 4,
    "Education Profile": 5,
    "Assistance to Families": 6,
    "Poverty Stoplight": 7,
    "CNF Candidates": 8,
    "Retirement Candidates": 9,
    "VM Accomplishments": 10,
    "Correspondence": 11,
    "Leaders Directory": 12,
    "Logout": -1
};

const templateMap = {
    "DSWD Annual Report": "dswd_annual_report.xlsx",
    "Community Profile": "community_profile.xlsx",
    "Target Vs ACC & SE": "deliverables_targets_vs_acc_and_se.xlsx",
    "Caseload Masterlist": "caseload_masterlist.xlsx",
    "Education Profile": "educ_profile.xlsx",
    "Assistance to Families": "assistance_to_families.xlsx",
    "Poverty Stoplight": "poverty_stoplight.xlsx",
    "CNF Candidates": "cnf_candidates.xlsx",
    "Retirement Candidates": "candidates_for_retirement.xlsx",
    "VM Accomplishments": "vm_accomplishements.xlsx",
    "Correspondence": "correspondence_accomplishment.xlsx",
    "Leaders Directory": "leaders_directory.xlsx",
};

// generate file using base template 
async function useTemplate(name, templateType){
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(`/etc/secrets/${templateType}`);
    const sheet = workbook.getWorksheet(name);
    const filename = `${name}.xlsx`;
    await workbook.xlsx.writeFile(filename);
    return filename;
}

reportRouter.get('/:category', async (req, res) => {
    try {
        const category = req.params.category;

        const categoryId = categoryOf[category];
        
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

reportRouter.get('/:category/template', async (req, res) => {
    // serving duplicating base template file
    try{
        const category = req.params.category;
        const categoryFile = templateMap[category];

        if(!categoryFile){
            return res.status(404).send('Template not found');
        }

        const filename = await useTemplate(category, categoryFile);

        //const filePath = path.join('.','..', 'middleware', 'temp_storage', filename);
        await cp(filename, `temp_storage/${filename}`);
        //fs.copyFile(filename, `temp_storage/${filename}`);        
        res.download(filename);
    } catch(err){
        console.log(err);
        res.status(500).send('Failed to generate template.');
    }
});

// for per report categories routing
supervisorSdwReportRouter.get('/report/:sdw_id/:category', async (req, res) => {
     try {
        const sdw_id = req.params.sdw_id;
        const category = req.params.category;

         const categoryId = categoryOf[category];
        
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