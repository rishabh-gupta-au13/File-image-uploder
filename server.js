const express = require("express");
const bodyParser = require("body-parser")
const multer = require('multer')
const app = express()

const mongodb = require("mongodb")
const fs = require("fs")
const path = require("path")
// use the middleware of body parser
app.use(bodyParser.urlencoded({ extended: true }))


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
var upload = multer({
    storage: storage
})


// configuring mongo db
const Mongoclient = mongodb.MongoClient;
const url = 'mongodb://localhost:27017'

Mongoclient.connect(url, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,


}, (err, client) => {
    if (err) return console.log(err);
    db = client.db('Images');

    app.listen(3000, () => {
        console.log("Coonected mongodb")
    })
})

// configuring the home route 
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html')
})

// configuring the upload route
app.post('/uploadFile', upload.single('myFile'), (req, res, next) => {
    const file = req.file;
    if (!file) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }
    res.send(file)
})
//configuring multiple files routes

app.post('/uploadmultiple', upload.array('myfiles', 12), (req, res, next) => {
    const files = req.files;
    if (!files) {
        const error = new Error("Please upload a file");
        error.httpStatusCode = 400;
        return next(error);
    }
    res.send(files)
})
// Image upload to database
app.post("/uploadphoto", upload.single('myimage'), (req, res) => {
    var image = fs.readFileSync(req.file.path);
    var encode_image = image.toString('base64');
    //  define a json object for the image

    var finalImg = {
        contentType: req.file.mimetype,
        path: req.file.path,
        image: new Buffer(encode_image, 'base64')
    };
    db.collection('image').insertOne(finalImg, (err, result) => {
        console.log(result);
        if (err) return console.log(err);


        console.log("saved to database")

        res.contentType(finalImg.contentType)
        res.send(finalImg.image)

    })
})






app.listen(5000, () => {
    console.log('server is listening on port 5000')
})