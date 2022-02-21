const singleImageUploader = require('../../../utils/singleFileUploader')
const doctorCreateValidation = require('../../../validation/User/doctor')
const User = require('../../model/User/Common/user')
const bcrypt = require('bcrypt')
const Admin = require('../../../src/model/User/Admin/admin')
const idGenerator = require('../../../utils/generateRandomUserID')
const adminCreationValidation = require('../../../validation/User/admin')
const acceptedExtension = require('../../../utils/acceptedExtenstion')

//create a new admin 
const createNewAdminController = async (req, res) => {
    try{
        const {error} = adminCreationValidation.validate(req.body) //validate with joi 
        if(error) {
            res.json({
                message: "Joi Validation error",
                error
            })
        }else {
            const {profileImage,password ,personalInfo } = req.body //get the data from body
            const imageFile = profileImage //store the image file  
            const {email} = personalInfo.contact //ge the email  
            const isExistEmail = await User.findOne({email}) //search that is this email is exist or not 
            if(isExistEmail) { //if the input email is exist then it will execute 
                res.json({
                    message: "You input email is already in use. Please try with another email"
                })
            }else {
                //upload the image file    
                const extension = acceptedExtension //ge the extension   
                const file = imageFile //this is my image file 
                const fileName = "admin" //set the file Name  
                const uploadTheImage = singleImageUploader(file, extension, fileName) //upload the image file  
                const {extensionValidation, fileUrl, fileAddStatus} = uploadTheImage //get the response of upload the image file
                if(fileAddStatus) { //check that is the file is add or not
                    if(extensionValidation) { //check that is the extension is validated or not 
                        const hashPassword = await  bcrypt.hash(password, 10) //hashed the new password  
                        if(hashPassword) {
                            const {userId} = idGenerator(fileName) //generate a 6 digits user id for doctor 
                            if(userId) {
                                const newPassword = hashPassword //new password 
                                const imageUrl = fileUrl //uploaded image file  
                                //create a new admin 
                                const newAdmin = new Admin({
                                    ...req.body, 
                                    password: newPassword, 
                                    userId ,
                                    "personalInfo.profileImage": imageUrl
                                }) //create a instance of the admin 
 
                                const createNewAdmin = await newAdmin.save() //save a new admin 
                                if(createNewAdmin) {
                                    const {_id, userType, userId} = createNewAdmin //get the new admin userType userId and object Id
                                    const {email} = createNewAdmin.personalInfo.contact //get the new admin email
                                    const newUser = new User({
                                        _id,
                                        userType,
                                        userId,
                                        email
                                    }) //create a new user instance 
                                    const saveNewUser = await newUser.save() //save a new user 
                                    if(saveNewUser) { //if a new user has been created  successfully as a doctor then it will execute 
                                        res.status(201).json({
                                            message: "New Admin created successfully",
                                            adminData: createNewAdmin,
                                            userData: saveNewUser
                                        })
                                    }else {
                                        res.json({
                                            message: "New User Creation failed"
                                        })
                                    }
                                }else {
                                    res.json({ 
                                        message: "New Doctor creations failed"
                                    })
                                }
                            }else {
                                res.json({
                                    message: "User id doesn't create"
                                })
                            }
                           
                            //crete a new doctor 
                            const newDoctor = new Doctor({
                                ...req.body, 

                            })
                        }else {
                            res.json({
                                message: "Password Hashing problem"
                            })
                        }
                    }else {
                        res.json({
                            message: "Only jpg jpeg and png are allowed"
                        })
                    }
                }else {
                    res.json({
                        message: "Profile Image upload failed"
                    })
                }
            }   
            
        }
    }catch(err) {
        console.log(err);
        res.json({
            message: err.message,
            err
        })
    }
}

//get all admin controller 
const getAllAdminController = async (req, res) => {
    try{ 
        const findAdmin = await Admin.find({
            "officialInfo.isDelete": false,
            "officialInfo.isActive": true,
        }).select(`-password 
                -recoveryToken
                -modificationInfo`).sort({"modificationInfo.createdAt": 1})
        if(findAdmin) {
            const numberOfAdmin = findAdmin.length 
            res.status(202).json({
                message: `${numberOfAdmin} ${numberOfAdmin > 1 ? "admins" : "admin"} have found`,
                numberOfAdmin: numberOfAdmin,
                data:findAdmin
            })
        }else {
            res.json({
                message: "No Admin Found"
            })
        }
    }catch(err) {
        console.log(err);
        res.json({
            message: err.message,
            err
        })
    }
}

//get individual admin by id 
const getIndividualAdminByIdController = async (req,res) => {
    try {
        const {id} = req.params //get the id from params 
        if(id) {
            const findAdminById = await Admin.findOne({ //find the admin by id if the admin is not deleted and is active
                _id: id,
                "officialInfo.isDelete": false,
                "officialInfo.isActive": true
            }).select(`-password 
                -recoveryToken
                -modificationInfo`)
            if(findAdminById) {
                const {firstName, lastName} = findAdminById.personalInfo //get the first name and last name 
                res.status(202).json({
                    message: `${firstName} ${lastName} have found`,
                    admin: findAdminById,
                })
            }else {
                res.json({
                    message: "Searched Admin doesn't found"
                })
            }
        }else {
            res.json({
                message:"Admin Object id required"
            })
        }
    }catch(err){
        console.log(err);
        res.json({
            message: err.message,
            err
        })
    }
} 

//show three super admin 
const showThreeSuperAdminController = async (req, res) => {
    try {
        const findAdmin = await Admin.find({
            // "officialInfo.category": "superAdmin",
            "officialInfo.isDelete": false,
            "officialInfo.isActive": true
        }).select(`-recoveryToken
                    -modificationInfo
                    -password
                    -officialInfo.isDelete
                    -officialInfo.isActive`).limit(3) //find top three super admin 
        if(findAdmin) { //if found three super admin then it will execute
            const numberOfAdmin = findAdmin.length
            res.status(202).json({
                message: `${numberOfAdmin} ${numberOfAdmin > 1 ? "admins" : "admin"} has found`,
                data: findAdmin
            })
        }else {
            res.json({
                message: "Super Admin not found"
            })
        }
    }catch(err) {
        console.log(err);
        res.json({
            message: err.message,
            err
        })
    }
}

module.exports = {
    createNewAdminController,
    getAllAdminController,
    getIndividualAdminByIdController,
    showThreeSuperAdminController
}