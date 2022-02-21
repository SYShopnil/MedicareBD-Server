const express = require("express");
const route = express.Router();

const authentication = require("../../../middleware/auth/authentication");
const authorization = require("../../../middleware/auth/authorization");

const {
  createOxygenCylenderService,
  //   updateOxygenCylenderByIdController,
  makeOxygenCylinderRequestController,
  deleteTemporaryOxygenCylenderByIdController,
  getAllOxygenServiceController,
  OxygenCylinderRequestApproveController,
  getAllOxygenUnApproveServiceRequestController
} = require("../../controller/Service/oxygenCylender");

//post
// route.post('/create',authentication, authorization(["admin"]), createOxygenCylenderService)
route.post("/create",  authentication, authorization(["admin"]), createOxygenCylenderService);
route.post("/request/approve/:id",  authentication, authorization(["admin"]), OxygenCylinderRequestApproveController );

//put
// route.put(
//   "/update/:id",
//   authentication,
//   authorization(["admin"]),
//   updateOxygenCylenderByIdController
// );
route.put("/request/service", authentication, authorization(["patient"]),  makeOxygenCylinderRequestController);
route.put(
  "/delete/temporary/:id",
  authentication,
  authorization(["admin"]),
  deleteTemporaryOxygenCylenderByIdController
);

//get
route.get("/get/all", getAllOxygenServiceController);
route.get("/get/all/unApproved/request", authentication, authorization(["admin"]), getAllOxygenUnApproveServiceRequestController);

//export part
module.exports = route;
