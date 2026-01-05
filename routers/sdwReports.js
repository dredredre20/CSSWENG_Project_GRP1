import express from 'express';
import { supabase } from '../middleware/supabase_client.js';
import exceljs from 'exceljs';
import { dbx } from '../middleware/dropboxAuth.js';
import fs from 'fs';

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
    "Poverty Stoplight": "poverty_spotlight.xlsx",
    "CNF Candidates": "cnf_candidates.xlsx",
    "Retirement Candidates": "candidates_for_retirement.xlsx",
    "VM Accomplishments": "vm_accomplishements.xlsx",
    "Correspondence": "correspondence_accomplishment.xlsx",
    "Leaders Directory": "leaders_directory.xlsx",
};

// generate file using base template 
async function useTemplate(name, templateType){
    const workbook = new exceljs.Workbook();
    await workbook.xlsx.readFile(new URL(`../public/report_templates/${templateType}`, import.meta.url));
    const sheet = workbook.getWorksheet(name);
    workbook.xlsx.writeFile(`${name}.xlsx`);
    return await workbook.xlsx.writeBuffer();
}

async function uploadToDropbox(buffer, filename){
    return await dbx.filesUpload({
        path: `/${filename}`,
        contents: buffer,
        mode: { '.tag': 'add' },
        autorename: true
    });
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

        res.render('sdw_reports', {reports: reports, currentCategory: category, staff_type: account.staff_type, sdw_id: sdw_id, staff_name: sdw.first_name + " " + sdw.last_name, spu_id: sdw.spu_id});

    } catch (err){
        console.log(err);
        res.status(500).send('Server error.');
    } 
});

function deleteNewFile(filename){
        fs.unlink(filename, (err) =>{
            if(err){
                throw err;
            }
        }); //Delete local file after download
}

async function save(fileBuffer, filename, category, user_id){
        const response = await uploadToDropbox(fileBuffer, filename);
        const dropboxData = response.result;

        const {data: sdw} = await supabase
            .from('sdws')
            .select('sdw_id')
            .eq('staff_info_id', user_id)
            .single()
        
        if(sdw){
            await supabase.from('reports').insert({
                sdw_id: sdw.sdw_id,
                report_name: dropboxData.name,
                file_size: dropboxData.size,
                upload_date: new Date(),
                type: categoryOf[category],
                file_path: `${dropboxData.path_display}`
            });
        }
}

async function makeNewFile(category){
    //const for_url = category.replaceAll(" ", "%20");
    //await fetch(`/reports/${for_url}/template`);

    try{
        const categoryFile = templateMap[category];
        if(!categoryFile){
            return res.status(404).send('Template not found');
        }

        const fileBuffer = await useTemplate(category, categoryFile);
        const filename = `${category}.xlsx`;

        return {filename: filename, buffer: fileBuffer};
        
    } catch(err){
        console.log(err);
        res.status(500).send('Failed to generate template.');
    }

}

reportRouter.get('/:category/download', async( req, res) =>{
    try{

        const category = req.params.category; 

        const {filename, buffer} = await makeNewFile(category); //Make new file before downloading
        console.log("Making new file...");
        
        res.download(filename, (err) =>{
            if(err){
                throw err;
            }
            else{
                fs.unlink(filename, (errdel) =>{
                    if(errdel){
                        throw errdel;
                    }
                    else{
                        console.log("Deleted local file after download.");
                    }
                });
            }
        }); //Download new file then Delete local file right after

        console.log("Downloaded Successfully!");

        //res.redirect('/reports/' + category);
    }catch(err){
        console.log(err);
        res.status(500).send('Failed to download template.');
    }
    
});

reportRouter.post('/:category/rename', async (req, res) => {


    const category = req.params.category;
    const newfilename = req.body.newfilename;
    const {filename, fileBuffer} = await makeNewFile(category);
    console.log("Made New File...");
    await save(fileBuffer, newfilename, category, req.session.logged_user.id);
    deleteNewFile(filename);
    res.status(200).send('Renamed Successfully.');
    console.log("Going Back...");
    
});

reportRouter.get('/:category/template', async( req, res) =>{
    try{
        const category = req.params.category;
        const user_id = req.session.logged_user.id;
        console.log("Hello");
        const {filename, buffer} = await makeNewFile(category);
        await save(buffer, filename, category, user_id);
        deleteNewFile(`${category}.xlsx`);
        res.status(200).send('Template created successfully.');
        
    }catch(err){
        console.log(err);
        res.status(500).send('Failed to create template.')};
    }

);

reportRouter.post('/tempcopy', async( req, res) =>{

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