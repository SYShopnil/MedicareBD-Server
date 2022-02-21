const User = require("../../model/User/Common/user");
const Patient = require("../../model/User/Patient/patient");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const {
  existingPasswordValidation,
  resetPasswordValidation,
} = require("../../../validation/Others/passwordUpdateValidation");
const Doctor = require("../../model/User/Doctor/doctor");
const Admin = require("../../model/User/Admin/admin");
const nodemailer = require("nodemailer");
const sendMailer = require("../../../utils/sendMailer");
const fileUploader = require("../../../utils/singleFileUploader");
const fileRemoveHandler = require("../../../utils/deleteFileHadler");

//get the dot env file
const securityCode = process.env.JWT_SECURE_CODE; //ge the jwt security code
const hostEmail = process.env.HOST_EMAIL; // ge the mailer host email address
const hostPassword = process.env.HOST_PASSWORD; // ge the host password from dot env file data
const senderEmail = process.env.SENDER_EMAIL; // get the sender email from dot env file data
const verificationMessage = process.env.MESSAGE_FOR_VERIFICATION; //get the verification message from dot env file data

//login controller
const userLoginController = async (req, res) => {
  try {
    const { password: inputPassword, email } = req.body; //get the data rom req body
    const isValidUser = await User.findOne({ email }); //find the user by email
    // console.log(req.body)
    if (isValidUser) {
      //check that is it a valid user or not
      const { userType } = isValidUser; //get the user type
      //if the user type is patient by email and user Name
      if (userType == "patient") {
        const findUser = await Patient.findOne(
          //find the patient
          {
            "personalInfo.contact.email": email,
            "officialInfo.isActive": true,
            "officialInfo.isDelete": false,
          }
        ); //query from database
        if (findUser) {
          const user = findUser; //store the user
          const { password: userPassword } = user; //get the password of that user
          const isMatchPassword = await bcrypt.compare(
            inputPassword,
            userPassword
          ); //compare the is password match or not
          if (isMatchPassword) {
            const { _id, personalInfo, userType } = user; //get the data of user
            const { email } = personalInfo.contact; //get the data of the user

            const tokenData = {
              id: _id,
              email,
              userType,
            }; //set the token data

            //create the token
            const createToken = jwt.sign(tokenData, securityCode, {
              expiresIn: "10d",
            });
            if (createToken) {
              const token = createToken; //store the token here
              res.status(202).json({
                message: "Login Successful",
                token,
              }); //sent it to front end
            } else {
              res.json({
                message: "Token creation failed",
              });
            }
          } else {
            res.json({
              message: "Password does not match",
            });
          }
        } else {
          res.json({
            message: "email or user name not found",
          });
        }
      } else if (userType == "admin") {
        const findUser = await Admin.findOne(
          //find the admin
          {
            "personalInfo.contact.email": email,
            "officialInfo.isActive": true,
            "officialInfo.isDelete": false,
          }
        ); //query from database
        if (findUser) {
          const user = findUser; //store the user
          const { password: userPassword } = user; //get the password of that user
          const isMatchPassword = await bcrypt.compare(
            inputPassword,
            userPassword
          ); //compare the is password match or not
          if (isMatchPassword) {
            const { _id, personalInfo, userType } = user; //get the data of user
            const { email } = personalInfo.contact; //get the data of the user

            const tokenData = {
              id: _id,
              email,
              userType,
            }; //set the token data

            //create the token
            const createToken = jwt.sign(tokenData, securityCode, {
              expiresIn: "10d",
            });
            if (createToken) {
              const token = createToken; //store the token here
              res.status(202).json({
                message: "Login Successful",
                token,
              }); //sent it to front end
            } else {
              res.json({
                message: "Token creation failed",
              });
            }
          } else {
            res.json({
              message: "Password does not match",
            });
          }
        } else {
          res.json({
            message: "email or user name not found",
          });
        }
      } else if (userType == "doctor") {
        const findUser = await Doctor.findOne(
          //find the doctor
          {
            "personalInfo.contact.email": email,
            "officialInfo.isActive": true,
            "officialInfo.isDelete": false,
          }
        ); //query from database
        if (findUser) {
          const user = findUser; //store the user
          const { password: userPassword } = user; //get the password of that user
          const isMatchPassword = await bcrypt.compare(
            inputPassword,
            userPassword
          ); //compare the is password match or not
          if (isMatchPassword) {
            const { _id, personalInfo, userType } = user; //get the data of user
            const { email } = personalInfo.contact; //get the data of the user

            const tokenData = {
              id: _id,
              email,
              userType,
            }; //set the token data

            //create the token
            const createToken = jwt.sign(tokenData, securityCode, {
              expiresIn: "10d",
            });
            if (createToken) {
              const token = createToken; //store the token here
              res.status(202).json({
                message: "Login Successful",
                token,
              }); //sent it to front end
            } else {
              res.json({
                message: "Token creation failed",
              });
            }
          } else {
            res.json({
              message: "Password does not match",
            });
          }
        } else {
          res.json({
            message: "email or user name not found",
          });
        }
      }
    } else {
      res.json({
        message: "User not found",
      });
    }
  } catch (err) {
    console.log(err);
    res.json({
      err,
      message: "Some thing is not wrong",
    });
  }
};

