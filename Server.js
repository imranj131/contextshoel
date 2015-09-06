var express = require("express");
var app     = express();
var bodyParser = require("body-parser");
var path = require("path");

var http = require('http');
var url  = require('url');

var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;
var mongoUrl = 'mongodb://localhost:27017/pennapps';

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',function(req,res) {
    res.sendFile(path.join(__dirname+"/index.html"));
});

app.get('/app',function(req,res) {
    res.sendFile(path.join(__dirname+"/dashboard.html"));
});

app.get('/old',function(req,res) {
    res.sendFile(path.join(__dirname+"/app.html"));
});

/* Api Router */
var getStepsRouter = express.Router();

getStepsRouter.use(function (req, res, next) {
    res.json("asked for steps");
    return;
});



// static files
//app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/assets", express.static(__dirname + '/assets'));

/* expecting date variable as string with format: 2015-09-06 */
app.use("/get_steps", function(req, res, next) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    date = "";
    if(query.hasOwnProperty("date")) {
        console.log(query.date);
        date = query.date;
    }

    hour = "";
    if(query.hasOwnProperty("hour") && !isNaN(query.hour)) {
        console.log(query.hour);
        hour = parseInt(query.hour);
    }

    if(date.length > 0 || hour.length > 0) {
        
        if(date.length > 0 && hour.length > 0) {
            mongoClient.connect(mongoUrl, function (mongoError, db) {

                if (!mongoError) {
                    var dbRows = db.collection("steps").find({
                        "date" : date,
                        "hour" : hour
                    }).toArray(function(err, items) {
                        if(err == null) {
                            res.json({"logs" : items});
                        }
                        db.close();
                    });
                    
                }
                else {
                    db.close();
                    res.end();
                }
            });
        }

        else if(date.length > 0) {
            mongoClient.connect(mongoUrl, function (mongoError, db) {

                if (!mongoError) {
                    var dbRows = db.collection("steps").find({
                        "date" : date
                    }).toArray(function(err, items) {
                        if(err == null) {
                            res.json({"logs" : items});
                        }
                        db.close();
                    });
                }
                else {
                    db.close();
                    res.end();
                }
            });
        }
        else {
            res.end();
        }
    }
    else {
        res.end();
    }

    //res.end();
});

app.use("/send_steps", function(req, res, next) {

    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;

    if(query.hasOwnProperty("steps") && query.steps.length > 0 && !isNaN(query.steps)){
        console.log(query.steps);
        console.log("sent some steps");

        mongoClient.connect(mongoUrl, function (mongoError, db) {
            if (!mongoError) {
                db.collection("steps").insertOne({
                    "date" : getCurrentDate(),
                    "hour" : getCurrentHour(),
                    "steps" : query.steps
                });

                console.log("Inseted steps into db");
            }

            else {
                db.close();
            }
        });

    }
    else {
        console.log("need steps variable");
    }

    res.end();
    
});

// Registering the routers
app.use('/steps/', getStepsRouter);

// Handle http posts
app.post('/post_step', function(req, res) {
    res.json("Just posted steps");

    mongoClient.connect(mongoUrl, function (mongoError, db) {

        var date = new Date();

        if (!mongoError) {
            db.collection("steps").insertOne({
                "date" : getCurrentDateTime(),
                "steps" : 3
            });

            console.log("Inseted steps into db");
        }

        else {
            db.close();
        }
    });
});

function getCurrentDate() {
    var date = new Date();

    var year = date.getFullYear();

    var monthNumber = date.getMonth();
    monthNumber++;
    if(monthNumber < 10) {
        monthNumber = "0" + monthNumber;
    }

    var dayNumber = date.getDate();
    if(dayNumber < 10) {
        dayNumber = "0" + dayNumber;
    }

    return year + "-" + monthNumber + 
        "-" + dayNumber;
}

function getCurrentHour() {
    var date = new Date();
    var hourNumber = date.getHours();
    return hourNumber;

}

function getCurrentDateTime() {
    var date = new Date();

    var year = date.getFullYear();

    var monthNumber = date.getMonth();
    monthNumber++;
    if(monthNumber < 10) {
        monthNumber = "0" + monthNumber;
    }

    var dayNumber = date.getDate();
    if(dayNumber < 10) {
        dayNumber = "0" + dayNumber;
    }

    var hourNumber = date.getHours();
    if(hourNumber < 10) {
        hourNumber = "0" + hourNumber;
    }

    var minuteNumber = date.getMinutes();
    if(minuteNumber < 10) {
        minuteNumber = "0" + minuteNumber;
    }

    var secondNumber = date.getSeconds();
    if(secondNumber < 10) {
        secondNumber = "0" + secondNumber;
    }

    return year + "-" + monthNumber + 
        "-" + dayNumber + " " + hourNumber + ":" + 
        minuteNumber + ":" + secondNumber;
}

app.listen(5000);
