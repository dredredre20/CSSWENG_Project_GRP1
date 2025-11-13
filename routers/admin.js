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

adminRouter.get('/spu/:spu_type', async (req, res) => {
    const spu_type = req.params.spu_type;
    let connection;
    try {
        connection = await db_connection_pool.getConnection();
        /*const [query1] = await connection.execute(
            "SELECT supervisor_id FROM spus WHERE spu_name = ?",
            [spu_type]
        );

        const sp_id = query1[0].supervisor_id

        const [sdws] = await connection.execute(
            "SELECT * FROM sdws WHERE supervisors_supervisor_id = ?",
            [sp_id]
        );*/
        connection.release();
        res.render('admin_spu', {
            spuPage: null,
            sdws: null,
            user: 'user'
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

adminRouter.get('/edit/:edit_sdw_id', async (req, res) => {
    const edit_sdw_id = req.params.edit_sdw_id;
    try {
        res.render('admin_editacc');
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

// for now this doesnt work until the create staff post logic is done
adminRouter.get('/edit/:staff_id', async (req, res) => {
    const staff_id = req.params.staff_id;
    try {
        res.render('admin_editacc', {
            AdminName: 'admin',
            sdw: { firstname: 'John', lastname: 'Doe' }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
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
export default adminRouter;