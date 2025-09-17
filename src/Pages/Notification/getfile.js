import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";

const printPdf = (pdfUrl) => {
  const newWindow = window.open(pdfUrl, "_blank");
  if (newWindow) {
    newWindow.focus();
    newWindow.onload = () => {
      newWindow.load();
      newWindow.onafterprint = () => {
        newWindow.close();
      };
    };
  }
};

const getFile = async (id) => {
  const res = await GET(admin.token, `get_patient_file/${id}`);
  if (res.data !== null) {
    printPdf(`${imageBaseURL}/${res.data.file}`);
  } else {
    throw new Error("Không tìm thấy tệp");
  }
};

export default getFile;
