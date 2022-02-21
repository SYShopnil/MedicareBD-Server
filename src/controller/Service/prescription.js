const Prescription = require('../../model/Service/Prescription/prescription')
const prescriptionSchemaValidation = require('../../../validation/Service/prescription')
const Appointment = require('../../model/Service/Appointment/apponitment')
const prescriptionIdGenerator = require('../../../utils/generateRandomUserID')
const Patient = require('../../model/User/Patient/patient')
const Doctor = require('../../model/User/Doctor/doctor')
const sendMail = require('../../../utils/sendMailer')

//create a prescription controller 
const createPrescriptionController = async (req, res) => {
    try {
        const {error} = prescriptionSchemaValidation.validate(req.body)
        if(error) {
            res.json({
                message: "Joi validation error",
                error
            })
        }else {
            const {id:doctorId} = req.user //get the unique doctor object id 
            const {appointmentId, patientUserId} = req.body //get the data from body 
            const appointmentAuthentication = await Doctor.findOne({ //check that is it valid appointment of this doctor or not 
                _id: doctorId,
                "officialInfo.isDelete": false,
                "officialInfo.isActive": true,
                "officialInfo.checkUpHistory.appointment": appointmentId
            })
            if(appointmentAuthentication){
                if(doctorId && appointmentId && patientUserId) {
                    const {userId: prescriptionId} = prescriptionIdGenerator("prescription")
                    if(prescriptionId) { //if the prescription id is  created then it will execute
                        const newPrescription = new Prescription({
                            ...req.body,
                            "patientInfo.personalInfo": appointmentId,
                            "doctorInfo": doctorId,
                            "other.prescriptionId": prescriptionId
                        }) //create a new instance of prescription

                        const createPrescription = await newPrescription.save() //save the new prescription 
                        if(createPrescription) {
                            const {_id:newCreatePrescriptionId} = createPrescription //get the object id of new created prescription 
                            if(newCreatePrescriptionId) { //if we find the new create prescription object id then it will execute
                                const storePrescriptionInAppointmentSchema = await Appointment.updateOne( //update the appointment schema by new created prescription 
                                    {
                                        _id: appointmentId,
                                        "others.isDelete": false,
                                        "others.isActive": true
                                    }, //query
                                    {
                                        $set: {
                                            "appointmentDetails.prescription": newCreatePrescriptionId
                                        },
                                        $currentDate: {
                                            "modificationInfo.updatedAt": true
                                        }
                                    }, //update 
                                    {multi: true}, //option
                                )
                                if(storePrescriptionInAppointmentSchema.nModified != 0) {
                                    const updatePatientSchemaByPrescriptionId = await Patient.updateOne( //update the new create prescription  object id into requested patient schema 
                                        {
                                            _id: patientUserId,
                                            "officialInfo.isActive": true,
                                            "officialInfo.isDelete" : false
                                        }, //query
                                        {
                                            $push: {
                                                "officialInfo.checkUpHistory.prescription": newCreatePrescriptionId
                                            },
                                            $currentDate: {
                                                "modificationInfo.updatedAt": true
                                            }
                                        }, //update 
                                        {multi: true}, //option
                                    )
                                    if(updatePatientSchemaByPrescriptionId.nModified != 0) {
                                        res.status(201).json({
                                            message: "New Prescription has been created successful",
                                            prescription: createPrescription
                                        })
                                    } else {
                                        res.json({
                                            message: "New created prescription id failed to store in requested patient schema"
                                        })
                                    }
                                }else {
                                    res.json({
                                        message: "Prescription id update failed in the appointment schema"
                                    })
                                }
                            }else {
                                res.json({
                                    message: "New Creation prescription object id not found"
                                })
                            }
                        }else {
                            res.json({
                                message: "New Prescription creation failed"
                            })
                        }
                    }else {
                        res.json({
                            message: "Prescription Id generate failed"
                        })
                    }
                }else {
                    res.json({
                        message: "Doctor Object id, Appointment ID and Patient Object Id is required"
                    })
                }
            }else {
                res.json({
                    message: "This appointment is not of this doctor"
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

//update prescription information by id 
const updatePrescriptionByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the id from params 
        if(id) {
            const {prescriptionData} = req.body //get the prescription data from body  
            if(prescriptionData) {
                const updatePrescription = await Prescription.updateOne( //update the prescription data
                    {
                        _id: id,
                        "other.isDelete": false,
                        "other.isActive": true
                    }, //query 
                    {
                        $set: {
                            "prescriptionData": prescriptionData
                        },
                        $currentDate: {
                            "modificationInfo.updatedAt": true
                        }
                    }, //update 
                    {multi: true} //option
                )
                if(updatePrescription.nModified != 0) { //if the prescription successfully updated then it will execute
                    res.status(202).json({
                        message: "Prescription successfully updated"
                    })
                }else {
                    res.json({
                        message: "Presction Update failed"
                    })
                }
            }else {
                res.json({
                    message: "Prescription data not found"
                })
            }
        }else {
            res.json({
                message: "Prescription Object id is required"
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

//delete a  prescription by id 
const deletePrescriptionByIdController = async (req, res) => {
    try {
        const {id} = req.params //get the id from params 
        if(id) {
            const findPrescription = await Prescription.findOne({
                _id: id,
                "other.isDelete": false,
                "other.isActive": true
            })
            if(findPrescription) { //if the prescription is find then it will execute
                const {personalInfo:appointmentId} = findPrescription.patientInfo //get the appointment id from prescription schema 
                if(findPrescription) {
                    const updatePrescription = await Prescription.deleteOne( //update the prescription data
                        {
                            _id: id,
                            "other.isDelete": false,
                            "other.isActive": true
                        }, //query 
                    )
                    if(updatePrescription.deletedCount != 0) { //if the prescription successfully updated then it will execute
                        const findAppointmentAndUpdate = await Appointment.updateOne( //find the appointment  and  remove the prescription ref from it 
                            {
                                _id: appointmentId, 
                                "others.isActive": true,
                                "others.isDelete": false
                            }, //query 
                            {
                                $unset: {
                                    "appointmentDetails.prescription": 1
                                },
                                $currentDate: {
                                    "modificationInfo.updatedAt": true
                                }
                            }, //update 
                            {multi: true} //option
                        )

                        if(findAppointmentAndUpdate.nModified != 0) {
                            const prescriptionId = id //store the prescription object id 
                            const findPatientAndUpdate = await Patient.updateOne( //find the tha patient of deleted prescription and remove the ref from patient's schema
                                {
                                    "officialInfo.checkUpHistory.prescription": prescriptionId,
                                    "officialInfo.isActive": true,
                                    "officialInfo.isDelete": false
                                }, //querry
                                {
                                    $pull: {
                                        "officialInfo.checkUpHistory.prescription": prescriptionId,
                                    },
                                    $currentDate: {
                                        "modificationInfo.updatedAt": true
                                    }
                                }, //update 
                                {multi: true}
                            )

                            if(findPatientAndUpdate.nModified != 0) {
                                res.status(202).json({
                                    message: "Prescription successfully deleted"
                                })
                            }else {
                                res.json({
                                    message: "Patient Schema failed to update the deleted prescription reference object id"
                                })
                            }
                        }else {
                            res.json({
                                message: "Appointment Schema failed to update the deleted prescription reference object id"
                            })
                        }
                    }else {
                        res.json({
                            message: "Prescription Update failed"
                        })
                    }
                }else {
                    res.json({
                        message: "Prescription data not found"
                    })
                }
            }else {
                res.json({
                    message: "Prescription not found"
                })
            }
            
        }else {
            res.json({
                message: "Prescription Object id is required"
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

//get prescription by id 
const getPrescriptionById = async (req, res) => {
    try {
        const {id} = req.params //get the prescription id from params 
        if(id) {
            const findPrescription = await Prescription.findOne(
                {
                    _id: id, 
                    "other.isDelete": false, 
                    "other.isActive": true
                }
            ).select("-modificationInfo ") //find the prescription 
            if(findPrescription) {
                res.status(202).json({
                    message: "Prescription found",
                    data: findPrescription,
                })
            }else {
                res.json({
                    message: "Prescription not found"
                })
            }
        }else {
            res.json({
                message: "Prescription Object id required"
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

//export part 
module.exports = {
    createPrescriptionController,
    updatePrescriptionByIdController,
    deletePrescriptionByIdController,
    getPrescriptionById
}