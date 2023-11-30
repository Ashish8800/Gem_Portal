const cron = require('node-cron');

var dailyEmailJob = null;

const getExcelFileKeywords = require('./getExcelFileKeywords')
const writeExcel = require('./writeExcel')

// Function to start daily job process to run daily
async function startDailyJob(searchKeywords, emailsArray, fileName) {
    // global.searchKeywords
    // global.emailsArray
    // global.fileName
    try {
        if (dailyEmailJob) {
            console.log('Daily email task already running');

        } else {
            // Schedule task to run each 10 minutes
            // dailyEmailJob = cron.schedule('*/10 * * * *', () => {
            // // Schedule task to run every day at 1 AM
            dailyEmailJob = cron.schedule('0 1 * * *', () => {
                // Call the function to start daily job
                if (searchKeywords.length >= 0) {
                    writeExcel(searchKeywords, emailsArray, true)
                }
                else {
                    getExcelFileKeywords(fileName, emailsArray, false)
                }
            });
            dailyEmailJob.start();
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = startDailyJob;