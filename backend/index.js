const { default: axios } = require("axios")
const express = require("express")
const cors = require('cors')
const app = express()
const ExcelJS = require('exceljs');
const cron = require('node-cron');
const nodemailer = require('nodemailer')
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Port = process.env.PORT || 5008
global.nullBidsKeys = [];
global.searchKeywords = [];
global.emailsArray = process.env.EMAILS || 'rahul@inevitableinfotech.com, vijay@inevitableinfotech.com, kumar@inevitableinfotech.com, manjunatha@inevitableinfotech.com, anurag@inevitableinfotech.com, arunabh80@inevitableinfotech.com'
// global.emailsArray = 'anurag@inevitableinfotech.com'
//global.emailsArray = 'rahul@inevitableinfotech.com, anurag@inevitableinfotech.com'
var dailyEmailJob = null;
app.use(cors())
app.use(express.json())
global.fileName = process.env.FILENAME || './Keywords_KeyPhrases_25May2023.xlsx';
// global.fileName = './Keywords_for_test.xlsx';
const { MongoClient } = require('mongodb');
// const uri = 'mongodb://inviDbAdmin:AdminInviMongoDb123@localhost:27017/bids_database?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false'; // Replace with your MongoDB connection string
//const uri = process.env.MONGODB || 'mongodb://localhost:27017/bids_database?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false'; // Replace with your MongoDB connection string
const uri = process.env.MONGODB || 'mongodb://0.0.0.0:27017/bids_database'
const client = new MongoClient(uri);
// try {
//     client.connect();
//     console.log('Connected to the MongoDB database');
// } catch (error) {
//     console.error('Error connecting to the MongoDB database:', error);
// }
const db = client.db();
const main_collection = db.collection('GeM_All_Bids');

async function checkDatabaseConnection() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log('Connected to the MongoDB database');
    } catch (error) {
        console.error('Error connecting to the MongoDB database:', error);
    } finally {
        await client.close();
    }
}

// Call the function to check the database connection
checkDatabaseConnection();


app.post("/test", async (req, res) => {
    const Keywords = req.body.keywords
    const Emails = req.body.emails
    const EndFromDate = req.body.endFromDate
    const EndToDate = req.body.endToDate
    const KeywordsArray = Keywords.split(",").map((keyword) => keyword.trim()); // Split and trim the keywords
    KeywordsArray.sort(); // Sort the keywords in alphabetical order
    // Call the main Function to generate the excel file.
    writeExcel(KeywordsArray, Emails, false, EndFromDate, EndToDate);        // Function call to search bids
    res.send("Process Start")
})

async function getExcelFileKeywords(filename, isDailyJob = true) {
    global.searchKeywords = []
    global.emailsArray
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filename);
    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                const cellValue = cell.value;
                if (cellValue && !global.searchKeywords.includes(cellValue)) {
                    global.searchKeywords.push(cellValue);
                }
            });
        });
    });
    global.searchKeywords.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    console.log('Total keywords:', global.searchKeywords.length);
    if (isDailyJob) {
        startDailyJob();
    } else {
        writeExcel(global.searchKeywords, global.emailsArray, true);
    }
}

// Function to start daily job process to run daily
async function startDailyJob() {
    global.searchKeywords
    global.emailsArray
    global.fileName
    try {
        if (dailyEmailJob) {
            console.log('Daily email task already running');

        } else {
            //     // // Schedule task to run each 10 minutes
            // dailyEmailJob = cron.schedule('*/05 * * * *', () => {
                // Schedule task to run every day at 1 AM
                dailyEmailJob = cron.schedule('0 1 * * *', () => {
                // Call the function to start daily job
                if (global.searchKeywords.length >= 0) {
                    writeExcel(global.searchKeywords, global.emailsArray, true)
                }
                else {
                    getExcelFileKeywords(global.fileName, false)
                }
            });
            dailyEmailJob.start();
        }
    } catch (error) {
        console.log(error.message)
    }
}

