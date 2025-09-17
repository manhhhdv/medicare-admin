﻿import { ADD } from "./ApiControllers";
import admin from "./admin";

const Logout = async () => {
  let res = await ADD(admin.token, "logout", {});
  localStorage.removeItem("admin");
  localStorage.removeItem("isChecked");
  localStorage.removeItem("selectedClinic");
  localStorage.removeItem("selectedClinicId");
  window.location.reload();
  setTimeout(() => {
    window.location.reload("/");
  }, 1000);
  return res;
};

export default Logout;
