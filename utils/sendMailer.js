const nodemailer = require('nodemailer');
require('dotenv').config() 

//dot env file 
const hostEmail = process.env.HOST_EMAIL // ge the mailer host email address
const hostPassword = process.env.HOST_PASSWORD // ge the host password from dot env file data
const senderEmail = process.env.SENDER_EMAIL // ge the

const sendMailer = async(from, to, text, subject, senderName) => {
    try {
        let responseMessage = ""
        let responseStatus = false
        //sent the mail part start 
        let sentFrom = from || senderEmail
        let senderNames = senderName || "Admin"
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: hostEmail,
                pass: hostPassword
            }
        }); //create the transporter 

        const mailOptions = {
            from: `Medicare<${sentFrom}>` ,
            to ,
            subject,
            text //this otp 
        } //create the mail option 

    

        const sentMail = (mailOption) => { //create a promise which sent these mail 
            return new Promise ((resolve, reject) => {
                transporter.sendMail(mailOption, (err, data) => {
                    if(err) {
                        console.log(err);
                        responseMessage = err
                        responseStatus = false
                        reject(err)
                    }else {
                        resolve(data)
                        responseMessage =  `A verification code has been sent to ${to}`
                        responseStatus = true
                        console.log(`A verification code has been sent to ${emailData}`);
                    }
                }) //sent the mail 
            }) 
        }
        const isSentMail = await sentMail(mailOptions)

        if(isSentMail.accepted.length > 0) { //if the mail is successfully sent it will execute
            return {
                message: responseMessage,
                responseStatus
            }
        }else {
            message,
            responseStatus
        }
        
    }catch(err){
        console.log(err);
        return {
            message: err.message,
            responseStatus,
        }
    }
}


module.exports = sendMailer