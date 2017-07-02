var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser')
var multer  = require('multer');
var upload = multer({ dest: 'uploads/' });
var mongoURL = "mongodb://localhost:27017/maps";
router.use(bodyParser.json())
router.get('/', function(req, res) {
	res.render("index");
});

router.post('/upload', upload.single('userdata'), function(req, res){
	//console.log(req.file);
	readFile(req.file, function(err, data){
		if(err){
			res.status(500).send("server error");
		}else{
			res.status(200).send(data);
		}
	});
	
});
function readFile(files, callback){
   console.log("in readfile");
   //console.log(files);
   var fs = require('fs');
   var obj;
   var filePath = files.path
   console.log(filePath);
   var obj;
   try{
	    obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
   }catch(exception){
	   console.log(exception)
   }
   MongoClient.connect(mongoURL, function(err, db){
	   if(err)
		   console.log(err);
	   db.collection('users').insertMany(obj, function(err, r) {
			db.close();
			if(err){
				console.log(err);
				callback(err);
			}else{
				callback(null, "data inserted succesfully ");
			}
			
		});          
   })
   //res.status(200).send("read file");
}


router.get('/fetchData', function(req, res) {
	var level = req.query.level;
	console.log(level);
	fetchData(level,function(err, data){
		var writeResponse = "";
		var code = 200;
		if(err){
			console.log(err);
			writeResponse = "Server Error"; 
			code = 500;
		}else{
			writeResponse = JSON.stringify(data);
			code = 200;
		}
		//console.log(data);
		res.writeHead(code, {"Content-Type": "text/plain"});
		res.write(writeResponse); // You Can Call Response.write Infinite Times BEFORE response.end
		res.end();
	});
});

router.get('/geolocation', function(req, res) {
	
	var address = req.query.address;
	
	lookupGeoLoc(address,function(err, geolocation){
		var writeResponse = "";
		var code = 200;
		if(err){
			console.log(err);
			writeResponse = "server error";
			code = 500;
		}else if(geolocation == null){
			code = 404;
		}else{
			code = 200;
			writeResponse = JSON.stringify(geolocation);
		}
		res.writeHead(code, {"Content-Type": "text/plain"});
		res.write(writeResponse); 
		res.end();
		
	});
});
router.post('/addgeolocation', function(req, res) {
	//console.log(req.body);
	addGeoData(req.body, function(err, data){
		if(err){
			console.log(err);
		}
		//console.log(data);
		res.writeHead(200, {"Content-Type": "text/plain"});
		res.write("inserted "); 
		res.end();
	});
});

function addGeoData(document, cb){
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			cb(err);
		}
		//document = JSON.parse(document);
		//console.log(document);
		//var document = {address : address, geolocation: geolocation};
		db.collection('geolocation').insert(document, function(err, item){
			if(err){
				cb(err)
			}
			console.log("inserted");
			cb(null, item)
		});
		db.close();
	});
}
function lookupGeoLoc(address,cb){
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			cb(err);
		}
		db.collection('geolocation').findOne({"address":address}, function(err, item) {
			if(err) {
				cb(err);
			}
			console.log("geocode lookup: " + item)
			cb(null, item);
			db.close();
		});
	});
}

function fetchData(level,cb){
	MongoClient.connect(mongoURL, function(err, db) {
		if(err) {
			cb(err);
		}
		var groupObject;
		switch (level) {
			case "zipcode":
				groupObject = { level : "$address.zipcode", city: "$address.city", state: "$address.state", country: "$address.country"};
				break;
			case "city":
				groupObject = { level : "$address.city", state: "$address.state", country: "$address.country"};
				break;
			case "state":
				groupObject = { level : "$address.state", country: "$address.country"};
				break;
			case "country":
				groupObject = { level : "$address.country", country: "$address.country"};
				break;
			
		}
		
		db.collection('users').aggregate([
			{ $group : {
			  _id : groupObject,
			  count : { $sum : 1}
			}}
		  ], function(err, result) {
			  db.close();
			  if(err) {
				cb(err);
			  }
			cb(null,result);
		});
 
	});
}

module.exports = router;
