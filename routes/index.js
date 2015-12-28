"use strict";

var express = require('express');
var router = express.Router();
var multer = require('multer');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var upload = multer({dest: '/tmp/upload'});

router.post('/upload', upload.single('file'), function(req, res, next){
    var filePath = req.file.path;
    console.log(req.file.originalname, filePath);
    res.end('done');
})

module.exports = router;
