import db_connection_pool from "../connections.js";
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

async function getSpus(connection, admin_id){
    try{
        const [spus] = await connection.execute(
            `SELECT * FROM spus_has_admins WHERE admins_admin_id = ?`,
            [admin_id]
        );
        return spus;
    } catch(err){
        console.error('ERROR in home.js getSpus() function: ' + err);
    }
}

adminRouter.get('/spu/:spu_type', async (req, res) => {
    let connection;
    try {
        const spu_type = req.params.spu_type;
        connection = await db_connection_pool.getConnection();

        const [rows] = await connection.execute(
            'SELECT * FROM spus WHERE spu_name = ?',
            [spu_type]
        )

        const spu_id = rows[0].spu_id;

        const [sdws] = await connection.execute(
            'SELECT * FROM sdws where spu_id = ?',
            [spu_id]
        );

        await connection.release();
        
        res.render('admin_spu', {
            spuPage: null,
            sdws: sdws,
            user: 'user'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
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

    let connection;
    try {
        connection = await db_connection_pool.getConnection();

        await connection.beginTransaction();

        //check for existing same email
        const [existingRows] = await connection.execute(
            `SELECT staff_id FROM staff_info WHERE email = ?`,
            [email]
        );

        if (existingRows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email already exists.' });
        }

        const [staffResult] = await connection.execute(
            `INSERT INTO staff_info (staff_type, email, password)
             VALUES (?, ?, ?)`,
            ['sdw', email, hashed]
        );

        const staff_info_id = staffResult.insertId;

        let spu_id;
        if (spuAssignedTo === 'AMP') spu_id = 1;
        else if (spuAssignedTo === 'FDQ') spu_id = 2;
        else if (spuAssignedTo === 'MPH') spu_id = 3;
        else if (spuAssignedTo === 'MS') spu_id = 4;

        await connection.execute(
        `INSERT INTO sdws (first_name, middle_name, last_name, email, spu_id, supervisor_id, staff_info_id)
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [firstName, middleName, lastName, email, spu_id, spu_id, staff_info_id] // supervisor_id should always be the same as spu_id
        );

        await connection.commit();

        res.status(201).json({ success: true, message: 'SDW created successfully.' });

    } catch (err) {
        console.error('Error creating SDW:', err);
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: 'Error creating SDW.' });
    } finally {
        if (connection) connection.release();
    }
});

adminRouter.get('/edit/:staff_id', async (req, res) => {
    const staff_id = req.params.staff_id;

    let connection;
    try {
        connection = await db_connection_pool.getConnection();

        const [sdw_rows] = await connection.execute(
            `SELECT sdw_id, first_name, middle_name, last_name, email, spu_id
             FROM sdws
             WHERE staff_info_id = ?`,
            [staff_id]
        );

        /*const [admin_rows] = await connection.execute(
            `SELECT first_name, middle_name, last_name, email
             FROM admins a JOIN staff_info si
             ON a.staff_info_id = si.staff_id
             WHERE staff_id = ?`,
            [req.session.logged_user.staff_id]
        );*/
        // I cant get req.session.logged_user passed to this route

        //const { first_name: admin_firstname, last_name: admin_lastname } = admin_rows[0];

        //const fullName = admin_firstname + " " + admin_lastname;

        const spuMap = {
        1: "AMP",
        2: "FDQ",
        3: "MPH",
        4: "MS"
        };

        const row = sdw_rows[0] || {}; // default to empty object if no row
        const first_name = row.first_name || '';
        const middle_name = row.middle_name || '';
        const last_name = row.last_name || '';
        const email = row.email || '';
        const spu_id = row.spu_id || null;
        const spu_name = spuMap[spu_id];

        res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: { firstname: first_name, middlename: middle_name, lastname: last_name, email, password: '' },
            spu_name,
            staff_id
        });

    } catch (err) {
        console.error('Error editing SDW:', err);
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: 'Error editing SDW.' });
    } finally {
        if (connection) connection.release();
    }
});

adminRouter.post('/edit/:staff_id', async (req, res) => {
    const staff_id = parseInt(req.params.staff_id, 10);
    const body = req.body;
    const firstName = body.firstname;
    const middleName = body.middlename || '';
    const lastName = body.lastname;
    const email = body.email;
    const password = body.password;
    const spu = body.spu;
    const spuMap = {
        1: "AMP",
        2: "FDQ",
        3: "MPH",
        4: "MS"
        };

    if (!firstName || !lastName || !email || !password) {
        return res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: {
                firstname: firstName || '',
                middlename: middleName,
                lastname: lastName || '',
                email: email || '',
                password: ''
            },
            staff_id,
            spu_name: spuMap[spu],
            message: 'Please fill in all required fields.'
        });
    }

    let connection;

    try {
        connection = await db_connection_pool.getConnection();
        await connection.beginTransaction();

        const hashed = await bcrypt.hash(password, 10);

        await connection.execute(
            `UPDATE sdws
             SET first_name = ?, middle_name = ?, last_name = ?, email = ?, spu_id = ?
             WHERE staff_info_id = ?`,
            [firstName, middleName, lastName, email, spu, staff_id]
        );

        if (hashed) {
            await connection.execute(
                `UPDATE staff_info
                 SET email = ?, password = ?
                 WHERE staff_id = ?`,
                [email, hashed, staff_id]
            );
        } else {
            await connection.execute(
                `UPDATE staff_info
                 SET email = ?
                 WHERE staff_id = ?`,
                [email, staff_id]
            );
        }

        await connection.commit();

        const [updatedRows] = await connection.execute(
            `SELECT first_name, middle_name, last_name, email, spu_id
            FROM sdws WHERE staff_info_id = ?`,
            [staff_id]
        );

        

        const updatedSDW = updatedRows[0];

        res.json({ success: true, message: 'Account updated successfully!' });

    } catch (err) {
        console.error('Error editing SDW:', err);
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: 'Error editing SDW.' });
    } finally {
        if (connection) connection.release();
    }
});

adminRouter.get('/delete/:staff_id', async (req, res) => {
    const staff_id = req.params.staff_id;
    let connection;
    try {
        connection = await db_connection_pool.getConnection();

        await connection.execute(
        "DELETE FROM sdws WHERE staff_info_id = ?",
        [staff_id]
        );

        await connection.execute(
        "DELETE FROM staff_info WHERE staff_id = ?",
        [staff_id]
        );
        console.log('Sucessfully deleted sdw'); //temp, there should be smth displayed here
        res.redirect('/admin')

    } catch (err) {
        console.error('Error deleting SDW:', err);
        res.status(500).json({ success: false, message: 'Error deleting SDW.' });
    } finally {
        if (connection) connection.release();
    }
});

adminRouter.get('/reports/:sdw_id/', async (req, res) => {
    const sdw_id = req.params.sdw_id;
    try {
        res.render('admin_sdw_homepage', {sdw_id});
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.get('/reports/:sdw_id/:category', async (req, res) => {
    let connection
    try {
        connection = await db_connection_pool.getConnection();
        const sdw_id = req.params.sdw_id;
        const category = req.params.category;
        const categoryId = categoryOf(category);

        const [reports] = await connection.execute(
            "SELECT * FROM reports WHERE sdw_id = ? AND type = ?",
            [sdw_id,categoryId] // report type is 1 for now
        );
        res.render('admin_reports_folder', {
            reports: reports,
            currentCategory: category
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    } finally {
        if (connection) connection.release();
    }
});

adminRouter.get('/', async (req, res) => {
    try {
        const connection = await db_connection_pool.getConnection();
        const user = req.session.logged_user;

        if(!user || user.staff_type !== 'admin'){
            return res.redirect('/login');
        }

        const spus = await getSpus(connection, user.id);
        await connection.release();

        res.render('admin_homepage', {
            user: user,
            spus: spus
        });
    } catch (err) {
        console.error("Error in adminRouter.get(): ", err);
        res.redirect('/login');
    }
});

export default adminRouter;