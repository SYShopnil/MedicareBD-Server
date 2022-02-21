const ContactFormValidator = require("../../../validation/Others/companyContactForm")
const Admin = require("../../model/User/Admin/admin")
const sentMailHandler = require("../../../utils/sendMailer")

//make company contact form controller 
const makeContactFormForMedicare = async (req,res) => {
    try {
        const {error} = ContactFormValidator.validate(req.body) //complete the validation  
        if(error) { //if there have validation error then it will execute
            res.json({
                message: `Joi Validation Error`,
                error
            })
        }else {
            const findAdmin = await Admin.find({ //find all active admin and get the email 
                "officialInfo.isDelete": false,
                "officialInfo.isActive": true,
            }).select("personalInfo.contact.email") 
            const check = []
            if(findAdmin) {
                for(let i = 0 ; i <= findAdmin.length - 1; i++) {
                    const {email: adminEmail} = findAdmin[i].personalInfo.contact //get the email
                    const data = req.body //store the data 
                    const subject = `A query`
                    const message = `Name: ${req.body.name}
                    Email: ${req.body.email}
                    Message: ${req.body.message}`
                    const {responseStatus} = await sentMailHandler(req.body.email, adminEmail, message, subject, req.body.name) //sent mail to all admin 
                    if(responseStatus) {
                        check.push("done")
                    }else {
                        break
                    }
                }
                if(findAdmin.length == check.length) {
                    res.status(202).json({
                        message: "Thanks for contacting with us.Our admin team will contact with you soon "
                    })
                }else {
                   res.status(202).json({
                        message: "Thanks for contacting with us.Our admin team will contact with you soon",
                        err: `Some admin did not found mail`
                   })
                }
            }else {
                res.json({
                    message: `No Admin found`
                })
            }
        }
    }catch (err) {
        console.log(err);
        res.json({
            message: err.message,
            err
        })
    }
}

module.exports = {
    makeContactFormForMedicare
}