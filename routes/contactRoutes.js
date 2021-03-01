const express = require("express")
const { contactForm, contactBlogAuthForm } = require("../controllers/form")
const router = express.Router()

router.post('/contact',  contactForm)

router.post('/contact-blog-author',  contactBlogAuthForm)






module.exports = router