const express = require('express')

const router = express.Router()
const { create, list, read } = require('../controllers/tag')



router.post('/tag', create);
router.get('/tags', list)
router.get('/tags/:slug', read)

module.exports = router;