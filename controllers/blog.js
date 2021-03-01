
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types
const AppError = require('../utils/appError')
const catchAsync= require('../utils/catchAsync')

const User = require('../models/user')
const {errorHandler} = require('./dbErrorHandler')
const Category = require('../models/category')
const Tag = require('../models/tag')
const _ = require('lodash')
const slugify = require('slugify')
const formidable = require('formidable')
const fs =require('fs')
const { smartTrim } = require('../helpers/blog')
const stripHtml = require('string-strip-html')
const category = require('../models/category')
const { createIndexes } = require('../models/user')
const path=require('path')
exports.create =  async (req, res, next) => {

    let form = new formidable.IncomingForm()
    form.keepExtensions = true;

    console.log("26!!!", req.user)

  

  
  

    form.parse(req, async (err, fields, files) => {
        let { title, body, categories, tags } = fields

        const { photo } = files
       let _id;
      let  user;
        
  if (req.user.user) {
           _id  = req.user.user._id
     user = await User.findById({_id})
    } else {
          _id  = req.user._id
     user = await User.findById({_id})
    }
    

       
    
       
        
    
        
        if (photo) {
            if (photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image could not be uploaded. Choose Image smaller in Size'
                })
            }

        }

        if (!photo) {
            return res.status(400).json({
                    error: 'Choose a Photo for your blog'
                })
        }
        
        
        if (!title || title.length === 0) {
            return res.status(400).json({
                error: 'Title is required'
            })


        }
        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least 1 category is required'
            })


        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least 1 tag is required'
            })


        }
        if (!body || body.length < 10) {
            return res.status(400).json({
                error: 'Blog post must be at least 10 characters long'
            })
        }

   
 
        let blog = new Blog()

        blog.title = title;
        blog.body = body
        blog.slug = slugify(title).toLowerCase();
      
     
       

       
        // categoriesArr.forEach((cat)=>blog.categories.push(cat))
        tags = tags.split(',')
        categories = categories.split(',')
       

        blog.categories= categories

        blog.tags= tags
  
   
      
        blog.postedBy = _id
        if(files && files.photo)
        { blog.photo.data = fs.readFileSync(files.photo.path) }

        
         
        
        if(files && files.photo)
        {blog.photo.contentType = files.photo.type;}
       
        blog.excerpt = stripHtml(smartTrim(body, 320, ' ', '...')).result
        blog.mdesc = stripHtml(body.substring(0, 160)).result
        

        blog.save().then(result => {
            res.status(201).json(result)
        }).catch((err) => {
            console.log(err)
            return res.status(400).json({
                
                error: err
            })
        })

        //   blog.save((err) => {
        //     if (err) {
        //         return res.status(400).json({
        //             error: errorHandler(err)
        //         })
        //     }
        //     res.status(201).json(blog)
        //     })
        // })

    })
    }
    
exports.list = catchAsync(async (req, res, next) => {
       console.log('116')
    const blogs = await Blog.find().populate('postedBy')
    console.log('116')
    if (!blogs.length === 0) return next(new AppError('No Blogs found'), 400)
    
    blogsTotal = blogs.length
console.log('120gemacht')
    res.status(200).json({
        message: 'success',
        
            blogs, blogsTotal
        
    })
})

exports.photo = async (req, res) => {
    
    const slug = req.params.slug.toLowerCase();
  
        const blog = await Blog.find({ slug }).select('photo').catch(err => res.status(400).json({
        error:err
    }))
    
    
    
   
    res.set('Content-Type', blog[0].photo.contentType)
    return res.send(blog[0].photo.data)
    } 
    
    




exports.listAllBlogsAndCategoriesAndTags = async (req, res) => {

    console.log('189', req.body.data)
   
    let limit = req.body.data.limit ? parseInt(req.body.data.limit) :10
    let skip = (req.body.data.skip) ? parseInt(req.body.data.skip) : 0

    

    let blogs;
    let categories
    let tags

    blogs = await Blog.find({}).populate('postedBy', '_id name username profile').populate('categories').populate('tags').sort({ createdAt: -1 }).limit(limit).skip(skip).select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
    console.log('159!!!',blogs)

    if (blogs) {
        categories = await Category.find().catch(err=> res.status(400).json({error:err}))
        tags = await Tag.find().catch(err=> res.status(400).json({error:err}))
        
        console.log('164gemacht')

        return res.status(201).json({categories, blogs, tags, blogSize: blogs.length})
    } else {
        res.status(400).json({message:'FAILED'})
    }
}
    

exports.read = async (req, res) => {
           console.log('slug', req.params.slug)
    const slug = req.params.slug.toLowerCase()

    const blog =  await Blog.findOne({ slug })
        .populate('categories')
        .populate('tags')
        .populate('postedBy', '-photo').catch(err=>res.status(400).json({message:'failed'}))
    
    
    console.log('DONE123', blog)
    return res.status(200).json(blog)
    }



