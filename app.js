import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import routers 
import loginRouter from './routers/login.js';
import registerRouter from './routers/register.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // EDIT: cnanged to 'view engine'
app.use(express.urlencoded({ extended: false}));
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res) => {
    res.redirect('/login');
});

// app.get('/login', (req, res) => {
//     res.render('login.ejs')
// });

// app.get('/register', (req, res) => {
//     res.render('register.ejs');
// });

// mount routers here
app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.listen(port, () => {
    console.log('Server is running on port 3000');
});
