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
import reportRouter from './routers/sdw_reports.js';
import uploadRouter from './routers/upload.js';
import downloadRouter from './routers/download.js';

// dummy users
import insert_dummy_users from './seed_db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

//CSS
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false}));
app.set('views', path.join(__dirname, 'views'));

//session middleware
app.use(session({
    secret: 'you_know_what',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false // HTTP only
    }
}))

app.get('/', (req,res) => {
    res.redirect('/login');
});


// insert dummy users
insert_dummy_users();

// mount routers
app.use(express.static(path.join(__dirname, 'public')));
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/home', homeRouter);
// app.use('/sdw_homepage', homeRouter); redundant if using /home
app.use('/reports', reportRouter);
app.use('/logout', logoutRouter);
app.use('/upload', uploadRouter);
app.use('/download', downloadRouter);

app.listen(port, () => {
    console.log('Server is running on http://localhost:3000');
});