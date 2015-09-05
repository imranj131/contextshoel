var express = require("express");
var app     = express();
var bodyParser = require("body-parser");
var path = require("path");

// configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/',function(req,res) {
    res.sendFile(path.join(__dirname+"/index.html"));
});

/* Api Router */
var getStepsRouter = express.Router();

getStepsRouter.use(function (req, res, next) {
    res.json("asked for steps");
    return;
});

// static files
app.use("/css", express.static(__dirname + '/css'));
app.use("/js", express.static(__dirname + '/js'));
app.use("/img", express.static(__dirname + '/img'));

// Registering the routers
app.use('/steps/', getStepsRouter);

// Handle http posts
app.post('/post_step', function(req, res) {
    res.json("Just posted " + req.body);
});

app.listen(5000);