//update exist password
const updateExistingPasswordController = async (req, res) => {
  try {
    const { error } = existingPasswordValidation.validate(req.body); //joi validation of existing password validaiton
    if (error) {
      res.json({
        message: "Joi Validation Error",
        error,
      });
    } else {
      const { oldPassword: inputOldPassword, newPassword: inputNewPassword } =
        req.body; //get the data from body
      const { id, userType } = req.user; //get the user from id
      if (userType == "admin") {
        //if the user type is admin
        const findAdmin = await Admin.findOne({ _id: id }).select("password"); //find the admin
        const { password: oldDataBasePassword } = findAdmin; //get the old database password
        const isMatchOldPassword = bcrypt.compare(
          inputOldPassword,
          oldDataBasePassword
        ); //check the old password with the data base password
        if (isMatchOldPassword) {
          //check the old password that is it match with the input password
          if (inputNewPassword == inputOldPassword) {
            //check that input password is equal to the input old password
            res.json({
              message:
                "You have entered old password please input a new password",
            });
          } else {
            const hashedPassword = bcrypt.hash(inputNewPassword, 10); //hashed the new password
            if (hashedPassword) {
              const hashed = hashedPassword; //store the new  input hashed password
              const updateNewPassword = await Admin.updateOne(
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //query
                {
                  $set: {
                    password: hashed, //store the new  hashed  password
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateNewPassword) {
                res.status(202).json({
                  message: "Password has been updated successfully",
                });
              } else {
                res.json({
                  message: "Password Update failed",
                });
              }
            } else {
              res.json({
                message: "Password hashed problem",
              });
            }
          }
        } else {
          res.json({
            message: "Old password doesn't match",
          });
        }
      } else if (userType == "patient") {
        //if the user type is patient
        const findPatient = await Patient.findOne({ _id: id }).select(
          "password"
        ); //find the admin
        const { password: oldDataBasePassword } = findPatient; //get the old database password
        const isMatchOldPassword = bcrypt.compare(
          inputOldPassword,
          oldDataBasePassword
        ); //check the old password with the data base password
        if (isMatchOldPassword) {
          //check the old password that is it match with the input password
          if (inputNewPassword == inputOldPassword) {
            //check that input password is equal to the input old password
            res.json({
              message:
                "You have entered old password please input a new password",
            });
          } else {
            const hashedPassword = bcrypt.hash(inputNewPassword, 10); //hashed the new password
            if (hashedPassword) {
              const hashed = hashedPassword;
              const updateNewPassword = await Admin.updateOne(
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //query
                {
                  $set: {
                    password: hashed, //store the new  hashed  password
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateNewPassword) {
                res.status(202).json({
                  message: "Password has been updated successfully",
                });
              } else {
                res.json({
                  message: "Password Update failed",
                });
              }
            } else {
              res.json({
                message: "Password hashed problem",
              });
            }
          }
        } else {
          res.json({
            message: "Old password doesn't match",
          });
        }
      } else if (userType == "doctor") {
        //if the user type is doctor
        const findDoctor = await Admin.findOne({ _id: id }).select("password"); //find the admin
        const { password: oldDataBasePassword } = findDoctor; //get the old database password
        const isMatchOldPassword = bcrypt.compare(
          inputOldPassword,
          oldDataBasePassword
        ); //check the old password with the data base password
        if (isMatchOldPassword) {
          //check the old password that is it match with the input password
          if (inputNewPassword == inputOldPassword) {
            //check the old password that is it match with the input password
            res.json({
              message:
                "You have entered old password please input a new password",
            });
          } else {
            const hashedPassword = bcrypt.hash(inputNewPassword, 10); //hashed the new password
            if (hashedPassword) {
              const hashed = hashedPassword;
              const updateNewPassword = await Admin.updateOne(
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //query
                {
                  $set: {
                    password: hashed, //store the new  hashed  password
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateNewPassword) {
                res.status(202).json({
                  message: "Password has been updated successfully",
                });
              } else {
                res.json({
                  message: "Password Update failed",
                });
              }
            } else {
              res.json({
                message: "Password hashed problem",
              });
            }
          }
        } else {
          res.json({
            message: "Old password doesn't match",
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//forgot password controller
const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body; //get the email from body
    const isValidUser = await User.findOne({ email }); //get the all user
    if (isValidUser) {
      const { userType, id } = isValidUser; //get the user
      let emailData;
      let otp;
      let SentToken;
      if (userType == "admin") {
        //if the user is admin
        const findUser = await Admin.findOne({ _id: id }); //find the admin
        if (findUser) {
          const user = findUser; //store the admin data here
          const { _id, userType } = user; //get the id and userType
          const { email } = user.personalInfo.contact; //get the email
          let oneTimeCode = "";
          for (let i = 1; i <= 4; i++) {
            oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode;
          } //generate the onetime Code number

          const tokenData = {
            id: _id,
            email,
            userType,
          }; //create the token data

          const createToken = await jwt.sign(tokenData, securityCode); //create the token
          if (createToken) {
            const token = createToken; //store the token
            emailData = email; //store email for sent to the confirmation
            otp = oneTimeCode; //store the otp
            SentToken = token; //store the tokenData to sent it as a response
            const updateTheOTP = await Admin.updateOne(
              {
                _id,
              }, //querry
              {
                recoveryToken: otp, //update the otp into admin schema
              }, //update
              {} //option
            ); //update the one time password into the the user's schema
            if (updateTheOTP) {
              console.log(`one time password is updated`);
            } else {
              console.log(`one time password updated failed`);
            }
            // res.status(202).json({
            //     message: `A verification code has been sent to ${email}`,
            //     token
            // })
          } else {
            res.json({
              message: "Token creation failed",
            });
          }
        } else {
          res.json({
            message: "Admin not found",
          });
        }
      } else if (userType == "patient") {
        const findUser = await Patient.findOne({ _id: id }); //find the patient
        if (findUser) {
          const user = findUser; //store the patient data here
          const { _id, userType } = user; //get the id and userType from user schema
          const { email } = user.personalInfo.contact; //get the email
          let oneTimeCode = "";
          for (let i = 1; i <= 4; i++) {
            oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode;
          } ///generate the onetime Code number of 4 digits

          const tokenData = {
            id: _id,
            email,
            userType,
          }; //create the token data

          const createToken = await jwt.sign(tokenData, securityCode); //create the token
          if (createToken) {
            const token = createToken; //store the token
            emailData = email; //store email for sent to the confirmation
            otp = oneTimeCode; //store the otp
            SentToken = token; //store the token to sent it as a response
            const updateTheOTP = await Patient.updateOne(
              {
                _id,
              }, //querry
              {
                recoveryToken: otp, //update the otp into admin schema
              }, //update
              {} //option
            ); //update the one time password into the the user's schema
            if (updateTheOTP) {
              console.log(`one time password is updated`);
            } else {
              console.log(`one time password updated failed`);
            }
            // res.status(202).json({
            //     message: `A verification code has been sent to ${email}`,
            //     token
            // })
          } else {
            res.json({
              message: "Token creation failed",
            });
          }
        } else {
          res.json({
            message: "Patient not found",
          });
        }
      } else if (userType == "doctor") {
        const findUser = await Doctor.findOne({ _id: id }); //find the admin
        if (findUser) {
          const user = findUser; //store the doctor data here
          const { _id, userType } = user; //get the id and userType of the find doctor
          const { email } = user.personalInfo.contact; //get the email
          let oneTimeCode = "";
          for (let i = 1; i <= 4; i++) {
            oneTimeCode = Math.floor(Math.random() * 9 + 1) + oneTimeCode;
          } //generate the onetime Code number of 4 digits

          const tokenData = {
            id: _id,
            email,
            userType,
          }; //create the token data

          const createToken = await jwt.sign(tokenData, securityCode); //create the token
          if (createToken) {
            const token = createToken; //store the token
            emailData = email; //store email for sent to the confirmation
            otp = oneTimeCode; //store the otp
            SentToken = token; //store the token to sent it as a response
            const updateTheOTP = await Doctor.updateOne(
              //update the one time password into the the user's schema
              {
                _id,
              }, //querry
              {
                recoveryToken: otp, //update the otp into admin schema
              }, //update
              {} //option
            ); //update the one time password into the the user's schema
            if (updateTheOTP) {
              console.log(`one time password is updated`);
            } else {
              console.log(`one time password updated failed`);
            }
            // res.status(202).json({
            //     message: `A verification code has been sent to ${email}`,
            //     token
            // })
          } else {
            res.json({
              message: "Token creation failed",
            });
          }
        } else {
          res.json({
            message: "Doctor not found",
          });
        }
      }

      //sent the mail to for verification
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: hostEmail,
          pass: hostPassword,
        },
      }); //create the transporter

      // console.log({senderEmail, verificationMessage, emailData, hostEmail , hostPassword});

      const { message: responseMessage, responseStatus } = await sendMailer(
        senderEmail,
        emailData,
        `Your verification code is: ${otp}`,
        verificationMessage
      ); //sent the mail for verify the id
      if (responseStatus) {
        res.status(202).json({
          message: responseMessage,
          token: SentToken,
        });
      } else {
        res.json({
          message: "message send failed",
          err: responseMessage,
        });
      }
    } else {
      res.json({
        message: "User not found",
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

//verify otp of reset password controller
const verifyOtpOfResetPasswordController = async (req, res) => {
  try {
    const { token, otp } = req.body; //get the token and otp from the  req body
    if (token) {
      //if the token provided it will execute
      if (otp) {
        //if the OTP provided it will execute
        const decodeTheToken = jwt.verify(token, securityCode); //check that if the token is valid or not if valid then decode the encoded data
        if (decodeTheToken) {
          const { id, userType } = decodeTheToken; //get the data from the token
          if (userType == "admin") {
            //if the user is admin then it will execute
            const findAdminAndUpdate = await Admin.updateOne(
              //find the admin and if the otp match then change the otp
              {
                $and: [
                  {
                    _id: id,
                  },
                  {
                    recoveryToken: otp,
                  },
                ],
              }, //querry part
              {
                $set: {
                  recoveryToken: "",
                },
                $currentDate: {
                  "modificationInfo.updatedAt": true,
                },
              }, //update
              { multi: true } //option
            );
            if (findAdminAndUpdate.nModified != 0) {
              //if the schema is updated then it will execute
              res.status(202).json({
                message: "Email is successfully verified",
                token,
              });
            } else {
              res.json({
                message: "OTP not match",
              });
            }
          } else if (userType == "patient") {
            const findPatientAndUpdate = await Patient.updateOne(
              //find the patient and if the otp match then change the otp
              {
                $and: [
                  {
                    _id: id,
                  },
                  {
                    recoveryToken: otp,
                  },
                ],
              }, //querry part
              {
                $set: {
                  recoveryToken: "",
                },
                $currentDate: {
                  "modificationInfo.updatedAt": true,
                },
              }, //update
              { multi: true } //option
            );
            if (findPatientAndUpdate.nModified != 0) {
              //if the schema is updated then it will execute
              res.status(202).json({
                message: "Email is successfully verified",
                token,
              });
            } else {
              res.json({
                message: "OTP not match",
              });
            }
          } else if (userType == "doctor") {
            const findDoctorAndUpdate = await Doctor.updateOne(
              //find the doctor and if the otp match then change the otp
              {
                $and: [
                  {
                    _id: id,
                  },
                  {
                    recoveryToken: otp,
                  },
                ],
              }, //querry part
              {
                $set: {
                  recoveryToken: "",
                },
                $currentDate: {
                  "modificationInfo.updatedAt": true,
                },
              }, //update
              { multi: true } //option
            );
            if (findDoctorAndUpdate.nModified != 0) {
              //if the schema is updated then it will execute
              res.status(202).json({
                message: "Email is successfully verified",
                token,
              });
            } else {
              res.json({
                message: "OTP not match",
              });
            }
          } else {
            res.json({
              message: "User not found",
            });
          }
        } else {
          res.json({
            message: "Token Decoded failed",
          });
        }
      } else {
        res.json({
          message: "OTP not found",
        });
      }
    } else {
      res.json({
        message: "Token not found",
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

//reset password controller
const resetPasswordController = async (req, res) => {
  try {
    const { token, newPassword } = req.body; //get the token and new password from body
    if (token) {
      const tokenData = await jwt.verify(token, securityCode); //decode the token
      const { id, email, userType } = tokenData; //get the user type  and user id from token and email
      const hashedNewPassword = await bcrypt.hash(newPassword, 10); //hashed New Password
      if (hashedNewPassword) {
        if (userType == "admin") {
          //if the user type is admin it will execute
          const newHashedPassword = hashedNewPassword;
          const findAdminAndUpdatePassword = await Admin.updateOne(
            //find the admin And update the password
            {
              _id: id,
              "personalInfo.contact.email": email,
              "officialInfo.isDelete": false,
              "officialInfo.isActive": true,
            }, //querry
            {
              password: newHashedPassword, //update the new password
            }, //update
            { multi: true } //option
          );
          if (findAdminAndUpdatePassword.nModified != 0) {
            res.status(202).json({
              message: "New Password has been successfully updated",
              token, //this will be the updated password user token
            });
          } else {
            res.json({
              message: "New Password update has been failed",
            });
          }
        } else if (userType == "patient") {
          //if the user is a patient then it will execute
          const newHashedPassword = hashedNewPassword;
          const findPatientAndUpdateThePassword = await Patient.updateOne(
            //find the patient And update the password
            {
              _id: id,
              "personalInfo.contact.email": email,
              "officialInfo.isDelete": false,
              "officialInfo.isActive": true,
            }, //querry
            {
              password: newHashedPassword, //update the new password
            }, //update
            { multi: true } //option
          );
          if (findPatientAndUpdateThePassword.nModified != 0) {
            res.status(202).json({
              message: "New Password has been successfully updated",
              token, //this will be the updated password user token
            });
          } else {
            res.json({
              message: "New Password update has been failed",
            });
          }
        } else if (userType == "doctor") {
          const newHashedPassword = hashedNewPassword; //store the new hash password
          const findDoctorAndUpdatePassword = await Doctor.updateOne(
            //find the doctor And update the password
            {
              _id: id,
              "personalInfo.contact.email": email,
              "officialInfo.isDelete": false,
              "officialInfo.isActive": true,
            }, //querry
            {
              password: newHashedPassword, //update the new password
            }, //update
            { multi: true } //option
          );
          if (findDoctorAndUpdatePassword.nModified != 0) {
            res.status(202).json({
              message: "New Password has been successfully updated",
              token, //this will be the updated password user token
            });
          } else {
            res.json({
              message: "New Password update has been failed",
            });
          }
        }
      } else {
        res.json({
          message: "New Password hashing problem",
        });
      }
    } else {
      res.json({
        message: "Token is required",
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

//can only see his appointment controller
const SeeOnlyHisAppointment = async (req, res) => {
  try {
    const { id, userType } = req.user; //get the object id from logged in user
    if (id && (userType == "doctor" || userType == "patient")) {
      if (userType == "doctor") {
        //if the user type is patient
        const findAppointment = await Doctor.findOne({
          _id: id,
          "officialInfo.isActive": true,
          "officialInfo.isDelete": false,
        })
          .select("officialInfo.checkUpHistory.appointment")
          .populate({
            //get the data from appointment schema
            path: "officialInfo.checkUpHistory.appointment",
            select:
              "patientDetails appointmentDetails.appointmentId appointmentDetails.appointmentDate appointmentDetails.prescription",
          });

        if (findAppointment) {
          //if find the appointment from logged in doctor schema
          const { appointment } = findAppointment.officialInfo.checkUpHistory; //get the appointment of doctor
          const sortOfAppointment = appointment.sort(
            (a, b) =>
              b.appointmentDetails.appointmentDate -
              a.appointmentDetails.appointmentDate
          ); //sort in descending order by appointment date
          const numberOfAppointments = sortOfAppointment.length;
          res.status(202).json({
            message: `${numberOfAppointments} ${
              numberOfAppointments > 0 ? "Appointmnents" : "Appointment"
            } Has Found`,
            foundItems: numberOfAppointments,
            data: sortOfAppointment,
          });
        } else {
          res.json({
            message: "No Appointment found",
          });
        }
      } else if (userType == "patient") {
        const findAppointment = await Patient.findOne({
          _id: id,
          "officialInfo.isActive": true,
          "officialInfo.isDelete": false,
        })
          .select("officialInfo.checkUpHistory.appointment")
          .populate({
            //get the data from appointment schema
            path: "officialInfo.checkUpHistory.appointment",
            select: "patientDetails appointmentDetails",
          });

        if (findAppointment) {
          //if find the appointment from logged in doctor schema
          const { appointment } = findAppointment.officialInfo.checkUpHistory; //get the appointment of doctor
          const sortOfAppointment = appointment.sort(
            (a, b) =>
              b.appointmentDetails.appointmentDate -
              a.appointmentDetails.appointmentDate
          ); //sort in descending order by appointment date
          const numberOfAppointments = sortOfAppointment.length;
          res.status(202).json({
            message: `${numberOfAppointments} ${
              numberOfAppointments > 0 ? "Appointmnents" : "Appointment"
            } Has Found`,
            foundItems: numberOfAppointments,
            data: sortOfAppointment,
          });
        } else {
          res.json({
            message: "No Appointment found",
          });
        }
      }
    } else {
      res.json({
        message: "Doctor Object Id Required or user type is wrong",
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

//can see own profile controller
const seeOwnProfileController = async (req, res) => {
  try {
    const { id, userType, email } = req.user; //get  the data from req user
    if (userType == "admin") {
      //if the userType is admin then it will execute
      const findAdmin = await Admin.findOne({
        _id: id,
        "personalInfo.contact.email": email,
        "officialInfo.isDelete": false,
        "officialInfo.isActive": true,
      }).select("-modificationInfo -password -recoveryToken ");

      if (findAdmin) {
        //if the admin has found then it will execute
        res.status(202).json({
          message: "Admin found",
          data: findAdmin,
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    } else if (userType == "patient") {
      //if the user type is patient then it will execute
      const findPatient = await Patient.findOne({
        _id: id,
        "personalInfo.contact.email": email,
        "officialInfo.isDelete": false,
        "officialInfo.isActive": true,
      }).select("-modificationInfo -password -recoveryToken ");

      if (findPatient) {
        //if the patient has found then it will execute
        res.status(202).json({
          message: "Patient found",
          data: findPatient,
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    } else if (userType == "doctor") {
      //if the doctor has found then it will execute
      const findDoctor = await Doctor.findOne({
        _id: id,
        "personalInfo.contact.email": email,
        "officialInfo.isDelete": false,
        "officialInfo.isActive": true,
      }).select("-modificationInfo -password -recoveryToken ");

      if (findDoctor) {
        //if the Doctor has found then it will execute
        res.status(202).json({
          message: "Doctor found",
          data: findDoctor,
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//can update own profile controller
const updateOwnProfileController = async (req, res) => {
  try {
    const { id, userType, email } = req.user; //get  the data from req user
    if (userType == "admin") {
      //if the userType is admin then it will execute
      const updateProfile = await Admin.updateOne(
        {
          _id: id,
          "personalInfo.contact.email": email,
          "officialInfo.isDelete": false,
          "officialInfo.isActive": true,
        },
        {
          $set: req.body,
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        },
        {
          multi: true,
        }
      );
      if (updateProfile.nModified != 0) {
        //if the admin has found then it will execute
        res.json({
          message: "Admin's profile has been updated",
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    } else if (userType == "patient") {
      //if the user type is patient then it will execute
      const updateProfile = await Patient.updateOne(
        {
          _id: id,
          "personalInfo.contact.email": email,
          "officialInfo.isDelete": false,
          "officialInfo.isActive": true,
        },
        {
          $set: req.body,
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        },
        {
          multi: true,
        }
      );
      if (updateProfile.nModified != 0) {
        //if the admin has found then it will execute
        res.json({
          message: "Patient's profile has been updated",
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    } else if (userType == "doctor") {
      //if the doctor has found then it will execute
      const updateProfile = await Doctor.updateOne(
        {
          _id: id,
          "personalInfo.contact.email": email,
          "officialInfo.isDelete": false,
          "officialInfo.isActive": true,
        },
        {
          $set: req.body,
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        },
        {
          multi: true,
        }
      );
      if (updateProfile.nModified != 0) {
        //if the admin has found then it will execute
        res.json({
          message: "Doctor's profile has been updated",
        });
      } else {
        res.json({
          message: "User not found",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
      err,
    });
  }
};

//update profile picture and delete exist one  from server
const updateProfilePictureAndDeleteExistOneController = async (req, res) => {
  try {
    const { id, userType, email } = req.user; //get  the data from req user
    const { profileImage } = req.body; //get he profile image from body
    if (profileImage.base64) {
      if (userType == "patient") {
        //if the user type is patient
        const findUser = await Patient.findOne({
          _id: id,
          "officialInfo.isActive": true,
          "officialInfo.isDelete": false,
        }).select("personalInfo.profileImage"); //find the patient and get the exist profile image file
        if (findUser) {
          const { profileImage } = findUser.personalInfo; //get the exist or previous profile image url from the
          const spliceFileName = profileImage.split("/");
          const previousFileName = spliceFileName[spliceFileName.length - 1]; //get the previous file name
          const acceptedExtenstion = ["jpg, jpeg, png"];
          const { fileAddStatus, fileUrl, extensionValidation } = fileUploader(
            profileImage,
            acceptedExtenstion,
            "patient"
          );

          if (extensionValidation) {
            //if the extenstion is  validated
            if (fileAddStatus) {
              //if the file is   uploaded
              const newFileName = fileUrl; //new uploaded file
              const oldFileName = previousFileName; //old or existing file  name
              const updateProfileImage = await Patient.updateOne(
                //update new uploaded file
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //querry,
                {
                  $set: {
                    "personalInfo.profileImage": newFileName,
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateProfileImage.nModified != 0) {
                //if the schema is updated
                //delete the exist file from server
                const { message, deleteStatus } = await fileRemoveHandler(
                  oldFileName
                ); //this will delete the existing file  from server
                if (deleteStatus) {
                  //if the existing file is deleted  successfully  it will execute
                  console.log(`${message}`);
                  res.status(202).json({
                    message: "Profile image updated successfully",
                  });
                } else {
                  res.json({
                    message: "Existing file upload failed",
                  });
                }
              } else {
                res.json({
                  message: "Schema Update failed",
                });
              }
            } else {
              res.json({
                message: "New File upload failed",
              });
            }
          } else {
            res.json({
              message: `Only ${acceptedExtenstion + ""} are allowed`,
            });
          }
        } else {
          res.json({
            message: "User Not found",
          });
        }
      } else if (userType == "doctor") {
        //if the user type is doctor then it will execute
        const findUser = await Doctor.findOne(
          //find the doctor
          {
            _id: id,
            "officialInfo.isActive": true,
            "officialInfo.isDelete": false,
          }
        ).select("personalInfo.profileImage"); //find the patient and get the exist profile image file
        if (findUser) {
          const { profileImage } = findUser.personalInfo; //get the exist or previous profile image url from the
          const spliceFileName = profileImage.split("/");
          const previousFileName = spliceFileName[spliceFileName.length - 1]; //get the previous file name
          const acceptedExtenstion = ["jpg, jpeg, png"];
          const { fileAddStatus, fileUrl, extensionValidation } = fileUploader(
            profileImage,
            acceptedExtenstion,
            "patient"
          );

          if (extensionValidation) {
            //if the extenstion is  validated
            if (fileAddStatus) {
              //if the file is   uploaded
              const newFileName = fileUrl; //new uploaded file
              const oldFileName = previousFileName; //old or existing file  name
              const updateProfileImage = await Doctor.updateOne(
                //update new uploaded file
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //querry,
                {
                  $set: {
                    "personalInfo.profileImage": newFileName,
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateProfileImage.nModified != 0) {
                //if the schema is updated
                //delete the exist file from server
                const { message, deleteStatus } = await fileRemoveHandler(
                  oldFileName
                ); //this will delete the existing file  from server
                if (deleteStatus) {
                  //if the existing file is deleted  successfully  it will execute
                  console.log(`${message}`);
                  res.status(202).json({
                    message: "Profile image updated successfully",
                  });
                } else {
                  res.json({
                    message: "Existing file upload failed",
                  });
                }
              } else {
                res.json({
                  message: "Schema Update failed",
                });
              }
            } else {
              res.json({
                message: "New File upload failed",
              });
            }
          } else {
            res.json({
              message: `Only ${acceptedExtenstion + ""} are allowed`,
            });
          }
        } else {
          res.json({
            message: "User Not found",
          });
        }
      } else if (userType == "admin") {
        //if the user type is admin
        const findUser = await Admin.findOne({
          _id: id,
          "officialInfo.isActive": true,
          "officialInfo.isDelete": false,
        }).select("personalInfo.profileImage"); //find the patient and get the exist profile image file
        if (findUser) {
          const { profileImage } = findUser.personalInfo; //get the exist or previous profile image url from the
          const spliceFileName = profileImage.split("/");
          const previousFileName = spliceFileName[spliceFileName.length - 1]; //get the previous file name
          const acceptedExtenstion = ["jpg, jpeg, png"];
          const { fileAddStatus, fileUrl, extensionValidation } = fileUploader(
            profileImage,
            acceptedExtenstion,
            "patient"
          );

          if (extensionValidation) {
            //if the extenstion is  validated
            if (fileAddStatus) {
              //if the file is   uploaded
              const newFileName = fileUrl; //new uploaded file
              const oldFileName = previousFileName; //old or existing file  name
              const updateProfileImage = await Admin.updateOne(
                //update new uploaded file
                {
                  _id: id,
                  "officialInfo.isActive": true,
                  "officialInfo.isDelete": false,
                }, //querry,
                {
                  $set: {
                    "personalInfo.profileImage": newFileName,
                  },
                  $currentDate: {
                    "modificationInfo.updatedAt": true,
                  },
                }, //update
                { multi: true } //option
              );
              if (updateProfileImage.nModified != 0) {
                //if the schema is updated
                //delete the exist file from server
                const { message, deleteStatus } = await fileRemoveHandler(
                  oldFileName
                ); //this will delete the existing file  from server
                if (deleteStatus) {
                  //if the existing file is deleted  successfully  it will execute
                  console.log(`${message}`);
                  res.status(202).json({
                    message: "Profile image updated successfully",
                  });
                } else {
                  res.json({
                    message: "Existing file upload failed",
                  });
                }
              } else {
                res.json({
                  message: "Schema Update failed",
                });
              }
            } else {
              res.json({
                message: "New File upload failed",
              });
            }
          } else {
            res.json({
              message: `Only ${acceptedExtenstion + ""} are allowed`,
            });
          }
        } else {
          res.json({
            message: "User Not found",
          });
        }
      }
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
  userLoginController,
  updateExistingPasswordController,
  forgotPasswordController,
  verifyOtpOfResetPasswordController,
  resetPasswordController,
  SeeOnlyHisAppointment,
  seeOwnProfileController,
  updateOwnProfileController,
  updateProfilePictureAndDeleteExistOneController,
};
