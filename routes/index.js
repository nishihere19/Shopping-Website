var express = require('express');
var router = express.Router();
var User = require('../lib/users');
var Product = require('../lib/product');
const { fstat } = require('fs');
const user=new User;
var fs=require('fs');
var path= require('path');
var multer= require('multer');
var upload = multer({
	dest:'./upload'
})

router.get('/',(req,res,next)=>{
    if(req.session.user){
        if(req.session.user.type=='seller'){
            Product.find({seller: req.session.user._id},(err,result)=>{
                if(err) console.log(err);
                else{
                    res.render('dashboard-seller',{result: result});
                }
            })
            
        }
        else{
            res.render('dashboard-buyer');
        }
    }
    else{
        res.render('index');
    }
    

})
router.get('/login',(req,res,next)=>{
    res.render('login');
})
router.get('/register',(req,res,next)=>{
    res.render('register');
})
router.post('/register',(req,res,next)=>{
    console.log(req.body);
    if(req.body.Seller!='on' && req.body.Buyer!='on'){
        res.render('register',{msg: 'Please select type of account!'});
        return;
    }
    else{
        var newuser= new User();
        newuser.username= req.body.name;
        newuser.password= req.body.password;
        newuser.email= req.body.email;
        function validateEmail(email){
            var re=/\S+@\S+\.\S+/;
            return re.test(email);
        }
        if(validateEmail(newuser.email)==true){
            if(req.body.Seller=='on'){
                newuser.type="seller";
            }
            else{
                newuser.type="buyer";
            }
           newuser.save(function(err,usersaved){
               if(err) console.log(err);
               else{
                   req.session.user=usersaved;
                   console.log(usersaved);
                   if(req.session.user.type=="seller"){
                       res.render('dashboard-seller',{msg: "Registered Successfully!"});
                   }
                   else{
                       res.render('dashboard-buyer',{msg: "Registered Successfully!"});
                   }
               }
    
           })

        }
        else{
            res.render('register',{msg: "Please Enter a valid Email Address!"});
        }
        
       
    }

})
router.post('/login',(req,res,next)=>{
    username=req.body.name;
    password=req.body.password;
    User.findOne({username: username,password: password},(err,result)=>{
        if(err) console.log(err);
        else{
            req.session.user=result;
            if(req.session.user.type=="seller"){
                Product.find({seller: req.session.user._id}, function(err,result){
                    if(err) console.log(err);
                    else{
                        console.log(result);
                        //result[result.length-1].img.data=result.img.data.toString('base64');
                        console.log(result);
                        res.render('dashboard-seller',{msg: "Welcome Back", result: result});
                    }
                })
                
            }
            else{
                res.render('dashboard-buyer',{msg: "Registered Successfully!"})
            }
            
        }
    })
})
router.get('/addProducts',(req,res,next)=>{
    if(req.session.user){
        res.render('addProducts');
    }
    else{
        res.redirect('/');
    }
})
router.post('/addProduct',(req,res,next)=>{
    if(req.session.user){
        
        var myProduct=new Product();
        var path='./public/products/'+myProduct._id+'img.jpg';
        var data=req.body.img;
        var buf= new Buffer(data,'base64');
        fs.writeFile(path,buf,(err)=>{
            if(err) console.log(err);
        })
        myProduct.img='/products/'+myProduct._id+'img.jpg';
        
        myProduct.category= req.body.category;
        myProduct.seller= req.session.user._id;
        myProduct.name= req.body.name;
        myProduct.stock=req.body.stock;
        myProduct.price=req.body.price;
        myProduct.description= req.body.desc;
        myProduct.features=req.body.features;
        myProduct.modl=req.body.model;
        myProduct.brand=req.body.brand;
        myProduct.size=req.body.size;
        myProduct.color=req.body.color;
        console.log(myProduct);
        myProduct.save(function(err,result){
            if(err) console.log(err);
            else{
                console.log(result);
                res.redirect('/');
            }
        })
    }
    else{
        res.redirect('/');
    }
})


module.exports = router;