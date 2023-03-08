const express = require('express');
const router = express.Router();
const {userAuth,adminAuth} = require('./helper/jwt');

const userController = require('./controllers/userController');
router.post('/auth/signup',userController.signup);
router.post('/auth/signin',userController.signin);

router.post('/admin/customerList',adminAuth ,userController.getcustomerList);

const productController = require('./controllers/productController');
router.post('/product/addProduct',userAuth, productController.addProduct);
router.put('/product/updateProduct',userAuth, productController.updateProduct);
router.delete('/product/deleteProduct',userAuth, productController.deleteProduct);
router.get('/product/getProductByUser/:userid', productController.getProductByUser);
router.get('/product/getAllProducts', productController.getAllProducts);

module.exports =router