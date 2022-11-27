const express=require("express");
require("./db/config");
const cors=require("cors")
const User=require("./db/User");
const Product=require("./db/Product");
const Jwt=require("jsonwebtoken");
const jwtKey='e-comm'
const app=express();
app.use(express.json())
app.use(cors()) //for cors err

const port= process.env.port || 5000;

app.post("/register",async (req,res)=>{
    let user=new User(req.body);
    let result=await user.save()
    res.send(result)
})

app.post('/login',async (req,res)=>{
  let user=await User.findOne(req.body).select("-password")
  if(user){
    Jwt.sign({user},jwtKey,{expiresIn: "2h"},(err,token)=>{
      res.send({user,authToken:token})
    })
 
  } else{
    res.send({result:"No user Daat"})
  }
})

app.post('/add-products',verifyToken,async (req,res)=>{
    let product= new Product(req.body)
    let result=await product.save();
    res.send(result)
})

app.get('/products',verifyToken,async (req,res)=>{
  let product=await Product.find();
  if(product.length>0){
    res.send(product)
  }else{
    res.send({result:"No user Daat"})
  }
})

app.delete("/product/:id",verifyToken,async (req,res)=>{
  const result=await Product.deleteOne({_id:req.params.id})
  res.send(result);

})

app.put("/product/:id",verifyToken,async(req,res)=>{
  let result=await Product.updateOne(
    {_id:req.params.id},
    {
      $set:req.body
    }
  )
  res.send(result)
})

function verifyToken(req,resp,next){
  let token =req.headers['authorization'];
  console.log(token)
  if(token){
  token=token.split(' ')[1];
  console.log(token,"pppp")
  Jwt.verify(token,jwtKey,(err,valid)=>{
    if(err){
      resp.send({result:"please provide valid token with header"})
    }else{
      next();
    }
  })
  }else{
    resp.send({result:"please add token with header"})
  }

}
app.listen(port);