// Function to write excel sheet by searching bids on portal
async function writeExcel(keywordsArray, Emails, isCompareRequired = false, EndFromDate = '', EndToDate = '') {
    global.nullBidsKeys;
    var jsonData = {}; // Array to store JSON objects
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Bids");
    const current_timeStamp = Math.floor(Date.now() / 1000)
    var fileName = "Daily_Bids_data"
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedToday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    worksheet.columns = [
        { header: 'Search Bid', key: 'search_bid' },
        { header: 'ID', key: 'id' },
        { header: 'Bid Number', key: 'b_bid_number' },
        { header: 'Category Name', key: 'b_category_name' },
        { header: 'Total Quantity', key: 'b_total_quantity' },
        { header: 'Title', key: 'bbt_title' },
        { header: 'Status', key: 'b_status' },
        { header: 'Bid Type', key: 'b_bid_type' },
        { header: 'Is Bunch', key: 'b_is_bunch' },
        { header: 'Type', key: 'b_type' },
        { header: 'Bid To RA', key: 'b_bid_to_ra' },
        { header: 'Buyer Status', key: 'b_buyer_status' },
        { header: 'Evaluation Type', key: 'b_eval_type' },
        { header: 'Start Date', key: 'final_start_date_sort' },
        { header: 'End Date', key: 'final_end_date_sort' },
        { header: 'BD Category Name', key: 'bd_category_name' },
        { header: 'Is Custom Item', key: 'b_is_custom_item' },
        { header: 'Is High Value', key: 'is_high_value' },
        { header: 'RA to Bid', key: 'b_ra_to_bid' },
        { header: 'Is Inactive', key: 'b_is_inactive' },
        { header: 'Cat ID', key: 'b_cat_id' },
        { header: 'Created By', key: 'b_created_by' },
        { header: 'Is Single Packet', key: 'ba_is_single_packet' },
        { header: 'Official Details Min Name', key: 'ba_official_details_minName' },
        { header: 'Official Details Dept Name', key: 'ba_official_details_deptName' },
        { header: 'Date of File Creation', key: 'insert_date' }
    ];
    if (!isCompareRequired) {
        if (EndFromDate != '') {
            fileName = "Searched_Bids/" + "GeM_searched_bids_" + EndFromDate + "_" + EndToDate + "_" + current_timeStamp;
        }
        else {
            fileName = "Searched_Bids/" + "GeM_searched_bids_" + formattedToday + "_" + current_timeStamp;
        }
    }
    else {
        fileName = "Daily_Bids/Daily_Bids_data";
    }
    let completedFetches = 0;
    var sortedData = []; // Array to store sorted data
    for (const keyword of keywordsArray) {
        const rows = await fetchData((keyword.trim()), isCompareRequired, EndFromDate, EndToDate);
        for (const doc of rows) {
            const category_name = doc.b_category_name[0]
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            const dataExists = regex.test(category_name);
            if (dataExists) {
                var docslink = 'https://bidplus.gem.gov.in/showbidDocument/' + doc.id
                const hyperlink = { // Create a new object called hyperlink with two properties: text and hyperlink
                    text: doc.b_bid_number, // Set the text property to the string 'LINK'
                    hyperlink: docslink // Set the hyperlink property to the current item in the nullBidsKeys array
                };
                var data_to_insert = {
                    search_bid: keyword,
                    id: doc.id,
                    b_bid_number: worksheet.value = hyperlink,
                    b_category_name: doc.b_category_name?.join(', '),
                    b_total_quantity: doc.b_total_quantity?.join(', '),
                    bbt_title: doc.bbt_title?.join(', '),
                    b_status: doc.b_status?.join(', '),
                    b_bid_type: doc.b_bid_type?.join(', '),
                    b_is_bunch: doc.b_is_bunch?.join(', '),
                    b_type: doc.b_type?.join(', '),
                    b_bid_to_ra: doc.b_bid_to_ra?.join(', '),
                    b_buyer_status: doc.b_buyer_status?.join(', '),
                    b_eval_type: doc.b_eval_type?.join(', '),
                    final_start_date_sort: doc.final_start_date_sort?.join(', '),
                    final_end_date_sort: doc.final_end_date_sort?.join(', '),
                    bd_category_name: doc.bd_category_name?.join(', '),
                    b_is_custom_item: doc.b_is_custom_item?.join(', '),
                    is_high_value: doc.is_high_value?.join(', '),
                    b_ra_to_bid: doc.b_ra_to_bid?.join(', '),
                    b_is_inactive: doc.b_is_inactive?.join(', '),
                    b_cat_id: doc.b_cat_id?.join(', '),
                    b_created_by: doc['b.b_created_by']?.join(', '),
                    ba_is_single_packet: doc.ba_is_single_packet?.join(', '),
                    ba_official_details_minName: doc.ba_official_details_minName?.join(', '),
                    ba_official_details_deptName: doc.ba_official_details_deptName?.join(', '),
                    insert_date: formattedToday
                }
                const isID = doc.id;
                if (isCompareRequired) {
                    var filter_query = { id: doc.id };
                    var query_result = await main_collection.find(filter_query, { projection: { _id: 0 } }).toArray();
                    // console.log("Database Data Length:", query_result.length)
                    if (query_result.length == 0) {
                        await main_collection.insertOne(data_to_insert);
                        if (jsonData.hasOwnProperty(isID)) {
                            // console.log("Updating data of keyowrd:", keyword)
                            const existingData = jsonData[isID];
                            const existingSearchBid = existingData.search_bid;
                            const newSearchBid = existingSearchBid.trim() + ", " + keyword.trim();
                            existingData.search_bid = newSearchBid;
                        } else {
                            // console.log("Inserting New Data of keyword:", keyword)
                            jsonData[isID] = data_to_insert;
                            sortedData.push(data_to_insert); // Add the new data to the sortedData array
                        }
                    }
                    else {
                        var newDataBid = query_result[0].search_bid
                        var newDataBidArray = newDataBid.split(", ");
                        var isAvailable = newDataBidArray.includes(keyword.trim());
                        if (!isAvailable) {
                            var newData = newDataBid + ", " + keyword.trim();
                            let new_Date = query_result[0].updated_Date
                            var update_data = { $set: { search_bid: newData, updated_Date: formattedToday } }
                            if (new_Date != undefined) {
                                let newUpdatedDate = new_Date + ", " + formattedToday;
                                update_data = { $set: { search_bid: newData, updated_Date: newUpdatedDate } }
                            }
                            await main_collection.updateOne(filter_query, update_data);
                            // console.log("Updating new data to the Database.")
                            if (jsonData.hasOwnProperty(isID)) {
                                const existingData = jsonData[isID];
                                const existingSearchBid = existingData.search_bid;
                                const newSearchBid = existingSearchBid.trim() + ", " + keyword.trim();
                                existingData.search_bid = newSearchBid;
                            } else {
                                jsonData[isID] = data_to_insert;
                                sortedData.push(data_to_insert); // Add the new data to the sortedData array
                            }
                        }
                    }
                }
                else {
                    if (jsonData.hasOwnProperty(isID)) {
                        const existingData = jsonData[isID];
                        const existingSearchBid = existingData.search_bid;
                        const newSearchBid = existingSearchBid.trim() + ", " + keyword.trim();
                        existingData.search_bid = newSearchBid;
                    } else {
                        jsonData[isID] = data_to_insert;
                        sortedData.push(data_to_insert); // Add the new data to the sortedData array
                    }
                }
            }
        };
        completedFetches++;
        const percentageDone = ((completedFetches / keywordsArray.length) * 100).toFixed(2);
        console.log(`\n\nWriting of ALL BIDs data sheet is (${percentageDone}% done)\nPlease do not terminate the process or you will lost all the data\n`);
    }
    sortedData.sort((a, b) => a.search_bid.localeCompare(b.search_bid));
    sortedData.forEach((data) => {
        worksheet.addRow(data);
    });
    await workbook.xlsx
        .writeBuffer()
        .then(async (buffer) => {
            var worksheetRowCount = worksheet.rowCount;
            if (buffer.length > 0 && worksheetRowCount > 1) {
                await workbook.xlsx
                    .writeFile(fileName + ".xlsx")
                await sendEmailWIthAttachment(fileName, Emails, formattedToday, keywordsArray, isCompareRequired, true);
            } else {
                await sendEmailWIthAttachment(fileName, Emails, formattedToday, keywordsArray, isCompareRequired, false);
            }
        })
        .catch((err) => {
            console.error(err);
        });
}

