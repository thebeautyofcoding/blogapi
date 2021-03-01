const express = require("express")
const router = express.Router()

const {forgotPassword, resetPassword, googleLogin}= require('../controllers/auth')

router.put('/forgot-password', forgotPassword)

router.put('/reset-password' , resetPassword)

router.post('/google-login', googleLogin)



module.exports = router