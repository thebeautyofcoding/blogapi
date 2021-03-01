const Tag = require('../models/tag')
const slugify = require('slugify')
const Blog = require('../models/blog')
const {errorHandler} = require('./dbErrorHandler')


exports.create = (req, res) => {
    const { name } = req.body;
   
    let slug = slugify(name).toLowerCase()
   
    
    let tag = new Tag({ name, slug })
  
    
    

  
    tag.save((err, data) => {
        if (err) {
            return res.status(400).json({
            error:err
            })
        }
      
       return res.status(201).json(data)
    })
}


exports.list = async (req,res) => {
    let tags = await Tag.find({}).catch(err => res.status(400).json({
        error: errorHandler(err)
    }))

    res.status(200).json(tags)
    
}

exports.remove = (req, res) => {
    const slug = req.params.slug.toLowerCase()
    

    Tag.findOneAndRemove({ slug }).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error:err
            })
        }
        res.json({
            message:'Category has been deleted successfully'
        })
    })
}

exports.read = (req, res) => {
    if (req.params.slug) {
        const slug = req.params.slug.toLowerCase()
    
    Tag.findOne({ slug }).exec((err, tag) => {
        if (err) {
            return res.status(400).json({
       
            })
        }
        // res.json(tag)
  
     Blog.find({ tags: tag })
            .populate('categories', '_id name slug')
            .populate('tags', '_id name slug')
            .populate('postedBy', '_id name')
            .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
            .exec((err, data) => {
                if (err) {
                    return res.status(400).json({
                    error: errorHandler(err)
                            
            })
                } else {
                    res.status(200).json({tag: tag, blogs: data})
                }
              
            })
    
      })
    }
}
