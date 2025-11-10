import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// import routers
import loginRouter from './routers/login.js';
import logoutRouter from './routers/logout.js';
import registerRouter from './routers/register.js';
import homeRouter from './routers/home.js'
import {reportRouter, supervisorSdwReportRouter} from './routers/sdwReports.js';
import uploadRouter from './routers/upload.js';
import downloadRouter from './routers/download.js';
import sdwRouter from './routers/sdw.js';
import deleteRouter from './routers/delete.js';
import adminRouter from './routers/admin.js';

import { protectRoutes, redirectIfAuthenticated, requireRole } from './middleware/auth.js';

// dummy users
import insert_dummy_users from './seed_db.js';
import testing from './testing.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const ip = '74.220.52.12';

// CSS and static files
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.set('views', path.join(__dirname, 'views'));

// session middleware
app.use(session({
    secret: 'you_know_what',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // HTTP only
    }
}));

app.get('/', (req,res) => {
    res.redirect('/login');
});

// insert dummy users
testing();
//insert_dummy_users();



// Don't protect the logout route, so users can log out
app.use('/logout', logoutRouter);

// Apply global protection middleware to all routes
app.use(protectRoutes);

// Proper route handling with role type checking
app.use('/login', redirectIfAuthenticated, loginRouter);
app.use('/register', requireRole('admin'), registerRouter);
app.use('/home', homeRouter);
app.use('/reports', requireRole('sdw'), reportRouter);
app.use('/upload', requireRole('sdw'), uploadRouter);
app.use('/download', requireRole('sdw', 'supervisor'), downloadRouter);
app.use('/', requireRole('supervisor'), supervisorSdwReportRouter);
app.use('/delete', requireRole('sdw','supervisor', 'admin'), deleteRouter);
app.use('/', requireRole('supervisor'), sdwRouter); // This handles /sdw/:sdw_id
app.use('/admin', requireRole('admin'), adminRouter);

app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
});