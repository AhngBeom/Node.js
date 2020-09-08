var express = require('express');
var router = express.Router();

var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const shortid = require('shortid');


var mongoose = require('mongoose');
var db = mongoose.connect('mongodb+srv://ahng:1234@sns-cluster.sntec.mongodb.net/SNS-Cluster?retryWrites=true&w=majority', { useNewUrlParser: true });

var Schema = mongoose.Schema;

var Post = new Schema({
	author: String,
	picture: String,
	contents: String,
	date: Date,
	like: Number,
	hate: Number,
	comments: Array
});

var Post_reply = new Schema({
	author: String,
	comment: String,
	like: Number,
	hate: Number,
	date: Date,
	post_id: String
});

var postModel = mongoose.model('Post', Post);
var replyModel = mongoose.model('Post_reply', Post_reply);

var check_user = function (req) {
	var answer;

	if (req.session.passport === undefined || req.session.passport.user === undefined) {  // 비로그인유저일때
		console.log('로그인이 필요함');
		return false;
	}
	else {  // 로그인 되어 있을때
		return true;
	}
};

var check_unknown_user = function (id, pw) {
	var answer = false;

	postModel.findOne({ _id: id }, function (err, post) {
		if (err) {
			throw err;
		}
		unknownUserModel.findOne({ id: post.author }, function (err, user) {
			if (err) {
				throw err;
			}
			else if (user.password == pw) {
				console.log('비밀번호 일치')
				answer = true;
				console.log(answer)
			}
			else {
				answer = false;
			}
		});
	});
	return answer;
};

router.use(passport.initialize());
router.use(passport.session());


/* GET home page. */
router.get('/', function (req, res, next) {
	if (req.user) {
		var name = req.user.displayName;
		var picture = req.user.photos[0].value;
		res.render('index', { name: name, picture: picture });
	}
	else {
		res.render('index', { name: 'Unknown', picture: '/images/user.png' });
	}
});

router.get('/login', function (req, res, next) {
	res.render('login');
});

router.get('/load', function (req, res, next) {

	postModel.find({}, function (err, data) {
		res.json(data);
	});
});
router.get('/comment/load', function (req, res, next) {
	var board_id = req.query.board_id;
	replyModel.find({post_id : board_id}, function (err, data) {
		res.json(data);
	});
});

router.post('/write', function (req, res, next) {
	var author = req.body.author;
	var picture = req.body.picture;
	var contents = req.body.contents;
	var date = Date.now();
	var post = new postModel();

	post.author = author;
	post.picture = picture;
	post.contents = contents;
	post.date = date;
	post.like = 0;
	post.hate = 0;
	post.comments = [];
	post.save(function (err) {
		if (err) {
			throw err;
		}
		else {
			res.json({ status: "SUCCESS" });
		}
	});
});

router.post('/like', function (req, res, next) {
	var _id = req.body._id;
	var contents = req.body.contents;
	postModel.findOne({ _id: _id }, function (err, post) {
		if (err) {
			throw err;
		}
		else {
			post.like++;
			post.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({ status: "SUCCESS" });
				}
			});
		}
	});
});

router.post('/hate', function (req, res, next) {
	var _id = req.body._id;
	var contents = req.body.contents;
	postModel.findOne({ _id: _id }, function (err, post) {
		if (err) {
			throw err;
		}
		else {
			post.hate++;
			post.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({ status: "SUCCESS" });
				}
			});
		}
	});
});

router.post('/del', function (req, res, next) {
	var _id = req.body._id;

	if (check_user(req)) {
		postModel.deleteOne({ _id: _id }, function (err, result) {
			if (err) {
				throw err;
			}
			else {
				res.json({ status: "SUCCESS" });
			}
		});
	} else { 
		res.json({status: "REQUIRE ACCOUNT"});
	}
});

router.post('/modify', function (req, res, next) {
	var _id = req.body._id;
	var contents = req.body.contents;

	if (check_user(req)) {
		postModel.findOne({ _id: _id }, function (err, post) {
			if (err) {
				throw err;
			}
			else {
				post.contents = contents;
				post.save(function (err) {
					if (err) {
						throw err;
					}
					else {
						res.json({ status: "SUCCESS" });
					}
				});
			}
		});
	} else { 
		res.json({status: "REQUIRE ACCOUNT"});
	}
});

router.post('/comment', function (req, res, next) {
	var borad_id = req.body.borad_id;
	var author = req.body.author;
	var comment = req.body.comment;
	var date = Date.now();
	var reply = new replyModel();

	reply.author = author;
	reply.comment = comment;
	reply.date = Date.now();
	reply.like = 0;
	reply.hate = 0;
	reply.post_id = borad_id;

	reply.save(function (err) {
		if (err) {
			throw err;
		}
		else {
			res.json({ status: "SUCCESS" });
		}
	});
	
});

router.post('/comment/modify', function (req, res, next) {
	var _id = req.body._id;
	var comment = req.body.contents;

	if (check_user(req)) {
		replyModel.findOne({ _id: _id }, function (err, reply) {
			if (err) {
				throw err;
			}
			else {
				reply.comment = comment;
				reply.save(function (err) {
					if (err) {
						throw err;
					}
					else {
						res.json({ status: "SUCCESS" });
					}
				});
			}
		});
	} else { 
		res.json({status: "REQUIRE ACCOUNT"});
	}
});

router.post('/comment/del', function (req, res, next) {
	var _id = req.body._id;

	if (check_user(req)) {
		replyModel.deleteOne({ _id: _id }, function (err, reply) {
			if (err) {
				throw err;
			}
			else {
				res.json({ status: "SUCCESS" });
			}
		});
	} else { 
		res.json({status: "REQUIRE ACCOUNT"});
	}
});

router.post('/comment/like', function (req, res, next) {
	var _id = req.body._id;
	// console.log(_id);
	replyModel.findOne({ _id: _id }, function (err, reply) {
		if (err) {
			throw err;
		}
		else {
			// console.log(reply);
			reply.like++;
			
			reply.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({ status: "SUCCESS" });
				}
			});
		}
	});
});

router.post('/comment/hate', function (req, res, next) {
	var _id = req.body._id;
	// console.log(_id);
	replyModel.findOne({ _id: _id }, function (err, reply) {
		if (err) {
			throw err;
		}
		else {
			// console.log(reply);
			reply.hate++;
			
			reply.save(function (err) {
				if (err) {
					throw err;
				}
				else {
					res.json({ status: "SUCCESS" });
				}
			});
		}
	});
});

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

var googleCredentials = require('../config/google.json');

passport.use(new GoogleStrategy({
	clientID: googleCredentials.web.client_id,
	clientSecret: googleCredentials.web.client_secret,
	callbackURL: "/auth/google/callback"
},
	function (accessToken, refreshToken, profile, done) {
		process.nextTick(function () {
			return done(null, profile);
		});
	}
));

router.get('/auth/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }));

router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
	function (req, res) {
		res.redirect('/');
	});

router.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

module.exports = router;