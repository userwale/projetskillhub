require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const admin = require('../src/routes/adminRoutes');
const cors = require('cors');
const app = express();

app.use(cors(
    {
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());


const db = process.env.MONGODB_URI;
console.log("Mongo URI:", db);

mongoose
    .connect(db)
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/admin', admin);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8071;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));

console.log('Loaded ADMIN_ACTIVATION_KEY:', process.env.ADMIN_ACTIVATION_KEY);
