const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const startDailyJob = require('./dailyJobs')
const writeExcel = require('./writeExcel')

async function getExcelFileKeywords(filename, emailsArray, isDailyJob = true) {
    var searchKeywords = []
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(`${filename}`);
    workbook.eachSheet((worksheet) => {
        worksheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                const cellValue = cell.value;
                if (cellValue && !searchKeywords.includes(cellValue)) {
                    searchKeywords.push(cellValue);
                }
            });
        });
    });
    searchKeywords.sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    console.log('Total keywords:', searchKeywords.length);
    if (isDailyJob) {
        startDailyJob(searchKeywords, emailsArray, filename);
    } else {
        writeExcel(searchKeywords, emailsArray, true);
    }
}

module.exports = getExcelFileKeywords
