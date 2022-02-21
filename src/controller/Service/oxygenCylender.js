const oxygenCylenderSchemaValidation = require("../../../validation/Service/oxygenCylenderService");
const OxygenCylinderService = require("../../model/Service/OxygenCylender/oxygenCylender");
const OxygenCylinderRequest = require("../../model/Service/OxygenCylender/oxygenCylenderReq");


//create a oxygenCylender service
const createOxygenCylenderService = async (req, res) => {
  try {
    const { error } = oxygenCylenderSchemaValidation.validate(req.body); //validate the schema
    if (error) {
      res.json({
        message: "Joi Validation error",
        error,
      });
    } else {
      const checkExistService = await OxygenCylinderService.find({
        "other.isDelete": false,
        "other.isActive": true,
      }); //check that is there have any service exist or not
      if (checkExistService.length == 0) {
        //if there don't have any service exist in database then it will happen
        //create a new oxygen service
        const newService = new OxygenCylinderService(req.body); //create a instance
        const saveService = await newService.save(); //save
        if (saveService) {
          //if it is save in data base then it will execute
          res.status(201).json({
            message: "New Oxygen Cylinder service has been created",
            data: saveService,
          });
        } else {
          res.json({
            message: "Oxygen Service creation failed",
          });
        }
      } else {
        //if the oxygen cylender service exist then it will happen
        //update exist oxygen service
        // const {amount} = req.body //get the amount and update it
        const updateOxygenCylenderAmount =
          await OxygenCylinderService.updateOne(
            {
              "other.isDelete": false,
              "other.isActive": true,
            }, //query
            {
              $inc: {
                amount: req.body.amount,
              },
              $currentDate: {
                "modificationInfo.updatedAt": true,
              },
            }, //update
            { multi: true } //option
          );
        if (updateOxygenCylenderAmount.nModified != 0) {
          res.status(202).json({
            message: "Oxygen cylinder updated successfully",
          });
        } else {
          res.json({
            message: "Oxygen cylinder update failed",
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

// //update oxygenCylender service by id
// const updateOxygenCylenderByIdController = async (req, res) => {
//   try {
//     const { id } = req.params; //get the id from params
//     if (id) {
//       const { amount } = req.body; //get the amount and update it
//       const updateOxygenCylenderAmount = await OxygenCylinderService.updateOne(
//         {
//           _id: id,
//           "other.isDelete": false,
//           "other.isActive": true,
//         }, //query
//         {
//           $inc: {
//             amount: amount,
//           },
//           $currentDate: {
//             "modificationInfo.updatedAt": true,
//           },
//         }, //update
//         { multi: true } //option
//       );
//       if (updateOxygenCylenderAmount.nModified != 0) {
//         res.status(202).json({
//           message: "Oxygen cylinder updated successfully",
//         });
//       } else {
//         res.json({
//           message: "Oxygen cylinder update failed",
//         });
//       }
//     } else {
//       res.json({
//         message: "Oxygen cylender service object id is required",
//       });
//     }
//   } catch (err) {
//     console.log(err);
//     res.json({
//       message: err.message,
//       err,
//     });
//   }
// };

//approve oxygen cylinder service request
const OxygenCylinderRequestApproveController = async (req, res) => {
  try {
    const {id:requestId} = req.params //get the oxygen cylinder request id from params
    const { amount: inputAmount, cylinderId:oxygenCylinderId } = req.body; //get the amount of oxygen
    const findOxygenServiceAvailable = await OxygenCylinderService.findOne({
      _id: oxygenCylinderId,
      "other.isDelete": false,
      "other.isActive": true,
    }); //find the service     }catch(err) {
    if (findOxygenServiceAvailable) {
      const { amount: leftAmount } = findOxygenServiceAvailable; //find the amount of oxygen  left
      if (leftAmount >= inputAmount) {
        const reduceAmount = await OxygenCylinderService.updateOne(
          {
            _id: oxygenCylinderId,
            "other.isDelete": false,
            "other.isActive": true,
          }, //query
          {
            $inc: {
              amount: -inputAmount,
            }
          }, //update
          { multi: true } //option
        );
        if (reduceAmount.nModified != 0) {
          //delete the request
              const findRequest = await OxygenCylinderRequest.updateOne (
                {
                  _id: requestId,
                  "others.isDelete": false,
                  "others.isActive": true,
                  "requestInfo.isApproved": false
                }, //querry
                {
                  $set: {
                    "others.isDelete": true,
                    "others.isActive": false,
                    "requestInfo.isApproved": true
                  }
                }, //update
                {multi: true} //option
              )
              if (findRequest) {
                 res.status(202).json({
                  message: "Oxygen service is successfully approved",
                });
              }else  {
                res.json({
                  message: "Oxygen cylinder request approved failed"
                })
              }
        } else {
          res.json({
            message: "Amount reduce failed",
          });
        }
      } else {
        res.json({
          message: "Requested amount is not in stock",
        });
      }
    } else {
      res.json({
        message: "Oxygen service not available",
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

//make a oxygen cylinder request
const makeOxygenCylinderRequestController = async (req, res) => {
  try {
    const {id:patientId} = req.user //get the request login user id
    const {amount:provideAmount} = req.body.requestInfo //get the data from body
    const {cylinderId} = req.body //get the oxygen cylinder object id
    if (patientId) { //if the patient id is found then it will execute
      const findOxygenCylinderAvailable = await OxygenCylinderService.findOne ({
        "_id": cylinderId,
        "other.isDelete": false,
        "other.isActive": true
      })
      if (findOxygenCylinderAvailable) {
        const {amount:currentAmount} = findOxygenCylinderAvailable //get the current amount 
        // console.log(amount);
        if (currentAmount >= provideAmount ) { //check that is provided amount is available or  not
           const createNewService =  new OxygenCylinderRequest({
            ...req.body,
            "requestUseInfo.reqUserInfo": patientId, //this is the logged in user id 
            "requestInfo.cylinderId" : cylinderId //this is the cylinder service id 
          })
          const saveNewService = await createNewService.save() //save the new service request
          if (saveNewService) { //if the new service has been successfully granted then it will happen
            res.status(201).json({
              message: "New Oxygen Cylinder service request has been accepted. Please wait for approval from an admin"
            })
          }else {
            res.json({
              message: "New Oxygen Cylinder service creation failed"
            })
          }
        }else {
          res.json ({
            message: "Requested amount of oxygen not available"
          })
        }
      }else {
        res.json({
          message: "Oxygen cylinder not found"
        })
      }
    }else {
      res.json({
        message: "Patient id is required"
      })
    }
  }catch (err) {
    console.log(err);
    res.json({
      message: err.message
    })
  }
}

//get all oxygen service  un approve request 
const getAllOxygenUnApproveServiceRequestController = async (req, res) => {
  try {
    const findUnApproveOxygenServiceReq = await OxygenCylinderRequest.find({
      "others.isDelete": false,
      "others.isActive": true,
      "requestInfo.isApproved": false
    }).populate({ //get only the name of the patient logged in
      path: "requestUseInfo.reqUserInfo",
      select: `personalInfo.firstName 
                personalInfo.lastName 
                userId `
    }).select("requestUseInfo requestInfo")
    if (findUnApproveOxygenServiceReq) { //if the unapproved service found the
      console.log(findUnApproveOxygenServiceReq);
      res.status(202).json({
        message: `${findUnApproveOxygenServiceReq.length} found`,
        data: findUnApproveOxygenServiceReq
      })
    }else {
      res.json({
        message: "Oxygen cylinder service request failed"
      })
    }
  }catch (err) {
    console.log(err);
    res.json({
      message: err.message
    })
  }
}

//delete oxygenCylender service by id
const deleteTemporaryOxygenCylenderByIdController = async (req, res) => {
  try {
    const { id } = req.params; //get the id from params
    if (id) {
      const updateOxygenCylenderAmount = await OxygenCylinderService.updateOne(
        {
          _id: id,
          "other.isDelete": false,
          "other.isActive": true,
        }, //query
        {
          $set: {
            "other.isDelete": true,
            "other.isActive": false,
          },
          $currentDate: {
            "modificationInfo.updatedAt": true,
          },
        }, //update
        { multi: true } //option
      );
      if (updateOxygenCylenderAmount.nModified != 0) {
        res.status(202).json({
          message: "Oxygen cylinder deleted temporary successfully",
        });
      } else {
        res.json({
          message: "Oxygen cylinder deleted temporary  failed",
        });
      }
    } else {
      res.json({
        message: "Oxygen cylinder service object id is required",
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

//get all oxygen cylinder service controller
const getAllOxygenServiceController = async (req, res) => {
  try {
    const findOxygenCylinder = await OxygenCylinderService.find({
      "other.isDelete": false,
      "other.isActive": true,

    }).select(`-other
            -modificationInfo`);

    if (findOxygenCylinder) {
      res.status(202).json({
        message: `${findOxygenCylinder.length} oxygen cylender request found`,
        data: findOxygenCylinder,
      });
    } else {
      res.json({
        message: "No Oxygen cylinder service found",
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
  createOxygenCylenderService,
  //   updateOxygenCylenderByIdController,
  makeOxygenCylinderRequestController,
  deleteTemporaryOxygenCylenderByIdController,
  getAllOxygenServiceController,
  OxygenCylinderRequestApproveController,
  getAllOxygenUnApproveServiceRequestController
};
