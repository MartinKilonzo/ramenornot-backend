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

const Datastore = require('@google-cloud/datastore');
// const config = require('../config');

// [START config]
const ds = Datastore({
  projectId: 'ramenornot'
});
const KIND = 'Image';
// [END config]


// Lists all questions in a Quiz (defaults to 'gcp').
// Returns a promise
// [START list]
function list(image = 'image') {
  const q = ds.createQuery([KIND])

  const p = ds.runQuery(q);

  return p.then(([results, { moreResults, endCursor }]) => {
    const questions = results.map(item => {
      return item;
    });
    return {
      results,
    };
  });
}
// [END list]

// [START create]
function create({ author, imageUrl, isRamen }) {

  const key = ds.key(KIND);
  // console.log(imageUrl)

  const entity = {
    key,
    data: [
      { name: 'author', value: author || 'anonymous' },
      { name: 'isRamen', value: isRamen || false },
      { name: 'imageUrl', value: imageUrl },
    ]
  };
  return ds.save(entity);
}
// [END create]

// [START exports]
module.exports = {
  create,
  list
};
// [END exports]
