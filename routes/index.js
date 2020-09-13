var express = require('express');
var router = express.Router();
var User = require('../lib/users');
var Product = require('../lib/product');
var mongodb=require('mongodb').ObjectID;
var Image=require('../lib/image');
const { fstat } = require('fs');
const user=new User;
var fs=require('fs');
var path= require('path');
var multer= require('multer');
var bcrypt=require('bcrypt');
var upload = multer({
    dest:'./public/upload',
    filename: function(req,file,cb){
        cb(null,Date.now()+'.jpg')
    }
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
            Product.find({},(err,allProducts)=>{
                if(err) console.log(err)
                else{
                    res.render('dashboard-buyer', {result: allProducts});
                }
            })
            
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
    //console.log(req.body);
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
        function validatePassword(password){
            var checklist=[];
            var num=0;
            var length=password.length;
            for(i=0;i<password.length;i++){
                checklist[i]=password[i];
                if(isNaN(checklist[i])!=true){
                    num++;
                }
            }
            if(num>0 && length>=8){
                return true;
            }
            else{
                return false;
            }

        }
        if(validateEmail(newuser.email)==true && validatePassword(newuser.password)==true){
            newuser.password=bcrypt.hashSync(newuser.password,10);
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
            res.render('register',{msg: "Please Enter a valid Email Address & check that your password is 8 characters long and contains a numerical digit!"});
        }
        
       
    }

})
router.post('/login',(req,res,next)=>{
    username=req.body.name;
    password=req.body.password;
    User.findOne({email: username},(err,result)=>{
        if(err) console.log(err);
        else{
            if(result){
                if(result.type=="seller" && bcrypt.compareSync(password,result.password)){
                    req.session.user=result;
                    console.log(result);
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
                    console.log(result,bcrypt.compareSync(result.password,password) );
                    if(bcrypt.compareSync(password,result.password)){
                        req.session.user=result;
                        Product.find({},(err,allProducts)=>{
                            if(err) console.log(err)
                            else{
                                res.render('dashboard-buyer', {result: allProducts});
                            }
                        })
                    }
                   else{
                    res.redirect('/');
                   }
                }

            }
            else{
                res.redirect('/');
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
         /*
        var path='./public/products/'+myProduct._id+'img.jpg';
        var data=req.body.img;
        var buf= new Buffer(data,'base64');
        fs.writeFile(path,buf,(err)=>{
            if(err) console.log(err);
        })
        myProduct.img='/products/'+myProduct._id+'img.jpg';
        */
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
                res.render('addImage',{id: result._id});
            }
        })
    }
    else{
        res.redirect('/');
    }
})
router.post('/addImage',upload.single('img'),function(req,res,next){
    var img=new Image();
    fs.rename(req.file.path,'./public/upload/'+req.file.filename+".jpg",(err)=>{
        img.imagename='upload/'+req.file.filename+".jpg";
        console.log(req.file);
        if(err) console.log(err);
    })
    console.log(req.file);
    
    
    img.save(function(err,result){
        if(err) console.log(err);
        else{
            console.log(result);
            Product.update({_id: req.body.id},{$set:{img: result.imagename}},(err,result1)=>{
                if(err) console.log(err);
                else{
                    console.log(result1);
                    res.redirect('/');
                }
            })
        }
    })
})
router.get('/productDetailsSeller/:id',(req,res,next)=>{
    var id=req.params.id;
    console.log(id);
    Product.findOne({_id: mongodb(id)},(err,product)=>{
        if(err) console.log(err);
        else{
            User.find({_id:{$in: product.buyers}},(err,buyers)=>{
                if(err) console.log(err);
                else{
                    console.log(buyers);
                    res.render('productDetails',{result: product, result1: buyers});
                }
            })
            
        }
    })
})
router.get('/productDetailsBuyer/:id',(req,res,next)=>{
    var id=req.params.id;
    Product.findOne({_id: mongodb.ObjectId(id)},(err,product)=>{
        if(err) console.log(err);
        else{
            res.render('ProductDetails-Buyer',{result: product});
        }
    })
})
router.get('/logout',(req,res,next)=>{
    if(req.session.user){
        req.session.destroy();

    }
    res.redirect('/');
})
router.get('/cart/:id',(req,res,next)=>{
    id=req.params.id;
    console.log(id);
    if(req.session.user){
        Product.findOneAndUpdate({_id: mongodb(id)},{$addToSet:{"cart": req.session.user._id}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                User.findOneAndUpdate({_id: req.session.user._id},{$addToSet:{"cart": id}},(err,result)=>{
                    if(err) console.log(err);
                    else{
                        console.log(result);
                        res.redirect('/productDetailsBuyer/'+id);
                    }
                })
            }
        })

    }
    else{
        res.redirect('/productDetailsBuyer/'+id);
    }
})
router.get('/wishlist/:id',(req,res,next)=>{
    id=req.params.id;
    console.log(id);
    if(req.session.user){
        Product.findOneAndUpdate({_id: mongodb(id)},{$addToSet:{"wishlist": req.session.user._id}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                User.findOneAndUpdate({_id: req.session.user._id},{$addToSet:{"wishlist": id}},(err,result)=>{
                    if(err) console.log(err);
                    else{
                        console.log(result);
                        res.redirect('/productDetailsBuyer/'+id);
                    }
                })
            }
        })

    }
    else{
        res.redirect('/productDetailsBuyer/'+id);
    }
   
})
router.get('/buy/:id',(req,res,next)=>{
    id=req.params.id;
    if(req.session.user){
        Product.findOne({_id: mongodb(id)},(err,myproduct)=>{
            if(err) console.log(err);
            else{
                Product.findOneAndUpdate({_id: mongodb(id)},{$addToSet:{"buyers": req.session.user._id},$set:{"stock":myproduct.stock-1}},(err,done)=>{
                    if(err) console.log(err);
                    else{
                        console.log(done);
                        User.findOneAndUpdate({_id: req.session.user._id},{$addToSet:{"products_bought": id}},(err,result)=>{
                            if(err) console.log(err);
                            else{
                                console.log(result);
                                res.redirect('/productDetailsBuyer/'+id);
                            }
                        })
                    }
                })
        
            }
            
        })
    }
        
    else{
        res.redirect('/productDetailsBuyer/'+id);
    }
})
router.get('/Orders',(req,res,next)=>{
    if(req.session.user){
        var arr=[];
        console.log(req.session.user.products_bought);
        for(i=0;i<req.session.user.products_bought.length;i++){
            console.log(i);
            Product.findOne({_id: req.session.user.products_bought[i]},(err,product)=>{
                if(err) console.log(err);
                else{
                    arr[i]= product;
                    console.log(product,i);
                    if(i==(req.session.user.products_bought.length)){
                        console.log(arr);
                        res.render('dashboard-buyer',{result: arr});
                    }
                }
            })
            
        }
        
    }
})
router.get('/Wishlist',(req,res,next)=>{
    if(req.session.user){
        var arr=[];
        console.log(req.session.user.wishlist);
        for(i=0;i<req.session.user.wishlist.length;i++){
            console.log(i);
            Product.findOne({_id: req.session.user.wishlist[i]},(err,product)=>{
                if(err) console.log(err);
                else{
                    arr[i]= product;
                    console.log(product,i);
                    if(i==(req.session.user.wishlist.length)){
                        console.log(arr);
                        res.render('dashboard-buyer',{result: arr});
                    }
                }
            })
            
        }
        
    }
})
router.get('/Cart',(req,res,next)=>{
    if(req.session.user){
        var arr=[];
        console.log(req.session.user.cart);
        for(i=0;i<req.session.user.cart.length;i++){
            console.log(i);
            Product.findOne({_id: req.session.user.cart[i]},(err,product)=>{
                if(err) console.log(err);
                else{
                    arr[i]= product;
                    console.log(product,i);
                    if(i==(req.session.user.cart.length)){
                        console.log(arr);
                        res.render('dashboard-buyer',{result: arr});
                    }
                }
            })
            
        }
        
    }
})
router.get('/edit/:id/:feature',(req,res,next)=>{
    id=req.params.id;
    feature= req.params.feature;
    console.log(feature);
    res.render('editProduct',{val: feature, id: id});
    
})
router.post('/edit',(req,res,next)=>{
   var id= req.body.id;
   var val=req.body.hidden;
   console.log(req.body.hidden);
    if(req.body.hidden=="category"){
        var editted= req.body.category;
    }
    else{
        var editted=req.body.editted;
    }
    var update={$set:{}};
    update.$set[req.body.hidden=editted];
    console.log(update);
    if(val=="brand"){
        Product.updateOne({_id: id},{$set: {"brand": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })

    }
    else if(val=="modl"){
        Product.updateOne({_id: id},{$set: {"modl": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="size"){
        Product.updateOne({_id: id},{$set: {"size": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="name"){
        Product.updateOne({_id: id},{$set: {"name": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="color"){
        Product.updateOne({_id: id},{$set: {"color": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="stock"){
        Product.updateOne({_id: id},{$set: {"stock": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="category"){
        Product.updateOne({_id: id},{$set: {"category": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="price"){
        Product.updateOne({_id: id},{$set: {"price": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="description"){
        Product.updateOne({_id: id},{$set: {"description": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    else if(val=="features"){
        Product.updateOne({_id: id},{$set: {"features": editted}},(err,done)=>{
            if(err) console.log(err);
            else{
                console.log(done);
                res.redirect('/productDetailsSeller/'+id);
            }
        })
    }
    
})




module.exports = router;