const mongoose = require('mongoose')
const  {ObjectId}  = mongoose.Schema.Types
const Category = require('./category')
const Tag = require('./tag')


const blogSchema = new mongoose.Schema({
    
    title: {
        type: String, trim: true, required: [true, 'Enter a title'], maxLength: 160, index: true
    },
    slug: {
        type: String, trim: true, unique: true, index: true
    },
    body: {
        type: {}, trim: true, required: true, min: 20, max: 2000000
    },
    excerpt: {
        type: {}
    },
    mtitle: {
        type: {}
    },
    mdesc: {
        type: {}
    },

    photo: {
        data: Buffer, contentType: {}
    },
    categories:[{type:ObjectId, ref:'Category'}],
    tags: [{type:ObjectId, ref:'Tag'}],
    postedBy: {
        type: ObjectId,
        ref: 'User'
    }



}, { timestamps: true })


// blogSchema.pre('save', async function (next) {
//     console.log('Iam running')

//     console.log('43', this.categories)
//     const categoriesPromises = this.categories.map(async id => {
        
//         Category.findById(id)
//         console.log(id)
//     })
//     this.categories = await Promise.all(categoriesPromises)
//     next()
// })

// blogSchema.pre('save', async function (next) {
//     console.log('Iam running')

//     const tagsPromises = this.tags.map(async id => Tag.findById(id))
//     this.tags = await Promise.all(tagsPromises)
//     next()
// })


module.exports = mongoose.model('Blog', blogSchema)