async function sendEmailWIthAttachment(fileName, to_gmail, formattedToday, keywords, isCompareRequired = false, isdata = true) {
    const timedata = new Date();
    const current_time = timedata.toLocaleTimeString();
    // Create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'inevitableapptest@gmail.com',
            pass: 'fiddtnvwktcucugh'
        },
    });
    // Setup email data with attachments
    let mailOptions = {
        from: 'inevitableapptest@gmail.com',
        to: to_gmail,
    };
    if (isdata) {
        if (isCompareRequired) {
            mailOptions.subject = "Today's Bids on GeM portal on " + formattedToday;
            mailOptions.text = 'Please find the attached files containing the new bids.';
        } else {
            mailOptions.subject = "Your Search Bids on GeM portal on " + formattedToday + " at " + current_time.toString();
            mailOptions.text = 'Please find the attached files containing the searched bids.';
        }
        mailOptions.attachments = [{
            filename: `${fileName.split('/')[1]}.xlsx`,
            path: path.resolve(__dirname, `${fileName}.xlsx`),
        }];
        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                // console.log('Waiting for other process');
                try {
                    if (isCompareRequired) {
                        try {
                            fs.unlinkSync(`${fileName}.xlsx`);
                            console.log("Daily Bid File deleted Sucessfully")
                        }
                        catch (fs_error) {
                            console.log("FS Error:", fs_error)
                        }
                    }
                    else {
                        fs.unlinkSync(`${fileName}.xlsx`);
                    }
                }
                catch (error_msg) {
                    console.log("Getting Error: ", error_msg)
                }
            }
        });
    }
    else {
        if (isCompareRequired) {
            mailOptions.subject = "Today's Bids on GeM portal on " + formattedToday;
            mailOptions.text = `There is no data found for given Keywords: " ${keywords} "`;
        } else {
            mailOptions.subject = "Your Search Bids on GeM portal on " + formattedToday + " at " + current_time.toString();
            mailOptions.text = `There is no data found for given search Keywords: " ${keywords} ". \nPlease try again`;
        }
        // Send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                // console.log('Waiting for other process to handle');
            }
        });
    }
}

