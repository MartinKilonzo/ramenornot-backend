const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const cors = require('cors');


const imageUpload = require('../gcp/cloudstorage');
const imageDetect = require('../gcp/cloudvision');
const model = require('../gcp/datastore');
const upload = multer({ dest: '/tmp/'});

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

const formatResponse = (file) => ({isRamen: file.isRamen, labels: file.labels})

const app = express()

app
  .use(allowCrossDomain)
  .use(bodyParser.urlencoded({extended: true}))
  .use(bodyParser.json())

  .get('/images', (req, res) => {
    model.list()
      .then((data) => res.status(200).send(data))
      .catch((err) => console.log(err))

  })

  .post('/detectRamen', imageUpload.multer.single('image'), imageDetect.detectRamen, (req, res) => {
    res.status(200).send(formatResponse(req.file))
  })

  .post('/addimage',
  imageUpload.multer.single('image'),
  imageDetect.detectRamen,
  imageUpload.sendUploadToGCS,
  (req, res, next) => {
    let data = req.body;
    data.isRamen = req.file.isRamen

    // Was an image uploaded? If so, we'll use its public URL
    // in cloud storage.
    if (req.file && req.file.cloudStoragePublicUrl) {
      data.imageUrl = req.file.cloudStoragePublicUrl;
    }

    // Save the data to the database.
    // res.redirect('/');
    model.create(data)
      .then(entity => res.status(200).send(formatResponse(req.file)))
      .catch(err => {
        next(err);
        return;
      });
  })


  .listen(8080, console.log('Serving at 8080'))
