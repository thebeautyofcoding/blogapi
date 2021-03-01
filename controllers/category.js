const Category = require('../models/category')
const slugify = require('slugify')
const Blog = require('../models/blog')
const {errorHandler} = require('./dbErrorHandler')


exports.create = (req, res) => {
    const { name } = req.body;
   
    let slug = slugify(name).toLowerCase()
    console.log(slug)
    
    let category = new Category({ name, slug })
  
    
    

    console.log(category)
    category.save((err, data) => {
        if (err) {
            return res.status(400).json({
            error:err
            })
        }
      
       return res.status(201).json(data)
    })
}


exports.list = async (req,res) => {
    let categories = await Category.find({}).catch(err => res.status(400).json({
        error: errorHandler(err)
    }))

    res.status(200).json(categories)
    
}


exports.read=async(req, res)=> {
    const slug = req.params.slug.toLowerCase();
    const category = await Category.findOne({ slug }).catch(err => res.status(400).json({ messaged: 'failed so hard' }))
 
    const blogs= await Blog.find({ categories: category })
        .populate('categories', '_id name slug')
        .populate('tags', '_id name slug')
        .populate('postedBy', '_id name')
        .select('_id title slug excerpt categories postedBy tags createdAt updatedAt')
        .catch(err=>res.status(400).json({error:err}))
    console.log('50!!!', blogs, category)
    res.status(200).json({
        category, blogs
    })
}