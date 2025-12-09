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

async function getAccountInfo(staff_id){
    try{
        const {data: accountInfo, error: err1} = await supabase
            .from('staff_info')
            .select('*')
            .eq('staff_id', staff_id)
            .single()
        
        if(err1) throw err1;

        if(!accountInfo){
            return null;
        }

        return accountInfo;

    } catch(err){
        console.error(err);
    }
}

// initiator -> edits/deletes (modifies) -> target
async function canModify(initiator, target){
    const masterEmail = "manila_programdept@intl.unbound.org"; // change this accordingly

    // If target for modification is the master admin, reject it
    if(target.email === masterEmail){
        return false;
    }

    // If the initiator of the modification is the master admin, accept
    if(initiator.email === masterEmail){
        return true;        
    }

    // If the initiator of the modification is a regular admin
    if(initiator.staff_type === "admin"){
        // Only accept if the target is not another admin
        return target.staff_type !== "admin";
    }

    // Anyone else cannot modify anyone
    return false;
}

adminRouter.get('/adminlist', async (req, res) => {
    try{
        const {data: admins_List, error: err1} = await supabase.from('admins').select('*');
        if(err1) throw err1;
        //console.log(admins_List)
        res.render('admin_adminlist', {
            admins:admins_List,

        });
    }catch(err){
        console.error(err);
    }
});



