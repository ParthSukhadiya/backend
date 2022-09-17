const express =require('express');
const User = require('../models/User');
const router= express.Router();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser=require('../middleware/fetchUser')

const { body, validationResult } = require('express-validator');
const JWT_SECRET = 'areobhikhmangiya'

  

//Route 1:Create User using :POST '/api/auth' DOesn't require auth
router.post('/createuser',[
    body('name','Enter Valid Name').isLength({ min: 3 }),
    body('email','Enter Valid email').isEmail(),
    body('password','Enter Valid password').isLength({ min: 5 }),
],async (req,res)=>{
    try {
      let success=false
    // if there are errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    const salt=await bcrypt.genSalt(10  ) //Promise return
    let secPass=await bcrypt.hash(req.body.password,salt) //Promise return
    // check data exits
    let user = await User.findOne({email:req.body.email})
    if(user)
        return res.status(400).json("email is already exists")
    user= await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      })
    const data={  
      user:{
        id:user.id
      }
    }
    const authToken=jwt.sign(data,JWT_SECRET)
    success=true
    // console.log(jwtData)
    res.json({success,authToken})
  } catch (error) {
    console.log(error) 
   }
})

//Route 2: Authentic using :POST '/api/auth/login' DOesn't require auth
router.post('/login',[
  // body('name','Enter Valid Name').isLength({ min: 3 }),
  body('email','Enter Valid email').isEmail(),
  body('password','Enter Valid password').isLength({ min: 5 }),
],async (req,res)=>{
  // if there are errors
      let success=false;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {email,password}=req.body;
      try {
        var user=await User.findOne({email});
        if(!user)
        {
          success=false
          return res.status(400).json({success,error:'Please enter valid email'})
        }
        const passwordCompare= await bcrypt.compare(password,user.password)
        if(!passwordCompare){
          success=false

          return res.status(400).json({success,error:'Please enter valid email'})
        }
        const data={
          user:{
            id:user.id
          }
        }
        const authToken=jwt.sign(data,JWT_SECRET)
    // console.log(jwtData)
    success=true
    res.json({success,authToken})
      } catch (e) {
        console.log(e)
      }
})

// Route 3: Get Login user details using:POST "api/auth/getuser" Login required
router.post('/getuser',fetchuser,async (req,res)=>{
try {
  let userId=req.user.id;
  const user=await User.findById(userId).select("-password")
  res.send({user})
} catch (error) {
  console.log(error.message)
  res.status(500).send('Internal Server Error')
}
})


module.exports=router