// Function to fetch keywords data from portal
async function fetchData(keyword, isCompareRequired, fromDate, toDate) {
    global.nullBidsKeys = []
    console.log("Working on Fetching Bids of Keyword : ", keyword);
    var from_endtDate
    var to_endDate
    // Get current date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const formattedToday = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    // Get a date 1 year from today but 1 day before in YYYY-MM-DD format
    const nextYear = new Date(today);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    nextYear.setDate(nextYear.getDate() - 1);
    const formattedNextYear = `${nextYear.getFullYear()}-${(nextYear.getMonth() + 1).toString().padStart(2, '0')}-${nextYear.getDate().toString().padStart(2, '0')}`;
    if (isCompareRequired) {
        from_endtDate = formattedToday
        to_endDate = formattedNextYear
    }
    else {
        from_endtDate = fromDate.toString()
        to_endDate = toDate.toString()
    }
    try {
        const token = "26422804ab4cd5cb321d9ffcd5ac770a";
        const headers = {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "sec-ch-ua":
                '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Linux"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-requested-with": "XMLHttpRequest",
            cookie:
                "csrf_gem_cookie=" +
                token +
                "; ci_session=07cea528d9cccf7f87eef6e91393e99b90073779; GEMDCPROD=NODE3; TS01b34dec=015c77a21c9f4e49ae0ef0be6ef5bfcea21a21b45e722e1ca9e00c4dbfb388f9cbe2b7942ecbe5dcf471df7f9c22c7e51763bf3ff324ccfde63f0f8b07030351c6d18e945c8fbaf8c17c518d78a81d5d0655a5ec9a; _ga=GA1.3.1268017623.1681712229; _gid=GA1.3.600264479.1681712229; TS0106b57a=015c77a21ca9606b0a5f428c6defb2f871819ebd16b8c6a0bf5015ebbc2e1e9e36df23b8009e3fecc39af4a2d80db02fa5c2305923cf0371cb87c87641068e5bdc677fff5f",
            Referer: "https://bidplus.gem.gov.in/all-bids",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        };
        const resultsPerPage = 10;
        const hig_value = ""
        const bid_type = "all"
        const bid_status_type = "ongoing_bids"
        const serach_text = "fullText"
        const sorting = "Bid-End-Date-Oldest"
        const csrf_token = "%7D&csrf_bd_gem_nk=" + token;
        // console.log("from Date : ", from_endtDate, "\nto End Date : ", to_endDate)
        const param = { searchBid: keyword, searchType: serach_text }
        const filter = {
            bidStatusType: bid_status_type,
            byType: bid_type,
            highBidValue: hig_value,
            byEndDate: { from: from_endtDate, to: to_endDate },
            sort: sorting,
        }
        const encoded_payload = encodeURIComponent(JSON.stringify(filter)) + csrf_token
        const encoded_param = encodeURIComponent(JSON.stringify(param))
        const new_encoded_payload = "payload=%7B%22param%22%3A" + encoded_param + "%2C%22filter%22%3A" + encoded_payload
        const rows = [];
        const numFound = await axios({
            method: "post",
            url: "https://bidplus.gem.gov.in/all-bids-data",
            headers,
            data: new_encoded_payload,
        })
            .then((resp) => resp.data.response.response.numFound)
            .catch((err) => {
                global.nullBidsKeys.push(keyword);
                throw new Error(`Error fetching bids of keyword : ${keyword}`);
            });
        const numPages = Math.ceil(numFound / resultsPerPage);
        console.log("Toatal Bids pages : ", numPages)
        for (let i = 1; i <= numPages; i++) {
            const newEncodedPayload = i === 1 ? new_encoded_payload : `payload=%7B%22page%22%3A${i}%2C%22param%22%3A` + encoded_param + "%2C%22filter%22%3A" + encoded_payload;
            const resp = await axios({
                method: "post",
                url: "https://bidplus.gem.gov.in/all-bids-data",
                headers,
                data: newEncodedPayload,
            }).catch((err) => {
                global.nullBidsKeys.push(keyword);
                throw new Error(`Error fetching bids of keyword : ${keyword}`);
            });
            rows.push(...resp.data.response.response.docs);
        }
        return rows;
    } catch (error) {
        console.log(error.message);
        return [];
    }
}

// Start the server for run forever
app.listen(Port, () => {
    console.log(`Port Run in ${Port}`)
    if (!fs.existsSync("Daily_Bids")) {
        fs.mkdirSync("Daily_Bids")
    }
    if (!fs.existsSync("Searched_Bids")) {
        fs.mkdirSync("Searched_Bids")
    }
    getExcelFileKeywords(fileName, true)

})