adminRouter.get('/spu/:spu_type', async (req, res) => {
  try {
    const spu_type = req.params.spu_type;

    const { data: spuRow, error: err1 } = await supabase
      .from('spus')
      .select('*')
      .eq('spu_name', spu_type)
      .single();
    if (err1) throw err1;

    const spuId = spuRow.spu_id;

    const { data: sdws, error: err2 } = await supabase
      .from('sdws')
      .select('*')
      .eq('spu_id', spuId);
    if (err2) throw err2;

    // request the spu row with nested supervisor relation, ensure single row
    const { data: spuWithSupervisor, error: err3 } = await supabase
      .from('spus')
      .select('supervisor(*)')
      .eq('spu_id', spuId)
      .single();
    if (err3) throw err3;

    // spuWithSupervisor.supervisor can be an array (PostgREST returns nested arrays)
    let supervisor;
    const nested = spuWithSupervisor?.supervisor;

    // if no supervisor assigned, or empty array, use the default value
    if (!nested || (Array.isArray(nested) && nested.length === 0)) {
      supervisor = { first_name: 'Unassigned', last_name: null };
    } else { //return first element if array
      supervisor = Array.isArray(nested) ? nested[0] : nested;
    }

    const spuNameOf = { 1: 'AMP', 2: 'FDQ', 3: 'MPH', 4: 'MS' };
    const spuName = spuNameOf[spuId];

    res.render('admin_spu', {
      spuPage: spuName,
      sdws,
      supervisor
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});




adminRouter.get('/create', async (req, res) => {
    try {
        const { data: admin, error } = await supabase
            .from('admins')
            .select(`first_name, last_name`);

        if (error) throw error;

        res.render('admin_createacc', {
            admin
            //supervisors
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
        //console.log(spuId);

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
                        staff_info_id: staffInfoId,
                        first_name: firstName,
                        middle_name: middleName,
                        last_name: lastName,
                        email: email
                    }).select('*').single();

                if(err5) throw err5;

                const { data: existingSpu, error: err8 } = await supabase
                    .from('spus')
                    .select('supervisor_id')
                    .eq('spu_id', spuId)
                    .single();

                if (err8) throw err8;

                if (!existingSpu) {
                    return res.status(400).json({ success: false, message: 'SPU not found.' });
                }

                if (existingSpu.supervisor_id) {
                    return res.status(400).json({ success: false, message: 'A supervisor is already assigned.' });
                }


                const {data: spuUpdate, error: err7 } = await supabase
                    .from('spus')
                    .update({
                        supervisor_id: supervisorInsert.supervisor_id //supervisors auto incremented id
                    })
                    .eq('spu_id', spuId)

                if(err7) throw err7;
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
    const staff_id = req.params.staff_id;

    try{
        const account = await getAccountInfo(staff_id);
        //console.log(account)
        if (!account) return res.status(404).send("User not found.");

        const spuMap = {
            1: "AMP",
            2: "FDQ",
            3: "MPH",
            4: "MS"
        };
        let row;
        switch(account.staff_type){
            case 'admin':
                const {data: admin, error: err2} = await supabase
                    .from('admins')
                    .select('admin_id, first_name, middle_name, last_name, email')
                    .eq('staff_info_id', staff_id)
                    .single()
                
                if(err2) throw err2;

                if(!admin){
                    return res.status(404).send("Admin not found.");
                }
                row = admin
                break;

            case 'supervisor':
                const {data: supervisor, error: err3} = await supabase
                    .from('supervisor')
                    .select('supervisor_id, first_name, middle_name, last_name, email')
                    .eq('staff_info_id', staff_id)
                    .single()
                
                if(err3) throw err3;

                if(!supervisor){
                    return res.status(404).send("Supervisor not found.");
                }
                row = supervisor
                break;

            case 'sdw':
                const {data: sdw, error: err1} = await supabase
                    .from('sdws')
                    .select('sdw_id, first_name, middle_name, last_name, email')
                    .eq('staff_info_id', staff_id)
                    .single()
                
                if(err1) throw err1;

                if(!sdw){
                    return res.status(404).send("SDW not found.");
                }
                row = sdw;
                break;
        }
                

                const first_name = row.first_name || '';
                const middle_name = row.middle_name || '';
                const last_name = row.last_name || '';
                const email = row.email || '';

                res.render('admin_editacc', {
                    AdminName: '',
                    sdw: { firstname: first_name, middlename: middle_name, lastname: last_name, email, password: '' },
                    staff_id
                });
    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error editing account.' });
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
        const initiator = req.session.logged_user;
        const target= await getAccountInfo(staff_id);

        if(!target){
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if(!await canModify(initiator, target)){
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        switch(target.staff_type){
            case 'admin':
                const {data: adminData, error: err2} = await supabase
                .from('admins')
                .update({                
                    first_name: firstname,
                    middle_name: middlename,
                    last_name: lastname,
                    email: email,

                })
                .eq('staff_info_id', staff_id)
                .select()
            
                if(err2) throw err2;
                break;

            case 'supervisor':
                const {data: supervisorData, error: err3} = await supabase
                .from('supervisor')
                .update({                
                    first_name: firstname,
                    middle_name: middlename,
                    last_name: lastname,
                    email: email,

                })
                .eq('staff_info_id', staff_id)
                .select()
            
                if(err3) throw err3;
                break;
                
            case 'sdw':
                const {data: sdwData, error: err1} = await supabase
                .from('sdws')
                .update({                
                    first_name: firstname,
                    middle_name: middlename,
                    last_name: lastname,
                    email: email,
                })
                .eq('staff_info_id', staff_id)
                .select()
            
                if(err1) throw err1;
                break;
        }

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
    const userInSession = req.session.logged_user;
    const staff_id = req.params.staff_id;
    try{
        const accountInfo = await getAccountInfo(staff_id);

        if(!await canModify(userInSession, accountInfo)){
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }

        switch(accountInfo.staff_type){
            case "admin":
                const {data: adminToDelete, error: err1} = await supabase
                    .from('admins')
                    .delete()
                    .eq('staff_info_id', staff_id)

                if(err1) throw err1;
                break;
            case "supervisor":
                const {data: supervisorToDelete, error: err3} = await supabase
                    .from('supervisor')
                    .delete() 
                    .eq('staff_info_id', staff_id)
                
                if(err3) throw err3;
                break;
            case "sdw":
                const { data: sdwFetch, error: err4 } = await supabase
                    .from('sdws')
                    .select('*')
                    .eq('staff_info_id', staff_id)
                    .single();

                if(err4) throw err4;

                const {data: deleteReports, error: err5} = await supabase
                    .from('reports')
                    .delete()
                    .eq('sdw_id', sdwFetch.sdw_id)
                
                if(err5) throw err5;

                const {data: sdwDelete, error: err6} = await supabase
                    .from('sdws')
                    .delete()
                    .eq('staff_info_id', staff_id)

                if (err6) throw err6;
                break;
        }

        const {data: userToDelete, error: err7} = await supabase
            .from('staff_info')
            .delete()
            .eq('staff_id', staff_id)

        if(err7) throw err7;

        res.status(200).json({ success: true, message: 'User Deleted Successfully' });

    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error Deleting User.' });
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