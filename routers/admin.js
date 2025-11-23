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
    // try{
    //     const [spus] = await connection.execute(
    //         `SELECT * FROM spus_has_admins WHERE admins_admin_id = ?`,
    //         [admin_id]
    //     );
    //     return spus;
    // } catch(err){
    //     console.error('ERROR in home.js getSpus() function: ' + err);
    // }
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
    // let connection;
    // try {
    //     const spu_type = req.params.spu_type;
    //     connection = await db_connection_pool.getConnection();

    //     const [rows] = await connection.execute(
    //         'SELECT * FROM spus WHERE spu_name = ?',
    //         [spu_type]
    //     )

    //     const spu_id = rows[0].spu_id;

    //     const [sdws] = await connection.execute(
    //         'SELECT * FROM sdws where spu_id = ?',
    //         [spu_id]
    //     );

    //     if(connection) connection.release();
        
    //     res.render('admin_spu', {
    //         spuPage: null,
    //         sdws: sdws,
    //         user: 'user'
    //     });
    // } catch (err) {
    //     console.error(err);
    //     res.redirect('/admin');
    // }
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
        res.render('admin_createacc', {
            AdminName: 'admin'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.post('/create', async (req, res) => {
    const { firstName, lastName, middleName, email, password, spuAssignedTo } = req.body;
    const hashed = await bcrypt.hash(password, 10);

    // let connection;
    // try {
    //     connection = await db_connection_pool.getConnection();

    //     await connection.beginTransaction();

    //     //check for existing same email
    //     const [existingRows] = await connection.execute(
    //         `SELECT staff_id FROM staff_info WHERE email = ?`,
    //         [email]
    //     );

    //     if (existingRows.length > 0) {
    //         return res.status(400).json({ success: false, message: 'Email already exists.' });
    //     }

    //     const [staffResult] = await connection.execute(
    //         `INSERT INTO staff_info (staff_type, email, password)
    //          VALUES (?, ?, ?)`,
    //         ['sdw', email, hashed]
    //     );

    //     const staff_info_id = staffResult.insertId;

    //     let spu_id;
    //     if (spuAssignedTo === 'AMP') spu_id = 1;
    //     else if (spuAssignedTo === 'FDQ') spu_id = 2;
    //     else if (spuAssignedTo === 'MPH') spu_id = 3;
    //     else if (spuAssignedTo === 'MS') spu_id = 4;

    //     await connection.execute(
    //     `INSERT INTO sdws (first_name, middle_name, last_name, email, spu_id, supervisor_id, staff_info_id)
    //     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    //     [firstName, middleName, lastName, email, spu_id, spu_id, staff_info_id] // supervisor_id should always be the same as spu_id
    //     );

    //     await connection.commit();

    //     res.status(201).json({ success: true, message: 'SDW created successfully.' });

    // } catch (err) {
    //     console.error('Error creating SDW:', err);
    //     if (connection) await connection.rollback();
    //     res.status(500).json({ success: false, message: 'Error creating SDW.' });
    // } finally {
    //     if (connection) connection.release();
    // }

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
            .insert([{
                staff_type: 'sdw',
                email: email,
                password: hashed
                }])
            .select('staff_id')
            .single()

        const staffInfoId = staffResult.staff_id;

        const spuIdOf = {
            'AMP': 1,
            'FDQ': 2,
            'MPH': 3,
            'MS': 4
        }

        const spuId = spuIdOf[spuAssignedTo];

        const {data: sdwInsert, error: err3} = await supabase
            .from('sdws')
            .insert([{
                first_name: firstName,
                middle_name: middleName,
                last_name: lastName,
                email: email,
                spu_id: spuId,
                supervisor_id: spuId,
                staff_info_id: staffInfoId
            }])
        
        if(err3) throw err3;
    
        res.status(201).json({ success: true, message: 'SDW created successfully.' });

    } catch(err){
        console.error(err);
        res.status(500).json({ success: false, message: 'Error creating SDW.' });
    }
});

adminRouter.get('/edit/:staff_id', async (req, res) => {
    const staffId = req.params.staff_id;

    // let connection;
    // try {
    //     connection = await db_connection_pool.getConnection();

    //     const [sdw_rows] = await connection.execute(
    //         `SELECT sdw_id, first_name, middle_name, last_name, email, spu_id
    //          FROM sdws
    //          WHERE staff_info_id = ?`,
    //         [staff_id] 
    //     );

    //     /*const [admin_rows] = await connection.execute(
    //         `SELECT first_name, middle_name, last_name, email
    //          FROM admins a JOIN staff_info si
    //          ON a.staff_info_id = si.staff_id
    //          WHERE staff_id = ?`,
    //         [req.session.logged_user.staff_id]
    //     );*/
    //     // I cant get req.session.logged_user passed to this route

    //     //const { first_name: admin_firstname, last_name: admin_lastname } = admin_rows[0];

    //     //const fullName = admin_firstname + " " + admin_lastname;

    //     const spuMap = {
    //     1: "AMP",
    //     2: "FDQ",
    //     3: "MPH",
    //     4: "MS"
    //     };

    //     const row = sdw_rows[0] || {}; // default to empty object if no row
    //     const first_name = row.first_name || '';
    //     const middle_name = row.middle_name || '';
    //     const last_name = row.last_name || '';
    //     const email = row.email || '';
    //     const spu_id = row.spu_id || null;
    //     const spu_name = spuMap[spu_id];

    //     res.render('admin_editacc', {
    //         AdminName: 'Admin',
    //         sdw: { firstname: first_name, middlename: middle_name, lastname: last_name, email, password: '' },
    //         spu_name,
    //         staff_id
    //     });

    // } catch (err) {
    //     console.error('Error editing SDW:', err);
    //     if (connection) await connection.rollback();
    //     res.status(500).json({ success: false, message: 'Error editing SDW.' });
    // } finally {
    //     if (connection) connection.release();
    // }

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
    // const staff_id = parseInt(req.params.staff_id, 10);
    // const body = req.body;
    // const firstName = body.firstname;
    // const middleName = body.middlename || '';
    // const lastName = body.lastname;
    // const email = body.email;
    // const password = body.password;
    // const spu = body.spu;
    // const spuMap = {
    //     1: "AMP",
    //     2: "FDQ",
    //     3: "MPH",
    //     4: "MS"
    //     };
    
    // // Removed password validation for optional change
    // if (!firstName || !lastName || !email) {
    //     return res.render('admin_editacc', {
    //         AdminName: 'Admin',
    //         sdw: {
    //             firstname: firstName || '',
    //             middlename: middleName,
    //             lastname: lastName || '',
    //             email: email || '',
    //             password: ''
    //         },
    //         staff_id,
    //         spu_name: spuMap[spu],
    //         message: 'Please fill in all required fields.'
    //     });
    // }

    // let connection;

    // try {
    //     connection = await db_connection_pool.getConnection();
    //     await connection.beginTransaction();

    //     await connection.execute(
    //         `UPDATE sdws
    //          SET first_name = ?, middle_name = ?, last_name = ?, email = ?, spu_id = ?, supervisor_id = ?
    //          WHERE staff_info_id = ?`,
    //         [firstName, middleName, lastName, email, spu, spu, staff_id]
    //     );

    //     if (password) {
    //         const hashed = await bcrypt.hash(password, 10);
    //         await connection.execute(
    //             `UPDATE staff_info
    //              SET email = ?, password = ?
    //              WHERE staff_id = ?`,
    //             [email, hashed, staff_id]
    //         );
    //     } else {
    //         await connection.execute(
    //             `UPDATE staff_info
    //              SET email = ?
    //              WHERE staff_id = ?`,
    //             [email, staff_id]
    //         );
    //     }

    //     await connection.commit();

    //     const [updatedRows] = await connection.execute(
    //         `SELECT first_name, middle_name, last_name, email, spu_id
    //         FROM sdws WHERE staff_info_id = ?`,
    //         [staff_id]
    //     );

    //     const updatedSDW = updatedRows[0];

    //     res.json({ success: true, message: 'Account updated successfully!' });

    // } catch (err) {
    //     console.error('Error editing SDW:', err);
    //     if (connection) await connection.rollback();
    //     res.status(500).json({ success: false, message: 'Error editing SDW.' });
    // } finally {
    //     if (connection) connection.release();
    // }
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
    // let connection;
    // try {
    //     connection = await db_connection_pool.getConnection();

    //     await connection.execute(
    //         "DELETE FROM sdws WHERE staff_info_id = ?",
    //         [staff_id]
    //     );

    //     await connection.execute(
    //         "DELETE FROM staff_info WHERE staff_id = ?",
    //         [staff_id]
    //     );

    //     // Fetch the record of the SDW first to map the staff_info id into sdw_id
    //     const [sdw] = await connection.execute(
    //         "SELECT * FROM sdws WHERE staff_info_id = ?",
    //         [staff_id]
    //     )

    //     // Use the sdw_id of the record as the reference for reports
    //     await connection.execute(
    //         "DELETE FROM reports WHERE sdw_id = ?",
    //         [sdw.sdw_id]
    //     );

    //     console.log('Sucessfully deleted sdw'); //temp, there should be smth displayed here

    //     res.status(200).json({ success: true, message: 'SDW deleted successfully' });

    // } catch (err) {
    //     console.error('Error deleting SDW:', err);
    //     res.status(500).json({ success: false, message: 'Error deleting SDW.' });
    // } finally {
    //     if (connection) connection.release();
    // }
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
    // let connection;
    
    // try {
    //     connection = await db_connection_pool.getConnection();
        
    //     // Fetch SDW details
    //     const [sdw_rows] = await connection.execute(
    //         `SELECT first_name, last_name, sdw_id 
    //          FROM sdws 
    //          WHERE sdw_id = ?`,
    //         [sdw_id]
    //     );
        
    //     if (sdw_rows.length === 0) {
    //         return res.redirect('/admin');
    //     }
        
    //     const sdw = sdw_rows[0];
        
    //     res.render('admin_reports', {
    //         sdw_id: sdw_id, 
    //         sdw: sdw,      // Pass the full SDW object
    //         admin: admin 
    //     });
    // } catch (err) {
    //     console.error(err);
    //     res.redirect('/admin');
    // } finally {
    //     if (connection) connection.release();
    // }
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
    // let connection
    // try {
    //     connection = await db_connection_pool.getConnection();
    //     const sdw_id = req.params.sdw_id;
    //     const category = req.params.category;
    //     const categoryId = categoryOf(category);

    //     const [reports] = await connection.execute(
    //         "SELECT * FROM reports WHERE sdw_id = ? AND type = ?",
    //         [sdw_id,categoryId] // report type is 1 for now
    //     );
    //     res.render('admin_reports_folder', {
    //         reports: reports,
    //         currentCategory: category, 
    //         sdw_id : sdw_id
    //     });
    // } catch (err) {
    //     console.error(err);
    //     res.redirect('/admin');
    // } finally {
    //     if (connection) connection.release();
    // }
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