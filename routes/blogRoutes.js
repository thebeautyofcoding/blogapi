const express = require('express')

const {adminMiddleware, requireSignin, validateToken, authorizedToUpdateAndDelete, authMiddleware} = require('../controllers/auth')
const router = express.Router()
const { create, list, photo,listAllBlogsAndCategoriesAndTags, read, countBlogs, listByUser, remove, update, listSearch, listRelated, listSearchSuggs} = require('../controllers/blog')
router.get("/blogs/search", listSearch)

router.get("/blogs/search-suggs", listSearchSuggs)

router.get("/blogs/:slug", read)


router.get('/blogs-count', countBlogs)
router.get("/blog/photo/:slug", photo)
router.post("/blogs-categories-tags", listAllBlogsAndCategoriesAndTags)
router.get('/blogs', list)
router.get('/:username/blogs', listByUser)
router.put('/user/blog/:slug',requireSignin, authMiddleware, authorizedToUpdateAndDelete,  update)
router.post('/user/blog', requireSignin, authMiddleware, create)
router.delete('/user/blog/:slug', requireSignin, authMiddleware, authorizedToUpdateAndDelete, remove)
router.delete('/blog/:slug',requireSignin, adminMiddleware, authorizedToUpdateAndDelete, remove)
router.put('/blog/:slug', requireSignin, authMiddleware,  update)
router.post('/blogs/related', listRelated)







module.exports=router