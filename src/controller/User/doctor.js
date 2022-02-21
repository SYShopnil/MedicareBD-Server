const singleImageUploader = require('../../../utils/singleFileUploader')
const Doctor = require('../../model/User/Doctor/doctor')
const doctorCreateValidation = require('../../../validation/User/doctor')
const User = require('../../model/User/Common/user')
const acceptedExtension = require('../../../utils/acceptedExtenstion')
const bcrypt = require('bcrypt')
const idGenerator = require('../../../utils/generateRandomUserID')
const Patient = require('../../model/User/Patient/patient')
const {getTodayDate} = require('../../../utils/dateController')
const {getXDaysFromToday} = require('../../../utils/dateController')

//create a doctor 
const createDoctorController = async (req, res ) => {
    try{    
        const {error} = doctorCreateValidation.validate(req.body) //validate with joi 
        if(error) {
            res.json({
                message: "Joi Validation error",
                error
            })
        } else {
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
                const fileName = "doctor" //set the file Name  
                const uploadTheImage = singleImageUploader(file, extension, fileName) //upload the image file  
                const {extensionValidation, fileUrl, fileAddStatus} = uploadTheImage //get the response of upload the image file
                if(fileAddStatus) { //check that is the file is add or not
                    if(extensionValidation) { //check that is the extension is validated or not 
                        const hashPassword = await  bcrypt.hash(password, 10) //hashed the new password  
                        if(hashPassword) {
                            const {userId} = idGenerator('doctor') //generate a 6 digits user id for doctor 
                            if(userId) {
                                const newPassword = hashPassword //new password 
                                const imageUrl = fileUrl //uploaded image file  
                                //create a new doctor 
                                const newDoctor = new Doctor({
                                    ...req.body, 
                                    password: newPassword, 
                                    userId ,
                                    "personalInfo.profileImage": imageUrl
                                }) //create a instance of the doctor 
 
                                const createNewDoctor = await newDoctor.save() //save a new doctor 
                                if(createNewDoctor) {
                                    const {_id, userType, userId} = createNewDoctor //get the new doctor userType userId and object Id
                                    const {email} = createNewDoctor.personalInfo.contact //get the new doctor email
                                    const newUser = new User({
                                        _id,
                                        userType,
                                        userId,
                                        email
                                    }) //create a new user instance 
                                    const saveNewUser = await newUser.save() //save a new user 
                                    if(saveNewUser) { //if a new user has been created  successfully as a doctor then it will execute 
                                        res.status(201).json({
                                            message: "New Doctor created successfully",
                                            doctorData: createNewDoctor,
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

//edit doctor by id  controller
const editDoctorByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the id from params 
        if(id) {
            const findDoctor = await Doctor.findOne({
                _id: id, 
                "officialInfo.isActive": true,
                "officialInfo.isDelete": false
            }) //find the doctor  
            if(findDoctor) {
                const updateDoctorData = await Doctor.updateOne( //update the doctor 
                    {
                        _id: id, 
                        "officialInfo.isActive": true,
                        "officialInfo.isDelete": false
                    }, //query 
                    {
                        $set: req.body,
                        $currentDate: {
                            "modificationInfo.updatedAt": true
                        }
                    }, //update 
                    {multi: true}, //option
                )
                if(updateDoctorData.nModified != 0 ) {
                    res.status(202).json({
                        message: "Doctor information successfully updated"
                    })
                }else {
                    res.json({
                        message: "Doctor Update failed"
                    })
                }
            }else {
                res.json({
                    message: "Doctor Not found"
                })
            }
        }else {
            res.json({
                message: "query uniq id required"
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

//delete doctor by id controller
const deleteDoctorByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the id from params 
        if(id) {
            const findDoctor = await Doctor.findOne({ //check that is it a verified doctor or not
                _id: id, 
                "officialInfo.isActive": true,
                "officialInfo.isDelete": false
            }) //find the doctor  
            if(findDoctor) { //if the doctor found then it will execute
                const {firstName, lastName} = findDoctor.personalInfo 
                const deleteDoctor = await Doctor.updateOne( //update the doctor 
                    {
                        _id: id, 
                        "officialInfo.isActive": true,
                        "officialInfo.isDelete": false
                    }, //query 
                    {
                        $set: {
                            "officialInfo.isActive": false,
                            "officialInfo.isDelete": true,
                        },
                        $currentDate: {
                            "modificationInfo.updatedAt": true
                        }
                    }, //update 
                    {multi: true}, //option
                )
                if(deleteDoctor.nModified != 0 ) {
                    res.status(202).json({
                        message: `${firstName} ${lastName} Update successfully`
                    })
                }else {
                    res.json({
                        message: `${firstName} ${lastName} Update failed`
                    })
                }
            }else {
                res.json({
                    message: "Doctor Not found"
                })
            }
        }else {
            res.json({
                message: "Query Uniq ID required"
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

//get all doctor  controller
const getAllDoctorController = async (req, res) => {
    try {
        const findDoctor = await Doctor.find(
            {
                "officialInfo.isActive": true,
                "officialInfo.isDelete": false
            }
        ).sort({"officialInfo.category": 1}).populate({ //get the appointment of a doctor
            path: "officialInfo.checkUpHistory.appointment",
            select: `-patientDetails 
                    -appointmentDetails.prescription 
                    -others -appointmentRequestUser 
                    -modificationInfo`
        }).select(`-password
                    -recoveryToken
                    -modificationInfo`)
        
        if(findDoctor) { //if the doctor found then it will execute
            const numberOfDoctor = findDoctor.length //find that how many doctor have found
            res.status(202).json({
                message: `${numberOfDoctor} ${numberOfDoctor > 1 ? "doctors": "doctor"} found`,
                numberOfDoctor,
                data: findDoctor
            })
        }else {
            res.json({
                message: "No Doctor Found"
            })
        }
    }catch(err) {
        console.log(err);
        res.json({
            message:err.message,
            err
        })
    }
}


//get individual doctor by id controller
const getIndividualDoctorByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the id from url params 
        if(id) {
            const findDoctor = await Doctor.findOne(
                {
                    "_id": id,
                    "officialInfo.isActive": true,
                    "officialInfo.isDelete": false
                }
            ).populate({ //get the appointment of a doctor
                path: "officialInfo.checkUpHistory.appointment",
                select: `-patientDetails 
                        -appointmentDetails.prescription 
                        -others -appointmentRequestUser 
                        -modificationInfo`
            }).select(`-password
                        -recoveryToken
                        -modificationInfo`)
            
            if(findDoctor) { //if the doctor found then it will execute
               const {firstName, lastName} = findDoctor.personalInfo
                res.status(202).json({
                    message: `Dr ${firstName} ${lastName} have found`,
                    data: findDoctor
                })
            }else {
                res.json({
                    message: "No Doctor Found"
                })
            }
        }else {
            res.json({
                message: "Doctor Object Id Required"
            })
        }
        
    }catch(err) {
        console.log(err);
        res.json({
            message:err.message,
            err
        })
    }
}

//can see today's appointment 
const seeTodaysAppointmentController = async (req, res) => {
    try {
        const {id, userType} = req.user //get the object id from logged in user 
        if(userType == "doctor") { //if the user type is patient 
                const findAppointment = await Doctor.findOne(
                    {
                        _id: id,
                        "officialInfo.isActive": true,
                        "officialInfo.isDelete": false
                    }
                ).select("officialInfo.checkUpHistory.appointment").populate({ //get the data from appointment schema
                    path: "officialInfo.checkUpHistory.appointment",
                    select: "patientDetails appointmentDetails.appointmentId appointmentDetails.appointmentDate appointmentDetails.prescription"
                })

                if(findAppointment) { //if find the appointment from logged in doctor schema 
                    const {appointment} = findAppointment.officialInfo.checkUpHistory //get the appointment of doctor
                    const getOnlyTodaysAppointment = appointment.filter(appointment => {
                        const {startOfDay, endOfDay} = getTodayDate() //get today date  
                        const {appointmentDate} = appointment.appointmentDetails //get the appointment date 

                       const startOfDayDate = new Date(startOfDay)
                       const endOfDayDate = new Date(endOfDay)
                        return appointmentDate > startOfDayDate && appointmentDate < endOfDayDate
                    })
                    const sortOfAppointment = getOnlyTodaysAppointment.sort((a,b) => b.appointmentDetails.appointmentDate -
                    a.appointmentDetails.appointmentDate) //sort in descending order by appointment date
                    const numberOfAppointments = sortOfAppointment.length
                    res.status(202).json({
                        message: `${numberOfAppointments} ${numberOfAppointments > 0 ? "Appointmnents" : "Appointment" } Has Found`,
                        foundItems: numberOfAppointments,
                        data: sortOfAppointment
                    })
                }else {
                    res.json({
                        message: "No Appointment found"
                    })
                }
        }else {
            res.json({
                message: "Wrong user type"
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

//can see  next 7 days appointment 
const seeNextSevenAppointmentController = async (req, res) => {
    try {
        const {id, userType} = req.user //get the object id from logged in user 
        if(userType == "doctor") { //if the user type is patient 
                const findAppointment = await Doctor.findOne(
                    {
                        _id: id,
                        "officialInfo.isActive": true,
                        "officialInfo.isDelete": false
                    }
                ).select("officialInfo.checkUpHistory.appointment").populate({ //get the data from appointment schema
                    path: "officialInfo.checkUpHistory.appointment",
                    select: "patientDetails appointmentDetails.appointmentId appointmentDetails.appointmentDate appointmentDetails.prescription"
                })

                if(findAppointment) { //if find the appointment from logged in doctor schema 
                    const {appointment} = findAppointment.officialInfo.checkUpHistory //get the appointment of doctor
                    const getOnlyTodaysAppointment = appointment.filter(appointment => {
                        // const {startOfDay, endOfDay} = getTodayDate() //get today date  
                        const {dateFrom:from , dateTo:to} = getXDaysFromToday(7) //get the next 7 days range
                        const {appointmentDate} = appointment.appointmentDetails //get the appointment date 
                        // console.log({from, to});

                        return appointmentDate >= from && appointmentDate <= to
                    })
                    const sortOfAppointment = getOnlyTodaysAppointment.sort((a,b) => b.appointmentDetails.appointmentDate -
                    a.appointmentDetails.appointmentDate) //sort in descending order by appointment date
                    const numberOfAppointments = sortOfAppointment.length
                    res.status(202).json({
                        message: `${numberOfAppointments} ${numberOfAppointments > 0 ? "Appointmnents" : "Appointment" } Has Found For Next 7 days from today`,
                        foundItems: numberOfAppointments,
                        data: sortOfAppointment
                    })
                }else {
                    res.json({
                        message: "No Appointment found"
                    })
                }
        }else {
            res.json({
                message: "Wrong user type"
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

//get three specialized doctor  controller 
const getThreeSpecialDoctorController = async (req, res) => {
    try {
        const findDoctor = await Doctor.find({
            "officialInfo.isActive": true ,
            "officialInfo.isDelete": false ,
            // "officialInfo.category": "specialized"
        }).select("-officialInfo.checkUpHistory.appointment -modificationInfo -password -recoveryToken").limit(3) 
        if(findDoctor) {
            res.status(202).json({
                message: `${findDoctor.length} ${findDoctor.length > 1 ? "Doctors" : "Doctor"} has found`,
                data: findDoctor
            })
        }else {
            res.json({
                message: "No Specialized doctor found"
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

//show doctor by category  controller 
const showDoctorByCategoryController = async (req, res ) => {
    try {
        const {category} = req.params //get the category by category 
        if (category) { //if doctor category found in the url prams 
            const findDoctorByCategory = await Doctor.find(
                {
                    "officialInfo.isActive": true,
                    "officialInfo.isDelete": false,
                    "officialInfo.category": category
                }
            ).select(`-modificationInfo
                        -recoveryToken
                        -password
                        `).sort({"personalInfo.firstName": 1})
            if(findDoctorByCategory) {
                const number = findDoctorByCategory.length //get the found amount of doctor 
                res.status(202).json({
                    message: `${number} ${number > 1 ? "doctors" : "doctor"} has been found in ${category} category`,
                    data: findDoctorByCategory
                })
            }else {
                res.json({
                    message: "Doctor not found in Requested category please give a valid category"
                })
            }
        }else {
            res.json({
                message: "Doctor Category required in url params"
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

//doctor category controller
const getDoctorCategoryController = async (req, res) => {
    try {
        const findAllDoctor = await Doctor.find({  //find all doctor's category
            "officialInfo.isActive": true,
            "officialInfo.isDelete": false
        }).select ("officialInfo.category -_id") 
        if (findAllDoctor){ //if find doctor then it will execute the
            let category = []
            findAllDoctor.map(data => {
                category.push(...data.officialInfo.category) //get all category
            })
            const allCategory = [...new Set(category)] //this will remove all duplicates array category element
            
            res.status(202).json({
                message : `${allCategory.length} category has found`,
                allCategory
            })
        }else {
            res.json({
                message: "Doctor not found"
            })
        }
    }catch (err) {
        console.log(err);
        res.json({
            message: err.message,
        })
    }
}

module.exports = {
    createDoctorController,
    editDoctorByIdController,
    deleteDoctorByIdController,
    getAllDoctorController,
    getIndividualDoctorByIdController,
    seeTodaysAppointmentController,
    seeNextSevenAppointmentController,
    getThreeSpecialDoctorController,
    showDoctorByCategoryController,
    getDoctorCategoryController
}