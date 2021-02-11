const express = require('express');
const router = express.Router();
const {User} = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
router.get(`/`, async (req,res)=>{
    const userLists = await User.find().select('-passwordHash');
    if(!userLists){
        res.status(500).json({success:false})
    }
        res.status(200).send(userLists);
})

router.get(`/:id`, async (req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');
    if(!user){
        res.status(500).json({message:'The User with the given Id was not found !'})
    }
        res.status(200).send(user);
})

router.post('/', async (req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password, 10) ,
        street: req.body.street,
        appartment: req.body.appartment,
        city:req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    })
    user= await user.save();
    if(!user){
        return res.status(404).send('the user cannot be created !')
    }
    res.send(user);

})

router.post(`/login`, async (req,res)=>{
    const user = await User.findOne({email: req.body.email});
    const secret = process.env.secret;
    if(!user){
        res.status(400).send('The User not found !')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const token = jwt.sign({
            userId: user.id,
            isAdmin: user.isAdmin
        },secret,
        {expiresIn:'1d'}
        )
        res.status(200).send({user: user.email, token:token})
    } else {
        res.status(400).send('Password Incorrect!'); 
    }
})

router.post('/register', async (req, res)=>{
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password, 10) ,
        street: req.body.street,
        appartment: req.body.appartment,
        city:req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone:req.body.phone,
        isAdmin:req.body.isAdmin
    })
    user= await user.save();
    if(!user){
        return res.status(404).send('the user cannot be created !')
    }
    res.send(user);

})

router.delete('/:id', (req, res)=>{
    
    User.findByIdAndRemove(req.params.id).then(user=>{
        if(user){
            return res.status(200).json({success:true, message:'the user is deleted !'})
        } else {
            return res.status(404).json({success:false, message:'user not found!'})
        }
    }).catch(err=>{
        res.status(400).json({success:false, error: err})
    })
   
})

router.get(`/get/count`, async (req,res)=>{
    const userCount = await User.countDocuments((count)=>count)
    if(!userCount){
        res.status(500).json({success:false})
    }
        res.send({
            userCount: userCount
        });
})
module.exports = router;