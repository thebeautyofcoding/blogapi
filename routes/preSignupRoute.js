
const { preSignup }= require('../controllers/auth');


const express = require("express");
const router = express.Router();


router.post("/pre-signup", preSignup)

module.exports = router;