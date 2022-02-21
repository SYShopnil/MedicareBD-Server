const bcrypt = require("bcrypt");
const Patient = require("../../model/User/Patient/patient");
const User = require("../../model/User/Common/user");
const Prescription = require("../../model/Service/Prescription/prescription");
const patientValidation = require("../../../validation/User/patient");
const singleFileUploader = require("../../../utils/singleFileUploader");
const acceptedExtension = require("../../../utils/acceptedExtenstion");
const randomUserId = require("../../../utils/generateRandomUserID");
const {
  findOneAndReplace,
} = require("../../model/Service/Prescription/prescription");

//register a patient
const patientCreateController = async (req, res) => {
  try {
    // console.log(req.body);
    const { error } = patientValidation.validate(req.body); //valid admin with joi
    if (error) {
      res.json({
        message: "joi validation error",
        error,
      });
    } //if there have some error in joi validation
    else {
      const { personalInfo, password, profileImage } = req.body; //get the password from req body
      const { email } = personalInfo.contact;
      const hashed = await bcrypt.hash(password, 10);
      if (hashed) {
        const isAvailableEmail = await User.findOne({ email });
        if (isAvailableEmail) {
          res.json({
            message: "Email is exist please try with another email",
          });
        } else {
          //upload the picture
          const { fileAddStatus, extensionValidation, fileUrl } =
            singleFileUploader(profileImage, acceptedExtension);
          if (fileAddStatus) {
            //if the profile Image successfully uploaded,
            if (extensionValidation) {
              //if the extension Validation  successfully
              const imageUrl = fileUrl; //store the file url
              //generate new Patiend id
              const { userId } = randomUserId("patient"); //create a new user id
              const newPatient = new Patient({
                ...req.body,
                password: hashed,
                "personalInfo.profileImage": imageUrl,
                userId,
              }); //create a new patient

              const saveData = await newPatient.save(); //save the new patient
              if (saveData) {
                //if the new patent save it will execute
                const findPatient = await Patient.findOne({
                  "personalInfo.contact.email": email,
                }); //get the new crate user
                if (findPatient) {
                  const { _id, personalInfo } = findPatient; //get the new patients id
                  const { firstName, lastName } = personalInfo;
                  const recoverUser = new User({
                    userType: "patient",
                    email,
                    _id,
                    userId,
                  }); //create a new user
                  await recoverUser.save(); //save the user type and email into user collection
                  res.status(201).json({
                    message: `${firstName} ${lastName} as a patient has been created successfully`,
                    data: saveData,
                  });
                } else {
                  res.json({
                    message: "User Not found",
                  });
                }
              } else {
                res.json({
                  message: "Patient crate failed",
                });
              }
            } else {
              res.json({
                message: "Only jpeg jpg and png are allowed",
              });
            }
          } else {
            res.json({
              message: "Profile Image upload failed",
            });
          }
        }
      } else {
        res.json({
          message: "Password Hashing problem",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({
      err,
    });
  }
};

//see all patient controller
const seeAllPatientController = async (req, res) => {
  try {
    const findPatient = await Patient.find(
      //find the patient
      {
        "officialInfo.isActive": true,
        "officialInfo.isDelete": false,
      }
    )
      .sort({ "modificationInfo.createdAt": 1 })
      .select(
        `-checkUpHistory.prescription 
            -officialInfo.isDelete
            -modificationInfo
            -recoveryToken
            -password`
      )
      .populate({
        //get the data from appointment schema
        path: "officialInfo.checkUpHistory.appointment",
        select: `-appointmentDetails.prescription
                    -others
                    -modificationInfo
                    -appointmentRequestUser`,
        populate: {
          //get the data from  doctor schema
          path: "appointmentDetails.doctorDetails",
          select: `-officialInfo
                            -modificationInfo
                            -recoveryToken
                            -userType
                            -password`,
        },
      });
    if (findPatient) {
      const numberOfPatient = findPatient.length;
      res.status(202).json({
        message: `${numberOfPatient} ${
          numberOfPatient > 1 ? "patients" : "patient"
        } have found`,
        numberOfPatient,
        data: findPatient,
      });
    } else {
      res.json({
        message: "No Patient found",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//can see patient by id controller
const seePatientByIdController = async (req, res) => {
  try {
    const { id } = req.params; //get the data from params
    if (id) {
      const findPatient = await Patient.findOne({
        _id: id,
        "officialInfo.isActive": true,
        "officialInfo.isDelete": false,
      })
        .select(
          `-officialInfo.checkUpHistory.prescription 
            -officialInfo.isDelete
            -modificationInfo
            -recoveryToken
            -password`
        )
        .populate({
          //get the data from appointment schema
          path: "officialInfo.checkUpHistory.appointment",
          select: `-appointmentDetails.prescription
                    -others
                    -modificationInfo
                    -appointmentRequestUser`,
          populate: {
            //get the data from  doctor schema
            path: "appointmentDetails.doctorDetails",
            select: `-officialInfo
                            -modificationInfo
                            -recoveryToken
                            -userType
                            -password`,
          },
        });

      if (findPatient) {
        //if the patient is found then it will execute
        const { firstName, lastName } = findPatient.personalInfo;
        res.status(202).json({
          message: `${firstName} ${lastName} have found`,
          data: findPatient,
        });
      } else {
        res.json({
          message: "Patient not found",
        });
      }
    } else {
      res.json({
        message: "Patient Object id required",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//delete temporary patient by id controller
const deleteTemporaryPatientById = async (req, res) => {
  try {
    const { id } = req.params; //get the data from params
    if (id) {
      const findPatientAndDeleteTemp = await Patient.updateOne(
        //find the patient and delete temporary
        {
          _id: id,
          "officialInfo.isActive": true,
          "officialInfo.isDelete": false,
        }, //query
        {
          $set: {
            "officialInfo.isActive": false,
            "officialInfo.isDelete": true,
          },
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        },
        { multi: true } //option
      );

      if (findPatientAndDeleteTemp.nModified != 0) {
        //if the patient is found then it will execute
        res.status(202).json({
          message: `Patient is temporary delete`,
        });
      } else {
        res.json({
          message: "Patient not found",
        });
      }
    } else {
      res.json({
        message: "Patient Object id required",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//see his prescription
const seeHisPrescriptionController = async (req, res) => {
  try {
    const { id } = req.user; //get the user id from req user
    if (id) {
      const findPrescription = await Patient.findOne({
        _id: id,
        "officialInfo.isActive": true,
        "officialInfo.isDelete": false,
      })
        .populate({
          path: "officialInfo.checkUpHistory.prescription",
          select:
            "patientInfo other.prescriptionId prescriptionData doctorInfo",
        })
        .select("officialInfo.checkUpHistory.prescription"); //get the prescription data
      // console.log(findPrescription)
      if (findPrescription) {
        //if the prescription found then it will execute
        const { prescription } = findPrescription.officialInfo.checkUpHistory;
        const numberOfPrescription = prescription.length;
        res.status(202).json({
          message: `${numberOfPrescription} ${
            numberOfPrescription > 1 ? "Prescriptions" : "Prescription"
          } Has Found`,
          prescriptionData: findPrescription,
        });
      } else {
        res.json({
          message: `Prescription not found`,
        });
      }
    } else {
      res.json({
        message: "Patient object is required",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

module.exports = {
  patientCreateController,
  seeAllPatientController,
  seePatientByIdController,
  deleteTemporaryPatientById,
  seeHisPrescriptionController,
};