exports.countBlogs = async(req, res) => {
    const blogNumber = await Blog.find().count().catch(err => res.status(400).json({ message: 'failed' }))
    
    res.status(200).json({blogNumber})
}

exports.listByUser = async (req, res) => {
   
    const user = await User.findOne({ username: req.params.username }).catch(err => res.status(400).json({ error: err }))
    
    const blogs = await Blog.find({ postedBy: user._id })
        .populate('categories')
        .populate('tags')
        .populate('postedBy', '-photo')
        .select('-photo')
        .catch(err => res.status(400).json({ error: err }))
    
   

   return res.status(200).json({
            blogs
        })
    


    
    
    

    

}

exports.remove = async (req, res) => {
    const slug = req.params.slug.toLowerCase();

    const deleted = await Blog.findOneAndDelete({ slug }).catch(err => res.status(400).json({ error: err }))
    

    return res.status(200).json({message: 'Blog deleted successfully'})
}

exports.update = async (req, res) => {
    console.log('HALLO')
    let slug = req.params.slug.toLowerCase();
  
    let oldBlog = await Blog.findOne({ slug }).catch(err => res.status(400).json({ error: err }))
     
    let form = new formidable.IncomingForm()
    form.keepExtensions = true;

    form.parse(req, (err, fields, files) => {

        const {photo}= files
        const {title, body, categories, tags}= fields

         if (photo) {
            if (photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image could not be uploaded. Choose Image smaller in Size'
                })
            }

        }


        
        
        if (!title || title.length === 0) {
            return res.status(400).json({
                error: 'Title is required'
            })


        }
        if (!categories || categories.length === 0) {
            return res.status(400).json({
                error: 'At least 1 category is required'
            })


        }

        if (!tags || tags.length === 0) {
            return res.status(400).json({
                error: 'At least 1 tag is required'
            })


        }
        if (!body || body.length < 10) {
            return res.status(400).json({
                error: 'Blog post must be at least 15 characters long'
            })
        }
        let slugBeforeMerging = oldBlog.slug;



        oldBlog = _.merge(oldBlog, fields)
        oldBlog.slug = slugBeforeMerging
        
 
        


        if (body) {
            oldBlog.excerpt = smartTrim(body, 320, ' ', '...')
            oldBlog.desc = stripHtml(body.substring(0,160))
        }

        if (categories) {
            oldBlog.categories = categories.split(',')
            
        }
        if (tags) {
            oldBlog.tags=tags.split(',')
        }

        if (files.photo) {
            if (files.photo.size > 100000) {
                return res.status(400).json({
                    error:'Image could not be uploaded. Size to big.'
                })
            }
            oldBlog.photo.data = fs.readFileSync(files.photo.path)
            oldBlog.photo.contentType=files.photo.type
        }

        console.log('272', oldBlog)

        oldBlog.save((err, result) => {
            if (err)  {res.status(400).json({
                error:err
            })}else
            
            {res.status(201).json(result)}
        })
    })
}


exports.remove = async(req, res) => {
    const slug = req.params.slug;
    await Blog.findOneAndRemove({ slug }).catch(err => {return res.status(400).json({ error: err })})
    

    return res.json(200).json({
        message:'blog deleted successfully'
    })
}

exports.listRelated = async (req, res) => {
 
    console.log('337', req.body._id)
    let limit = req.body.limit ? parsInt(req.body.limit) : 3
    


    const blogs = await Blog.find({ _id: { $ne:req.body._id }, categories: { $in: req.body.categories } })
       
        .limit(limit)
        .populate('postedBy', '_id name username profile')
        .select('title slug excerpt postedBy createdAt updatedAt')
        .catch(err => {
            console.log('348!!!', err)
            res.status(400).json({
        error:' No blogs found'
        })})
    
    console.log('349', blogs)
    
    return res.status(200).json(blogs)
}


exports.listSearch = async (req, res) => {
    console.log('313!!!')
    const { search } = req.query;
    console.log('314', search)
    if (search) {
       const blogs= await Blog.find({
            $or:[{title:{$regex:search, $options:'i'}}, {body: {$regex: search, $options: 'i'}}]
       }).catch(err => res.status(400).json({ error: err }))
           
        //    .select('-photo -body')
            
        
            
         return res.status(200).json(blogs)
    }
   
}


exports.listSearchSuggs = async (req, res) => {
    console.log('313!!!')
    const { search } = req.query;
    console.log('314', search)
    if (search) {
       const blogs= await Blog.find({
            $or:[{title:{$regex:search, $options:'i'}}, {body: {$regex: search, $options: 'i'}}]
       }).catch(err => res.status(400).json({ error: err }))
           
        //    .select('-photo -body')
             blogs.map((blog) => {
            blog.body= stripHtml(blog.body).result
            blog.title = stripHtml(blog.title).result
           
      })
        console.log('451', blogs)
            
         return res.status(200).json(blogs)
    }
   
}
