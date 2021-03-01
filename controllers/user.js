const User = require('../models/user')
const Blog = require('../models/blog')
const _ = require('lodash')
const formidable = require('formidable')

const fs=require('fs')

exports.read = (req, res) => {
    console.log('9!!!', req.profile)
    return res.status(200).json(req.profile)
}
exports.publicProfile = async (req, res) => {
    console.log('YESSSS')
    let username = req.params.username;

    console.log('YESSSS', username)


    const userFromDb = await User.findOne({ username }).catch(err => res.status(400).json({
        error:'No User found / Something went wrong'
    }))
    console.log('21!!!', userFromDb)
    const blogs = await Blog.find({ postedBy: userFromDb._id })
        .populate('categories')
        .populate('tags')
        .populate('postedBy', '_id, name')
        .limit(10)
    .catch(err => res.status(400).json({ error: err }))

    userFromDb.password = undefined;
    console.log('25!!!', userFromDb, blogs)
    res.json({
        userFromDb, blogs
    })
        
        

}

exports.update = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtension = true;


    form.parse(req, async(err, fields, files) => {
        
        if (err) {
            return res.status(400).json({
                error:'Photo could not be uploaded'
            })
        }
        let user = req.profile;

        user = _.extend(user, fields)
        


        if (fields.password && fields.password.length < 6) {
            return res.status(400).json({
                error: 'Password should be at least 6 characters long'
            })

        }
        if (fields.username && fields.username.length < 3 || !fields.username) {
            return res.status(400).json({
                error:'Username should be at least 3 characters long'
            })
        }
           if (fields.name && fields.name.length < 3 || !fields.name) {
            return res.status(400).json({
                error:'Name should be at least 3 characters long'
            })
        }
        if (!fields.email) {
            return res.status(400).json({
                error:'Please provide a valid email'
            })
        }

        if (files.photo) {
            if (files.photo.size > 1000000) {
                return res.status(400).json({
                    error: 'Image should be less than 1 mb'
                })
            }
            user.photo.data = fs.readFileSync(files.photo.path)
            user.photo.contentType=files.photo.type
        } 


         savedUser = await user.save().catch(err => res.status(400).json({
            error: err
        }))

        savedUser.password = undefined;
        res.status(201).json(savedUser)
    })
}

exports.photo = async(req, res) => {
    
    const username = req.params.username;
    const user = await User.findOne({ username }).catch(err => res.status(400).json({ error: err }))
console.log('104', user.photo.data)
  
        
        res.set('Content-Type', user.photo.contentType)
        return res.status(200).end(user.photo.data)
    
}

