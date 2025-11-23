//import db_connection_pool from "../connections.js";
import { supabase } from '../middleware/supabase_client.js';
import bcrypt from "bcrypt";
import express from "express";

const adminRouter = express.Router();

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

async function getSpus(admin_id){
    try {
        const { data: spus, error } = await supabase
            .from('spus_has_admins')
            .select('*')
            .eq('admins_admin_id', admin_id);

        if (error) throw error;

        return spus;
    } catch (err){
        console.error(err);
    }
}

adminRouter.get('/spu/:spu_type', async (req, res) => {
    try{
        const spu_type = req.params.spu_type;
        const {data: rows, error: err1} = await supabase
            .from('spus')
            .select('*')
            .eq('spu_name', spu_type)
            .single()
        
        if(err1) throw err1;

        const spuId = rows.spu_id;

        const {data: sdws, error: err2} = await supabase
            .from('sdws')
            .select('*')
            .eq('spu_id', spuId)
        
        if(err2) throw err2;
        
        res.render('admin_spu', {
           spuPage: null,
           sdws: sdws,
           user: 'user' 
        });

    } catch(err){
        console.error(err);
    }
});

adminRouter.get('/create', async (req, res) => {
    try {
        const { data: supervisors, error } = await supabase
            .from('supervisor')
            .select(`first_name, last_name, staff_info(staff_id)`);

        if (error) throw error;

        res.render('admin_createacc', {
            AdminName: 'admin',
            supervisors
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.post('/create', async (req, res) => {
    const { firstName, lastName, middleName, email, password, spuAssignedTo, typeRole } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    const role = typeRole.toLowerCase().trim();

    try{
        const {data: existingRows, error: err1} = await supabase
            .from('staff_info')
            .select('staff_id')
            .eq('email', email)
        
        if(err1) throw err1;

        if(existingRows.length > 0){
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }
        
        const {data: staffResult, error: err2} = await supabase
            .from('staff_info')
            .insert({
                staff_type: role,
                email: email,
                password: hashed
            })
            .select('*')
            .single()

        if(err2) throw err2

        const staffInfoId = staffResult.staff_id;

        const spuIdOf = {
            'AMP': 1,
            'FDQ': 2,
            'MPH': 3,
            'MS': 4
        }

        const spuId = spuIdOf[spuAssignedTo];

        switch(role){
            case "admin":
                const {data: adminInsert, error: err3} = await supabase
                    .from('admins')
                    .insert({
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: email,
                        staff_info_id: staffInfoId
                    })
                    .select('*')
                    .single()   
                
                if(err3) throw err3;

                const {data: adminSpuInsert, error: err4} = await supabase
                    .from('spus_has_admins')
                    .insert({
                        admins_admin_id: adminInsert.admin_id,
                        spus_spu_id: spuId
                    })
                
                if(err4) throw err4;
                
                break;
            case "supervisor":
                const {data: supervisorInsert, error: err5 } = await supabase
                    .from('supervisor')
                    .insert({
                        spu_id: spuId,
                        staff_info_id: staffInfoId,
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: email
                    })

                if(err5) throw err5;

                break;
            case "sdw":

                const {data: sdwInsert, error: err6 } = await supabase
                    .from('sdws')
                    .insert({
                        spu_id: spuId,
                        staff_info_id: staffInfoId,
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: email
                    })
                
                if(err6) throw err6;
                break;
            default:
                break;
        }
    
        res.status(201).json({ success: true, message: 'SDW created successfully.' });

    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating SDW.' });
    }
});

adminRouter.get('/edit/:staff_id', async (req, res) => {
    const staffId = req.params.staff_id;

    try{
        const {data: sdw, error: err1} = await supabase
            .from('sdws')
            .select('sdw_id, first_name, middle_name, last_name, email, spu_id')
            .eq('staff_info_id', staffId)
            .single()
        
        if(err1) throw err1;

        if(!sdw){
            return res.status(404).send("SDW not found.");
        }

        const spuMap = {
            1: "AMP",
            2: "FDQ",
            3: "MPH",
            4: "MS"
        };

        const row = sdw;
        const firstName = row.first_name || '';
        const middleName = row.middle_name || '';
        const lastName = row.last_name || '';
        const email = row.email || '';
        const spuId = row.spu_id || null;
        const spuName = spuMap[spuId];

        res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: { firstname: firstName, middlename: middleName, lastname: lastName, email, password: '' },
            spuName,
            staffId
        });
    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error editing SDW.' });
    }
});

adminRouter.post('/edit/:staff_id', async (req, res) => {
    const staff_id = parseInt(req.params.staff_id, 10);
    const { firstname, middlename = '', lastname, email, password, spu } = req.body;

    const spuMap = { 
        1: "AMP", 
        2: "FDQ", 
        3: "MPH", 
        4: "MS" 
    };

    // Validate required fields
    if (!firstname || !lastname || !email) {
        return res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: {
                firstname: firstname || '',
                middlename,
                lastname: lastname || '',
                email: email || '',
                password: ''
            },
            staffId: staff_id,
            spuName: spuMap[spu],
            message: 'Please fill in all required fields.'
        });
    }

    try{
        const {data: sdwData, error: err1} = await supabase
            .from('sdws')
            .update({                
                first_name: firstname,
                middle_name: middlename,
                last_name: lastname,
                email: email,
                spu_id: spu,
                supervisor_id: spu
            })
            .eq('staff_info_id', staff_id)
            .select()
        
        if(err1) throw err1;

        const updateInfo = {email };

        if(password){
            updateInfo.password = await bcrypt.hash(password, 10);
        }

        const {data: updatedSdw, error: err2} = await supabase
            .from('staff_info')
            .update(updateInfo)
            .eq('staff_id', staff_id)
            .select()

        if(err2) throw err2;

        res.json({ success: true, message: 'Account updated successfully!' });
    } catch(err){
        res.status(500).json({ success: false, message: 'Error editing SDW.' });
        console.error(err);
    }
});

adminRouter.delete('/delete/:staff_id', async (req, res) => {
    const staff_id = req.params.staff_id;
    try{

        const {data: sdwFetch, error: err1} = await supabase
            .from('sdws')
            .select('*')
            .eq('staff_info_id', staff_id)
            .single()

        if(err1) throw err1;

        if(!sdwFetch){
            return res.status(404).json({ success: false, message: 'SDW not found.' });
        }

        const {data: deleteReports, error: err2} = await supabase
            .from('reports')
            .delete()
            .eq('sdw_id', sdwFetch.sdw_id)
        
        if(err2) throw err2

        const {data: sdwDelete, error: err3} = await supabase
            .from('sdws')
            .delete()
            .eq('staff_info_id', staff_id)

        if (err3) throw err3;

        const {data: staffInfoDelete, error: err4} = await supabase
            .from('staff_info')
            .delete()
            .eq('staff_id', staff_id)

        if(err4) throw err4;

        res.status(200).json({ success: true, message: 'SDW deleted successfully' });

    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting SDW.' });
    }
});

adminRouter.get('/reports/:sdw_id/', async (req, res) => {
    const sdw_id = req.params.sdw_id;
    const admin = req.session.logged_user;
    try {
        const {data: sdwRow, error: err1} = await supabase
            .from('sdws')
            .select('first_name, last_name, sdw_id')
            .eq('sdw_id', sdw_id)
            .single();

        if(err1) throw err1;
        if(!sdwRow) return res.redirect('/admin');

        res.render('admin_reports', {
            sdw_id,
            sdw: sdwRow,
            admin
        });

    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.get('/reports/:sdw_id/:category', async (req, res) => {
    try{
        const sdw_id = req.params.sdw_id;
        const category = req.params.category;
        const categoryId = categoryOf(category);

        const {data: reports, error: err1} = await supabase
            .from('reports')
            .select('*')
            .eq('sdw_id', sdw_id)
            .eq('type', categoryId)
        
        if(err1) throw err1;

        res.render('admin_reports_folder', {
            reports: reports,
            currentCategory: category, 
            sdw_id : sdw_id
        });

    } catch(err){
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.get('/', async (req, res) => {
    try {
        const user = req.session.logged_user;

        if(!user || user.staff_type !== 'admin'){
            return res.redirect('/login');
        }

        const spus = await getSpus(user.id);

        res.render('admin_homepage', {
            user: user,
            spus: spus
        });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

export default adminRouter;