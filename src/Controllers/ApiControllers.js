import api from "./api";
import GenerateToken from "./token";
import axios from "axios";

const handleSessionExpiration = (error) => {
  if (
    error.response &&
    error.response.data &&
    error.response.data.response === 401 &&
    error.response.data.status === false &&
    error.response.data.message === "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  ) {
    console.error(error.response.data.message);
    setTimeout(() => {
      localStorage.removeItem("admin");
      window.location.reload();
    }, 2000);
    return {
      sessionExpired: true,
      message: "Session expired. Please log-in again.",
    };
  }
  throw error;
};

const GET = async (token, endPoint) => {
  var config = {
    method: "get",
    maxBodyLength: Infinity,
    url: `${api}/${endPoint}`,
    headers: {
      Authorization: token ? GenerateToken(token) : "",
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
  };

  try {
    console.log("Making GET request to:", `${api}/${endPoint}`);
    const response = await axios(config);
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.error("API endpoint not found:", `${api}/${endPoint}`);
    } else {
      console.error("API Error:", {
        endpoint: endPoint,
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    return handleSessionExpiration(error);
  }
};

const ADD = async (token, endPoint, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${api}/${endPoint}`,
    headers: {
      Authorization: GenerateToken(token),
      "Content-Type": "multipart/form-data",
      'Accept': 'application/json',
    },
    data: data,
    timeout: 30000,
  };

  try {
    console.log("Making POST request to:", `${api}/${endPoint}`);
    const response = await axios(config);
    if (response.data) {
      return response.data;
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("API Error:", {
      endpoint: endPoint,
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    return handleSessionExpiration(error);
  }
};

const ADDMulti = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: GenerateToken(token),
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return handleSessionExpiration(error);
  }
};

const UPDATE = async (token, endPoint, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${api}/${endPoint}`,
    headers: {
      Authorization: GenerateToken(token),
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return handleSessionExpiration(error);
  }
};

const DELETE = async (token, endPoint, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: `${api}/${endPoint}`,
    headers: {
      Authorization: GenerateToken(token),
      "Content-Type": "application/json",
    },
    data: data,
  };
  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return handleSessionExpiration(error);
  }
};

const UPLOAD = async (token, url, data) => {
  var config = {
    method: "post",
    maxBodyLength: Infinity,
    url: url,
    headers: {
      Authorization: GenerateToken(token),
      "Content-Type": "multipart/form-data",
    },
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    return handleSessionExpiration(error);
  }
};

export { GET, ADD, DELETE, UPDATE, UPLOAD, ADDMulti };
