import express from 'express';

const app = express();
const port = 3000;

app.set('view-engine', 'ejs');
app.use(express.urlencoded({ extended: false}));

app.get('/', (req,res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login.ejs')
});

app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.listen(port, () => {
    console.log('Server is running on port 3000');
});
