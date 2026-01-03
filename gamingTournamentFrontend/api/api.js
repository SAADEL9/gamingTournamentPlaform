import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api", // Pour local: localhost. Pour mobile: utiliser l'IP (ex: 192.168.1.110 ou 192.168.11.1)
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;