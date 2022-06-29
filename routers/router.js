const appController = require('../controllers/controller')
const express = require('express')
const router = express.Router();

router.get('/signUp', appController.signUp_get)
router.get('/logIn', appController.loginIn_get)
router.post('/logIn', appController.loginIn_post)
router.post('/signUp', appController.signUp_post)
router.get('/homePage', appController.homePage_get)
router.get('/logOut', appController.logOut_get)
router.put('/transferFund', appController.tranfer_post)
router.put('/depositFund', appController.deposit_post)

module.exports = router
