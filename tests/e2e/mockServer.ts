import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

// Login Page
app.get('/login', (req: Request, res: Response) => {
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
app.post('/login', (req: Request, res: Response) => {
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
app.get('/dashboard', (req: Request, res: Response) => {
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
app.get('/success', (req: Request, res: Response) => {
    res.send('<h1>Action Success</h1>');
});

export default app;
