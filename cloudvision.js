// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// const config = require('./config');
const Vision = require('@google-cloud/vision');

const ramenLabels = require('./ramenValues')

const RAMEN_THRESHOLD = 0.19

const toDict = (a) => {
  const ret = {}
  a.forEach(obj => ret[Object.keys(obj)[0]] = obj[Object.keys(obj)[0]])
  return ret
}

const computeRamenScore = (labelDict) => {
  let score = 0
  for (var prop in ramenLabels) {
    score += ramenLabels[prop] * labelDict[prop] || 0
  }
  score /= Object.keys(ramenLabels).length
  console.log(score)
  return score
}

const isRamen = (labels) => computeRamenScore(toDict(labels)) > RAMEN_THRESHOLD

// Creates a client
const client = new Vision.ImageAnnotatorClient();

const detectRamen = (req, res, next) => {
  if (!req.file) {
    console.log('missing file')
    return next();
  }

  client.labelDetection(req.file.buffer).then(results => {
    const labels = results[0].labelAnnotations;
    req.file.labels = labels.map((label) => ({ [label.description]: label.score }));

    req.file.isRamen = isRamen(req.file.labels)

    next()
  }).catch(err => {
    console.error('Error reading Ramen:', err);
    next();
  });
}

module.exports = {
  detectRamen
}
