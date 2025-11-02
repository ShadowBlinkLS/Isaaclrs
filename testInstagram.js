import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const username = "isaaclrs";
const url = `https://instagram-statistics-api.p.rapidapi.com/community?url=https%3A%2F%2Fwww.instagram.com%2F${username}%2F`;


const res = await fetch(url, {
  headers: {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "instagram-statistics-api.p.rapidapi.com",
  },
});

console.log("Status:", res.status);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
