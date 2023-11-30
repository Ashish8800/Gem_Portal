const express = require('express');
const router = express.Router();

const writeExcel = require('../helpers/writeExcel')

router.post("/search", async (req, res) => {
    const Keywords = req.body.keywords;
    const Emails = req.body.emails;
    const EndFromDate = req.body.endFromDate;
    const EndToDate = req.body.endToDate;
    const KeywordsArray = Keywords.split(",").map((keyword) => keyword.trim());
    
    // Use a Set to store unique keywords
    const uniqueKeywordsSet = new Set(KeywordsArray);
    
    // Convert the Set back to an array
    const uniqueKeywordsArray = [...uniqueKeywordsSet];
    
    uniqueKeywordsArray.sort(); // Sort the unique keywords in alphabetical order
    // Call the main Function to generate the excel file.
    // console.log("Keywords: ", uniqueKeywordsArray)
    writeExcel(uniqueKeywordsArray, Emails, false, EndFromDate, EndToDate);
    
    res.send("Process Start");
});


module.exports = router;
