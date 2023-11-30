const nodemailer = require('nodemailer')
const fs = require('fs');
const path = require('path');

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
            // path: path.resolve(__dirname, `${fileName}.xlsx`),
            path: path.resolve(`${fileName}.xlsx`),
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

module.exports = sendEmailWIthAttachment;
