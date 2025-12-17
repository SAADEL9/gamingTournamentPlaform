import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.11.109:8080/api", // 192.168.11.1 adresse ip dyal pc
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;