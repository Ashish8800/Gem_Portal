const ExcelJS = require('exceljs');
require('dotenv').config();

const fetchData = require('./fetchData')
const sendEmailWIthAttachment = require('./sendEmail')

const { MongoClient } = require('mongodb');
// const uri = process.env.MONGO_URL;
// const uri = 'mongodb://localhost/bids_database';
const uri = process.env.MONGODB || 'mongodb://localhost:27017/bids_database?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false'; // Replace with your MongoDB connection string
const client = new MongoClient(uri);
const db = client.db();
const main_collection = db.collection('GeM_All_Bids');

const mongoose = require('mongoose');
// Connect to MongoDB
mongoose.connect(uri , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

global.nullBidsKeys = [];

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
            fileName = "./Searched_Bids/" + "GeM_searched_bids_" + EndFromDate + "_" + EndToDate + "_" + current_timeStamp;
        }
        else {
            fileName = "./Searched_Bids/" + "GeM_searched_bids_" + formattedToday + "_" + current_timeStamp;
        }
    }
    else {
        fileName = "./Daily_Bids/Daily_Bids_data";
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
                // console.log("ID:", isID)
                if (isCompareRequired) {
                    var filter_query = { id: doc.id };
                    var query_result = await main_collection.find(filter_query, { projection: { _id: 0 } }).toArray();
                    if (query_result.length == 0) {
                        await main_collection.insertOne(data_to_insert);
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
                    // console.log("ID:", isID)
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

module.exports = writeExcel