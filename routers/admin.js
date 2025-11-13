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

        await connection.execute(
        `INSERT INTO sdws (first_name, middle_name, last_name, email)
        VALUES (?, ?, ?, ?);`,
        [firstName, middleName, lastName, email]
        );

        await connection.execute(
        `INSERT INTO staff_info (staff_type, email, password)
        VALUES (?, ?);`,
        ['sdw', email, hashed]
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
            `SELECT sdw_id
             FROM sdws s JOIN staff_info si
             ON si.staff_id = s.staff_info_id
             WHERE staff_id = ?`,
            [staff_id]
        );

        const sdw_id = sdw_rows[0].sdw_id;

        const [sdws] = await connection.execute(
            `SELECT first_name, middle_name, last_name, email
             FROM sdws s
             WHERE sdw_id = ?`,
            [sdw_id]
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

        const { first_name: firstname, middle_name: middlename, last_name: lastname, email: email } = sdws[0];

        res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: { firstname, middlename, lastname, email, password: ''}
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
    const staff_id = req.params.staff_id;
    const { firstName, lastName, middleName, email, password } = req.body;
    let connection;

    try {
        connection = await db_connection_pool.getConnection();
        await connection.beginTransaction();

        const [sdw_rows] = await connection.execute(
            `SELECT sdw_id
             FROM sdws s 
             JOIN staff_info si ON si.staff_id = s.staff_info_id
             WHERE si.staff_id = ?`,
            [staff_id]
        );

        if (sdw_rows.length === 0) {
            console.warn(`No SDW found for staff_id ${staff_id}`);
            await connection.rollback();
            return res.status(404).render('error', { message: 'SDW record not found.' });
        }

        const sdw_id = sdw_rows[0].sdw_id;

        let hashed = null;
        if (password && password.trim() !== "") {
            hashed = await bcrypt.hash(password, 10);
        }

        await connection.execute(
            `UPDATE sdws
             SET first_name = ?, middle_name = ?, last_name = ?, email = ?
             WHERE sdw_id = ?`,
            [firstName, middleName, lastName, email, sdw_id]
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

        res.render('admin_editacc', {
            AdminName: 'Admin',
            sdw: { firstname: firstName, middlename: middleName, lastname: lastName, email, password: '' },
            message: 'Account updated successfully!'
        });

    } catch (err) {
        console.error('Error editing SDW:', err);
        if (connection) await connection.rollback();
        res.status(500).json({ success: false, message: 'Error editing SDW.' });
    } finally {
        if (connection) connection.release();
    }
});


adminRouter.get('/reports/', async (req, res) => {
    try {
        //temp values
        res.render('admin_reports', {
            admin: { first_name: 'Admin', last_name: 'User' },
            sdw: { first_name: 'John', last_name: 'Doe', sdw_id: 123 }
        });
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

        connection.release();
        res.render('admin_reports_folder', {
            reports: reports,
            currentCategory: category
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
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