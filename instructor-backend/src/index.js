const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const instructor = require('./routes/instructorRoutes');

require('dotenv').config();

const app = express();
require('dotenv').config();
const cors = require('cors');

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
console.log("Mongo URI:", db); // pour debug

mongoose
    .connect(db)
    .then(() => console.log('MongoDB successfully connected'))
    .catch(err => console.log(err));

// Routes
app.use('/api/instructor', instructor);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8072;

app.listen(port, () => console.log(`Server up and running on port ${port}!`));
