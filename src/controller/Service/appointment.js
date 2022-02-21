const appointmentSchemaValidation = require("../../../validation/Service/appointment");
const Appointment = require("../../model/Service/Appointment/apponitment");
const Transiction = require("../../model/Service/Appointment/transiction");
const Doctor = require("../../model/User/Doctor/doctor");
const Patient = require("../../model/User/Patient/patient");
const generateAppointmentId = require("../../../utils/generateRandomUserID");
const {
  getTodayDate,
  getTodaysDateByIsoDateInput,
  getXDaysBefore,
} = require("../../../utils/dateController");
const sentMailer = require("../../../utils/sendMailer");
const SSLCommerz = require("ssl-commerz-node");
const PaymentSession = SSLCommerz.PaymentSession;
const shortid = require("shortid");

//dot env file data
const storeId = process.env.SSLCOMMERZ_STORE_ID; //get the store id
const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD; //get the store password
const serverUrl =
  process.env.SERVER_URL || `http://localhost:${process.env.PORT}`; //get the sever url
const clientUrl = process.env.CLIENT_URL || `http://localhost:3000`; //get the client url

//CREATE THE PAYMENT INSTANCE WITH SSL
const payment = new PaymentSession(true, storeId, storePassword); //create the payment instance

//create an appointment controller
const createAppointmentController = async (req, res) => {
  try {
    const { error } = appointmentSchemaValidation.validate(req.body); //validate the schema with joi
    if (error) {
      //if the schema validation failed then it will execute
      res.json({
        message: "Joi Validation failed",
        error,
      });
    } else {
      const { id: appointmentRequestUserId, email: loggedInUserMail } =
        req.user; //get the data from header
      const { doctorId, appointmentDate, fees, time } = req.body; //get the data from body
      const { name: patientName, contactNumber: patientContactNumber } =
        req.body.patientDetails; //get the patient data from body
      const negative = "N/A";
      // console.log(time);
      if (doctorId) {
        //check that if doctorId and request user object id exist or not
        const { userId: appointmentId } = generateAppointmentId("Appointment"); //get a random user id of appointment
        if (appointmentId) {
          //if the appointment_id auto generate then it will execute
          //check that is there have any other appointments on that day available or not
          const isAvailableAppointment = await Appointment.find({
            "appointmentDetails.appointmentDate": appointmentDate,
            appointmentRequestUser: appointmentRequestUserId,
            "appointmentDetails.time": time,
          });
          // console.log(isAvailableAppointment.length);
          if (isAvailableAppointment.length != 0) {
            res.json({
              message:
                "You have another appointment in this time of this following day please try again with another date",
            });
          } else {
            console.log(`HEllo`);
            // payment procedure start from here
            const txId = `APP${shortid.generate()}`; //generate a random txId
            //set the response url
            payment.setUrls({
              success: `${serverUrl}/appointment/payment/success?txId=${txId}&appointmentId=${appointmentId}`, //if the payment will success it will go to this link
              fail: `${serverUrl}/appointment/payment/failed`, //if the payment will failed then it will go to this link
              cancel: `${serverUrl}/appointment/payment/cancel`, // if the payment will cancel then it will go to this link
              ipn: `${serverUrl}/ipn`, // SSLCommerz will send http post request in this link
            });

            // Set order details
            payment.setOrderInfo({
              total_amount: +fees, // Number field
              currency: "BDT", // Must be three character string
              tran_id: txId, // Unique Transaction id
              emi_option: 0, // 1 or 0
              time: Date.now(), //payment time
            });

            //set customer info
            payment.setCusInfo({
              name: patientName,
              email: loggedInUserMail,
              add1: negative,
              city: negative,
              state: negative,
              postcode: negative,
              country: "Bangladesh",
              phone: patientContactNumber,
              fax: negative,
            });

            //set the shipping info
            payment.setShippingInfo({
              method: "No", //Shipping method of the order. Example: YES or NO or Courier
              num_item: 1,
            });

            // Set Product Profile
            payment.setProductInfo({
              product_name: "Appointment",
              product_category: "Medical",
              product_profile: "physical-goods",
            });

            // Initiate Payment and Get session key
            const isPay = await payment.paymentInit();
            // res.send (isPay["GatewayPageURL"])
            if (isPay.status == "SUCCESS") {
              //after payment method has finished now create the appointment
              const newAppointment = new Appointment({
                //create a new appointment
                ...req.body,
                "appointmentDetails.doctorDetails": doctorId,
                appointmentRequestUser: appointmentRequestUserId,
                "appointmentDetails.appointmentId": appointmentId,
                "appointmentDetails.appointmentDate": appointmentDate,
                "appointmentDetails.time": time,
              });
              const saveAppointment = await newAppointment.save(); //save the new appointment
              if (saveAppointment) {
                //if the appointment is save then it will execute
                //store this appointment into doctor's schema
                const { _id: NewAppointmentId } = saveAppointment; //get the object id of new create appointment
                const storeAppointmentToDoctor = await Doctor.updateOne(
                  //store the new appointment  object id as a reference in respected doctor schema
                  {
                    _id: doctorId,
                    "officialInfo.isActive": true,
                    "officialInfo.isDelete": false,
                  }, //querry
                  {
                    $push: {
                      "officialInfo.checkUpHistory.appointment":
                        NewAppointmentId,
                    },
                    $currentDate: {
                      "modificationInfo.updatedAt": true,
                    },
                  }, //update,
                  { multi: true } //option
                );

                if (storeAppointmentToDoctor.nModified != 0) {
                  const storeAppointmentToPatient = await Patient.updateOne(
                    //store the appointment into patient
                    {
                      _id: appointmentRequestUserId,
                      "officialInfo.isActive": true,
                      "officialInfo.isDelete": false,
                    }, //querry
                    {
                      $push: {
                        "officialInfo.checkUpHistory.appointment":
                          NewAppointmentId,
                      },
                      $currentDate: {
                        "modificationInfo.updatedAt": true,
                      },
                    }, //update
                    { multi: true } //option
                  );

                  if (storeAppointmentToPatient.nModified != 0) {
                    //if the appointment id is store in requested patient schema then it will execute
                    const findAppointmentRequester = await Patient.findOne({
                      _id: appointmentRequestUserId,
                    }).select("personalInfo.contact");
                    if (findAppointmentRequester) {
                      //  res.status(202).json({
                      //     message: "New Appointment has been created",
                      //     info: saveAppointment
                      // }) //if all is done then it will sent as a response
                      const { email: requesterEmail } =
                        findAppointmentRequester.personalInfo.contact;
                      const date = appointmentDate;
                      const message = `Your Appointment is confirmed!!! Appointment id: ${appointmentId}. Appointment Date: ${date}. For any enquiries call 09666-710678
                                            `;
                      // const {message:responseMessage, responseStatus} = await sentMailer("", requesterEmail, message, "Appointment Confirmation")

                      res.status(202).send(isPay["GatewayPageURL"]);
                      console.log(`New Appointment is confirmed`);

                      // if(responseStatus) {
                      //     // res.status(201).json({
                      //     //     message: "New Appointment is confirmed",
                      //     //     appointmentId,
                      //     //     mailResponseMessage: responseMessage
                      //     // })
                      //     res.status(202).send (isPay["GatewayPageURL"])
                      //     console.log(`New Appointment is confirmed`)
                      // }else {
                      //     // res.json({
                      //     //     message: "Your Appointment is confirmed",
                      //     //     appointmentId,
                      //     //     mailResponseMessage: "Mail sent failed",
                      //     // })
                      //     console.log(`Your Appointment is confirmed"`)
                      // }
                    } else {
                      //  res.json({
                      //     message: "New Appointment failed to update into patient schema"
                      // })
                      console.log(
                        `New Appointment failed to update into patient schema`
                      );
                    }
                  } else {
                    // res.json({
                    //     message: "New Appointment failed to update into patient schema"
                    // })
                    console.log(
                      `New Appointment failed to update into patient schema`
                    );
                  }
                } else {
                  // res.json({
                  //     message: "New Appointment failed to update into doctor schema"
                  // })
                  console.log(
                    `New Appointment failed to update into doctor schema`
                  );
                }
              } else {
                res.json({
                  message: "New Appointment creation failed",
                });
              }
            } else {
              res.json({
                message:
                  "Some thing is wrong with payment please try again later",
                resonse: `${isPay.failedreason}`,
              });
            }
          }
        } else {
          res.json({
            message: "Appoint id generate failed",
          });
        }
      } else {
        res.json({
          message: "Doctor or Request user object id required",
        });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({
      message: err.message,
    });
  }
};

//payment success controller
const appointmentPaymentSuccessController = async (req, res) => {
  try {
    const {
      tran_id: trxId,
      store_amount: netAmount,
      store_amount: getAmount,
      card_type: cardType,
      bank_tran_id: bankTxdId,
      tran_date: txDate,
      card_brand: cardBrand,
      store_id,
    } = req.body; //get the data from body

    const { appointmentId } = req.query; //get the data from query string

    const updateAppointment = await Appointment.updateOne(
      {
        "appointmentDetails.appointmentId": appointmentId,
        "others.isPayment": false,
        "others.isActive": true,
        "others.isDelete": false,
      }, //query
      {
        $set: {
          "others.isPayment": true,
        },
      }, //set
      { multi: true } //option
    );
    const appointmentData = await Appointment.findOne({
      "appointmentDetails.appointmentId": appointmentId,
      "others.isPayment": true,
      "others.isActive": true,
      "others.isDelete": false,
    }).select(`_id`);
    const { _id } = appointmentData; //get the appointment object id
    if (updateAppointment.nModified != 0) {
      //if appointment payment status updated then it will happen
      //create a transition  history
      const createTransitionHistory = new Transiction({
        "transictionDetails.trxId": trxId,
        "transictionDetails.netAmount": netAmount,
        "transictionDetails.getAmount": getAmount,
        "transictionDetails.cardType": cardType,
        "transictionDetails.bankTxdId": bankTxdId,
        "transictionDetails.txDate": txDate,
        "transictionDetails.cardBrand": cardBrand,
        "transictionDetails.store_id": store_id,
        appointmentId: _id,
      }); //create a instance of transaction history

      const saveTransactionHistory = await createTransitionHistory.save(); // save new transaction history
      if (saveTransactionHistory) {
        res
          .status(202)
          .redirect(
            `${clientUrl}/appointment/payment/success?appointmentId=${appointmentId}&txId=${trxId}`
          );
      }
    }
  } catch (err) {
    res.json({
      message: err.message,
      err,
    });
  }
};

//payment Failed controller
const paymentFailedController = async (req, res) => {
  try {
    const { error } = req.body; //get the error
    res.redirect(`${clientUrl}/appointment/payment/failed?err=${error}`);
  } catch (err) {
    res.json({
      message: err.message,
      err,
    });
  }
};

//see today's appointment  controller
const showTodaysAppointmentController = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getTodayDate(); //get the range of today's date
    const {
      date: dd,
      year: yy,
      month: mm,
    } = getTodaysDateByIsoDateInput(endOfDay); //get today's date

    const todaysDateFormate = `${yy}-${mm}-${dd}`; //set the today's date format
    const findAppointment = await Appointment.find(
      //find all today's appointment
      {
        "appointmentDetails.appointmentDate": {
          $gt: startOfDay,
          $lt: endOfDay,
        },
      }
    )
      .populate({
        path: "appointmentDetails.prescription",
        select: "prescriptionData",
        populate: {
          path: "doctorInfo",
          select: "_id",
        },
      })
      .populate({
        //get the appointment doctor details
        path: "appointmentDetails.doctorDetails",
        select: `-_id
             -personalInfo.profileImage 
             -officialInfo 
             -modificationInfo 
             -userType 
             -recoveryToken 
             -password -userId
              -personalInfo.sex`,
      })
      .populate({
        //get the appointment requested patient
        path: "appointmentRequestUser",
        select: "personalInfo",
      })
      .select("-others -modificationInfo")
      .sort({
        "appointmentDetails.appointmentDate": 1,
      }); //sort by appointment date

    if (findAppointment.length != 0 || findAppointment != null) {
      res.status(202).json({
        message: `Appointment Found of ${todaysDateFormate}`,
        data: findAppointment,
      });
    } else {
      res.json({
        message: `Appointment Not Found for ${todaysDateFormate} `,
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

//see last seven days appointment
const seeSevenDaysAppointment = async (req, res) => {
  try {
    const { dateFrom, dateTo } = getXDaysBefore(7); //get the date range of 7 days from 7 days to current date
    if (dateFrom && dateTo) {
      const findAppointment = await Appointment.find({
        "others.isDelete": false,
        "others.isActive": true,
      })
        .populate(
          //get the doctor data from ref
          {
            path: "appointmentDetails.doctorDetails",
            select: `
                             -personalInfo.profileImage 
                             -personalInfo.sex 
                             -personalInfo.profileImage 
                             -officialInfo -password 
                             -recoveryToken 
                             -modificationInfo `,
          }
        )
        .populate({
          path: "appointmentDetails.prescription",
          select: "prescriptionData",
          populate: {
            path: "doctorInfo",
            select: "_id",
          },
        })
        .populate({
          //get the requested user data
          path: "appointmentRequestUser",
          select: `
                        -personalInfo.profileImage
                        -officialInfo
                        -password
                        -recoveryToken
                        -modificationInfo`,
        })
        .select(
          `-others 
                        -modificationInfo`
        )
        .sort({ "appointmentDetails.appointmentDate": -1 });

      if (findAppointment) {
        const getSevenDaysAppointment = findAppointment.filter(
          (data) =>
            data.appointmentDetails.appointmentDate >= dateFrom &&
            data.appointmentDetails.appointmentDate <= dateTo
        );
        res.status(202).json({
          message: "Last 7 days all appointments found",
          appointment: getSevenDaysAppointment,
        });
      } else {
        res.json({
          message: "Appointment not found",
        });
      }
    } else {
      res.json({
        message: "Date not found",
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

//get appointment by id
const getAppointmentByIdController = async (req, res) => {
  try {
    const { id } = req.params; //get the id from params
    if (id) {
      const findAppointment = await Appointment.findOne({
        _id: id,
        "others.isDelete": false,
        "others.isActive": true,
      })
        .populate(
          //get the doctor data from ref
          {
            path: "appointmentDetails.doctorDetails",
            select: `
                             -personalInfo.profileImage 
                             -personalInfo.sex 
                             -personalInfo.profileImage 
                            -password 
                             -recoveryToken 
                             -modificationInfo `,
          }
        )
        .populate({
          //get the requested user data
          path: "appointmentRequestUser",
          select: `
                        -personalInfo.profileImage
                        -officialInfo
                        -password
                        -recoveryToken
                        -modificationInfo`,
        })
        .populate({
          path: "appointmentDetails.prescription",
          select: "prescriptionData",
          populate: {
            path: "doctorInfo",
            select: "_id",
          },
        }).select(`-others 
                        -modificationInfo`);

      if (findAppointment) {
        res.status(202).json({
          message: "Apponitment Found",
          data: findAppointment,
        });
      } else {
        res.json({
          message: "Requested appointment not found",
        });
      }
    } else {
      res.json({
        message: "Appoint object id required",
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

//see all appointment f
const showALlAppointmentController = async (req, res) => {
  try {
    const { startOfDay, endOfDay } = getTodayDate(); //get the range of today's date
    const {
      date: dd,
      year: yy,
      month: mm,
    } = getTodaysDateByIsoDateInput(endOfDay); //get today's date
    const todaysDateFormate = `${yy}-${mm}-${dd}`; //set the today's date format
    const findAppointment = await Appointment.find(
      //find all today's appointment
      {
        "others.isDelete": false,
        "others.isActive": true,
      }
    )
      .select("-modificationInfo -others")
      .populate({
        //get the appointment doctor details
        path: "appointmentDetails.doctorDetails",
        select: `-_id
             -personalInfo.profileImage 
             -officialInfo 
             -modificationInfo 
             -userType 
             -recoveryToken 
             -password -userId
              -personalInfo.sex`,
      })
      .populate({
        path: "appointmentDetails.prescription",
        select: "prescriptionData",
        populate: {
          path: "doctorInfo",
          select: "_id",
        },
      })
      .populate({
        //get the appointment requested patient
        path: "appointmentRequestUser",
        select: "personalInfo",
      })
      .sort({
        "appointmentDetails.appointmentDate": 1,
      }); //sort by appointment date

    if (findAppointment.length != 0 || findAppointment != null) {
      res.status(202).json({
        message: `All Appointment Found successfully till ${todaysDateFormate}`,
        data: findAppointment,
      });
    } else {
      res.json({
        message: `Appointment Not Found till ${todaysDateFormate} `,
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

//update appointment by id
const updateAppointmentById = async (req, res) => {
  try {
    const { id } = req.params; //get the id from params
    if (id) {
      const findAppointmentAndUpdate = await Appointment.updateOne(
        {
          _id: id,
          "others.isDelete": false,
          "others.isActive": true,
        }, //query
        {
          $set: req.body,
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        }, //update
        { multi: true } //option
      ); //find the appointment by id and update what by what came from req body
      if (findAppointmentAndUpdate.nModified != 0) {
        res.status(202).json({
          message: "Appointment is successfully updated",
        });
      } else {
        res.json({
          message: "Appointment update failed",
        });
      }
    } else {
      res.json({
        message: "Object Id required for appointment edit",
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

//delete appointment by id
const deleteAppointmentById = async (req, res) => {
  try {
    const { id } = req.params; //get the id from params
    if (id) {
      const findAppointMentAndDeleteTemp = await Appointment.updateOne(
        //find the appointment by id and delete it temporary
        {
          _id: id,
          "others.isDelete": false,
          "others.isActive": true,
        }, //query
        {
          "others.isDelete": true,
          "others.isActive": false,
        }, //upadate
        { multi: true } //option
      ); //find the appointment by id and delete it temporary
      if (findAppointMentAndDeleteTemp.nModified != 0) {
        res.getTodaysDateByIsoDateInput(202).json({
          message: "Appointment has successfully deleted",
        });
      } else {
        res.json({
          message: "Appointment Delete failed",
        });
      }
    } else {
      res.json({
        message: "Appointment Object Id required",
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

//export part
module.exports = {
  createAppointmentController,
  showTodaysAppointmentController,
  showALlAppointmentController,
  seeSevenDaysAppointment,
  updateAppointmentById,
  deleteAppointmentById,
  getAppointmentByIdController,
  appointmentPaymentSuccessController,
  paymentFailedController,
};
