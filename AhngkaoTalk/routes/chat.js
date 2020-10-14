var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var path = require('path');
var moment = require('moment');
var date = `${moment().format("YYYY-MM-DD HH_mm_SS")}`;


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('chat.html', {
    title: 'Chatting Service'
  });
});

module.exports = router;
