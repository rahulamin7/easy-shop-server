const express = require('express');
const router = express.Router();
const {Product} = require('../models/product')
const {Category} = require('../models/category')
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type')
        if(isValid){
            uploadError = null
        }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
      const fileName = file.originalname.split(' ').join('-')
      const extension = FILE_TYPE_MAP[file.mimetype]
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  
  const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req,res)=>{
    let filter ={};
    if(req.query.category){
        filter = {category : req.query.category.split(',')}
    }
    const productLists = await Product.find(filter).select('name category').populate('category');
    if(!productLists){
        res.status(500).json({success:false})
    }
        res.send(productLists);
})
 
router.get(`/:id`, async (req,res)=>{
    const product = await Product.findById(req.params.id);
    if(!product){
        res.status(500).json({success:false})
    }
        res.send(product);
})

router.post('/', uploadOptions.single('image'), async (req, res)=>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).json({message:'Invalid Category !'})
    
    const file = req.file;
    if (!file) return res.status(400).json({message:'No image in the request!'})
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads`
    let product = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock: req.body.countInStock,
        rating:req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured 
    })
    product = await product.save();
    if(!product){
        return res.status(404).send('the category cannot be created !')
    }
    res.send(product);

})

router.put('/:id', async (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id')
    } else {
    const category = await Category.findById(req.body.category);
    if(!category){
        res.status(400).json({message:'Invalid Category !'})
    } else {
    const product =  await Product.findByIdAndUpdate(
        req.params.id, {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand:req.body.brand,
            price:req.body.price,
            category:req.body.category,
            countInStock: req.body.countInStock,
            rating:req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        },{new: true}
    );
    if(!product){
        return res.status(500).send('the product was not updated !')
    }
    res.send(product);
    }}
})

router.delete('/:id', (req, res)=>{
    if (!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id')
    } else {
    Product.findByIdAndRemove(req.params.id).then(product=>{
        if(product){
            return res.status(200).json({success:true, message:'the product is deleted !'})
        } else {
            return res.status(404).json({success:false, message:'product not found!'})
        }
    }).catch(err=>{
        res.status(400).json({success:false, error: err})
    })
   }
})

router.get(`/get/count`, async (req,res)=>{
    const productCount = await Product.countDocuments((count)=>count)
    if(!productCount){
        res.status(500).json({success:false})
    }
        res.send({
            count: productCount
        });
})

router.get(`/get/featured/:count`, async (req,res)=>{
    const count = req.params.count ? req.params.count: 0
    const product = await Product.find({isFeatured:true}).limit(+count);
    if(!product){
        res.status(500).json({success:false})
    }
        res.send(product);
})

router.put(
    '/galery-images/:id', 
    uploadOptions.array('images',10),  
    async (req, res)=>{
        if (!mongoose.isValidObjectId(req.params.id)){
           return res.status(400).send('Invalid Product Id')
        }
        const files = req.files;
        let imagesPath = [];
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        if(files) {
            files.map(file=>{
                imagesPath.push(`${basePath}${file.filename}`)
            })
        }
        const product =  await Product.findByIdAndUpdate(
            req.params.id, {
                
                images: imagesPath
                
                
            },{new: true}
        )
        if(!product){
            return res.status(500).send('the product was not updated !')
        }
        res.send(product);
})
module.exports = router;