import db_connection_pool from "../connections.js";
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
    try {
        res.json({ success: true, message: 'Updated successfully' }); 
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
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