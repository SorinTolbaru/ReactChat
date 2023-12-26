const express = require("express");
const cors = require("cors");


const app = express();
app.use(cors());
app.use(express.json());


const server = app.listen(5000,'0.0.0.0', () => {
    console.log("Server running on port http://localhost:5000");

})