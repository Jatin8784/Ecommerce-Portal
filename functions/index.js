const {setGlobalOptions} = require("firebase-functions/v2");
const {onRequest} = require("firebase-functions/v2/https");
const express = require("express");
const cors = require("cors");

setGlobalOptions({maxInstances: 10});

const app = express();

app.use(cors({origin: true}));
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Ecommerce API Running 🚀");
});

// Example API Route
app.get("/api/test", (req, res) => {
  res.json({message: "Backend Connected Successfully ✅"});
});

exports.api = onRequest(app);
