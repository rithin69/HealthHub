const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;

const cors = require('cors');
const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true, // Enable credentials (cookies, authorization headers) cross-origin
  };

app.use(express.json());

app.use(cors(corsOptions));
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/send-email', async (req, res) => {
    console.log("hey hello")
    const { to, subject, text } = req.body;

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'healthhub75@gmail.com', // Your Gmail email address
                pass: 'mgco socz tfox yymm' // Your Gmail password
            }
        });

        const mailOptions = {
            from: 'healthhub75@gmail.com',
            to,
            subject,
            text
        };

        await transporter.sendMail(mailOptions);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
