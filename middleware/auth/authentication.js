const jwt  = require('jsonwebtoken')
require('dotenv').config()

const authenticationMiddleware = async (req, res, next) => {
    try {
        const token = req.header('Authorization') //get the token from headers
        //get the dot env file data
        const securityCode = process.env.JWT_SECURE_CODE //ge the security code from dot env
        if(!token) {
            res.json({
                message: "Unauthorized user"
            })
        }else {
            const isValidToken = await jwt.verify(token, securityCode) //check that is it a valid token or not
            if(isValidToken) {
                const verifiedUser = isValidToken //store the token data as a verified userType
                req.user = verifiedUser //store the user token data into req as a user
                next() //sent it as a success in to the controller
            }else {
                res.json({
                    message: "Unauthorized user"
                })
            }
        }
    }catch(err) {
        console.log(err);
        res.json({ 
            message: "Unauthorized user",
            err
        })
    }
}

module.exports = authenticationMiddleware