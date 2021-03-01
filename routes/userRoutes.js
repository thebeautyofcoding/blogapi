const express = require('express')
const { requireSignin, authMiddleware } = require('../controllers/auth')
const { publicProfile, update, photo, read } = require('../controllers/user')

const router = express.Router()


router.get('/user/profile', requireSignin, authMiddleware, read)
router.put('/user/update', requireSignin, authMiddleware, update)
router.get('/user/:username', publicProfile)


router.get('/user/photo/:username', photo)


module.exports = router;