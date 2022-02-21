const ambulanceCreatValidation = require('../../../validation/Service/ambulanceService')
const AmbulanceService = require('../../model/Service/AmbulanceService/ambulanceService')
const AmbulanceServiceReq = require('../../model/Service/AmbulanceService/ambulanceServiceReq')

//create a ambulanceService controller
const createAmbulanceServiceController = async (req, res) => {
    try{
        const {error} = ambulanceCreatValidation.validate(req.body) //validate the ambulance service object
        if(error) {
            res.json({
                message: "Joi Validation error",
                error
            })
        }else {
            const findAmbulance = await AmbulanceService.find() //get all ambulance
            let ambulanceNo;
            if(findAmbulance.length == 0) {
                ambulanceNo = 1
            }else {
                ambulanceNo = findAmbulance.length + 1
            }
            // console.log(ambulanceNo);
            const newAmbulanceService = new AmbulanceService({
                ...req.body,
                "ambulanceInfo.ambulanceNo": ambulanceNo
            }) //create a new instance of ambulance service
            const createNewAmbulanceService = await newAmbulanceService.save() //save the new ambulance service object
            if(createNewAmbulanceService) { //check that is it created or not 
                res.status(201).json({
                    message: "New Ambulance service has been added",
                    serviceData: createNewAmbulanceService
                })
            }else {
                res.json({
                    message: "Ambulance service creation failed"
                })
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

//update a ambulance service by id 
const updateAmbulanceServiceByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the ambulance id from params  
        if(id) {
            const updateAmbulanceData = await AmbulanceService.updateOne(
                {
                    _id: id,
                    "others.isDelete": false,
                    "others.isActive": true
                }, //query the ambulance id
                {
                    $set: req.body,
                    $currentDate: {
                        "modificationInfo.updatedAt": true
                    }
                }, //update 
                {multi: true} //option   
            ) //update the ambulance service 
            if(updateAmbulanceData.nModified != 0) {
                res.status(202).json({
                    message: "Ambulance service updated successfully"
                })
            }else {
                res.json({
                    message: "Ambulance service update failed"
                })
            }
        }else {
            res.json({
                message: "Ambulance Id required"
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

//delete a ambulance service by id 
const deleteAmbulanceServiceById = async (req, res) => {
    try {
        const {id} = req.params //get the ambulance id from params  
        if(id) {
            const findAmbulance = await AmbulanceService.findOne({
                _id: id,
                "others.isDelete": false,
                "others.isActive": true
            }) //find that is it avlable or not  
            if(findAmbulance) {
                const {ambulanceNo} = findAmbulance.ambulanceInfo
                 const updateAmbulanceData = await AmbulanceService.updateOne(
                    {
                        _id: id,
                        "others.isDelete": false,
                        "others.isActive": true
                    }, //query the ambulance id
                    {
                        $set: {
                            "others.isDelete": true,
                            "others.isActive": false
                        },
                        $currentDate: {
                            "modificationInfo.updatedAt": true
                        }
                    }, //update 
                    {multi: true} //option   
                ) //update the ambulance service 
                if(updateAmbulanceData.nModified != 0) {
                    res.status(202).json({
                        message: `No ${ambulanceNo} Ambulance Deleted successfully`
                    })
                }else {
                    res.json({
                        message: "Ambulance service Delete failed"
                    })
                }
            }else {
                res.json({
                    message: "Ambulance Service not found"
                })
            }
        }else {
            res.json({
                message: "Ambulance Id required"
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

//show all ambulance service 
const showAllAmbulanceServiceController = async (req, res) => {
    try {
        const findAllAmbulanceService = await AmbulanceService.find({ //find all ambulance services
            "others.isDelete": false, 
            "others.isActive": true,
        }).select("-others -modificationInfo")
        if(findAllAmbulanceService) {
            const numberOfAmbulance = findAllAmbulanceService.length //find the number of ambulance
            res.status(202).json({
                message: `${numberOfAmbulance} ambulance ${numberOfAmbulance > 1 ? "services" : "service"} has found`,
                data: findAllAmbulanceService,
                number: numberOfAmbulance
            })
        }else {
            res.json({
                message: "No AmbulanceService found"
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

//make a ambulance service 
const makeAmbulanceServiceController = async (req, res) => {
    try {
        const {id} = req.user
        const createNewAmbulanceService = new AmbulanceServiceReq({ //create a new ambulance service 
            ...req.body,
            "requestUseInfo.reqUserInfo": id
        })
        const saveNewService = await createNewAmbulanceService.save() //save the new service  
        if (saveNewService) { //if the new service place successfully  then it will happen
            res.status(201).json ({
                message : "New Ambulance service Placed successfully please wait for approval from an admin",
                data:  saveNewService
            })
        }else {
            res.json ({
                message: "New Ambulance service creation failed",
            })
        }
    }catch (err) {
        console.log(err);
        res.json({
            message: err.message
        })
    }
}

//get all un approved ambulance service 
const getAllUnapprovedAmbulanceServiceController = async (req, res) => {
    try {
        const findUnApproveOxygenServiceReq = await AmbulanceServiceReq.find({
            "others.isDelete": false,
            "others.isActive": true,
            "requestInfo.isApproved": false
        }).populate({ //get only the name of the patient logged in
            path: "requestUseInfo.reqUserInfo",
            select: `personalInfo.firstName 
                        personalInfo.lastName 
                        userId `
        }).select("requestUseInfo requestInfo")
        if (findUnApproveOxygenServiceReq) { //if  ambulance servie has found then it will execute
            res.status(202).json ({
                message: `${findUnApproveOxygenServiceReq.length} ambulance service request request found `,
                data: findUnApproveOxygenServiceReq
            })
        }else {
            res.json ({
                message: "No ambulance service request not found"
            })
        }

    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message
        })
    }
}

//approve the pending ambulance service request 
const approvePendingAmbulanceServiceRequestController = async (req, res) => {
    try {
        const {id:ambulanceServiceRequestId} = req.params //get the request id from params
        const findPendingRequestAndApprovedIt = await AmbulanceServiceReq.updateOne (
            {
                "_id": ambulanceServiceRequestId,
                "requestInfo.isApproved": false,
                "others.isDelete": false,
                "others.isActive": true

            }, //query
            {
                $set: {
                    "requestInfo.isApproved": true,
                    "others.isDelete": true,
                    "others.isActive": false
                }
            }, //update
            {multi: true}//option
        )
        if (findPendingRequestAndApprovedIt) {
            res.status(202).json({
                message: "Ambulance request has been approved by an admin"
            })
        }else {
            res.json ({
                message: "Ambulance request approved failed",
            })
        }
    }catch (err) {
        console.log(err);
        res.json ({
            message: err.message
        })
    }
}

module.exports = {
    createAmbulanceServiceController,
    updateAmbulanceServiceByIdController,
    deleteAmbulanceServiceById,
    showAllAmbulanceServiceController,
    makeAmbulanceServiceController,
    getAllUnapprovedAmbulanceServiceController,
    approvePendingAmbulanceServiceRequestController
}