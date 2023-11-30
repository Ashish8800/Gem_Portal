const express = require("express")
const cors = require('cors')
const app = express()
const fs = require('fs');

const getExcelFileKeywords = require('./helpers/getExcelFileKeywords')

// const emailsArray = process.env.EMAILS
const emailsArray = process.env.EMAILS || 'rahul@inevitableinfotech.com, vijay@inevitableinfotech.com, kumar@inevitableinfotech.com, manjunatha@inevitableinfotech.com, anurag@inevitableinfotech.com, arunabh80@inevitableinfotech.com'
// const emailsArray = 'anurag@inevitableinfotech.com'

app.use(cors())
app.use(express.json())

const Port = process.env.PORT || 5008

// const fileName = process.env.FILENAME;
const fileName = process.env.FILENAME || 'Keywords_KeyPhrases_25May2023.xlsx';
// const fileName = './Keywords_for_test.xlsx';

const bodyParser = require('body-parser');

// Middleware
app.use(bodyParser.json());

// Routes for user registration and login
app.use('/api/auth', require('./routes/auth'));

app.use('/api', require('./routes/search'));

// Start the server for run forever
app.listen(Port, () => {
    console.log(`Port Run in ${Port}`)
    if (!fs.existsSync("Daily_Bids")) {
        fs.mkdirSync("Daily_Bids")
    }
    if (!fs.existsSync("Searched_Bids")) {
        fs.mkdirSync("Searched_Bids")
    }
    getExcelFileKeywords(fileName, emailsArray, true)

})
