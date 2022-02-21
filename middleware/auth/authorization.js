const authorizationMiddleware = (acceptedUserType) => async (req, res, next) => {
    try {
        const acceptedUser = acceptedUserType //store it as a array those who can access this api
        const requestUser = req.user //get this from authentication middleware
        const {userType} = requestUser //get the user type from the user
        const isAuthorizedUser = acceptedUser.find(user => user == userType) //check that is this user type is available or not user
        if(isAuthorizedUser) {
            next()
        }else {
            res.json({
                message: 'Restricted Route'
            })
        }
    }catch (err) {
        console.log(err);
        res.json({
            message: "Restricted Route",
            err
        })
    }
}

module.exports = authorizationMiddleware