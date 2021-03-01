const express = require('express')

const router = express.Router()
const { create, list, read } = require('../controllers/category')

router.get('/categories/:slug',read)

router.post('/category', create);
router.get('/categories', list)


module.exports = router;