const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

// Login Page
app.get('/login', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Login Page</h1>
                <form action="/login" method="POST">
                    <input type="text" id="username" name="username" />
                    <input type="password" id="password" name="password" />
                    <button type="submit" id="login-btn">Login</button>
                </form>
            </body>
        </html>
    `);
});

// Handle Login
app.post('/login', (req, res) => {
    const { password } = req.body;
    
    // Simulate processing delay
    setTimeout(() => {
        if (password === 'wrongpass') {
            res.status(401).send('Login Failed');
        } else {
            res.redirect('/dashboard');
        }
    }, 500);
});

// Dashboard Page
app.get('/dashboard', (req, res) => {
    res.send(`
        <html>
            <body>
                <h1>Dashboard</h1>
                <a href="/success" id="target-link">Click Me</a>
            </body>
        </html>
    `);
});

// Success Page (target of the click)
app.get('/success', (req, res) => {
    res.send('<h1>Action Success</h1>');
});

module.exports = app;
