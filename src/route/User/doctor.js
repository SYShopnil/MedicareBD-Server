const express = require("express");
const route = express.Router();
const {
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
} = require("../../controller/User/doctor");

const authentication = require("../../../middleware/auth/authentication");
const authorization = require("../../../middleware/auth/authorization");

//post
route.post(
  "/create",
  createDoctorController
);
route.post(
  "/update/:id",
  authentication,
  authorization(["admin", "doctor"]),
  editDoctorByIdController
);
route.post(
  "/delete/:id",
  authentication,
  authorization(["admin"]),
  deleteDoctorByIdController
);

//get
route.get(
  "/get/all",
  authentication,
  authorization(["admin", "doctor", "patient"]),
  getAllDoctorController
);
route.get("/get/individual/:id", getIndividualDoctorByIdController);
route.get(
  "/get/today/all/appointment",
  authentication,
  authorization(["admin", "doctor"]),
  seeTodaysAppointmentController
);
route.get(
  "/get/next/seven/days/appointment",
  authentication,
  authorization(["doctor"]),
  seeNextSevenAppointmentController
);
route.get("/get/specialized", getThreeSpecialDoctorController);
route.get("/get/by/category/:category", showDoctorByCategoryController);
route.get("/get/all/category", getDoctorCategoryController)

module.exports = route;
