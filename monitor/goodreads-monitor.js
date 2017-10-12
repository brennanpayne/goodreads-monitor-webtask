'use latest';

const goodreads = require('./goodreads-api');
const storage = require('../utils/storage');
const GOODREADS_USERS = require('./goodreads-users');
const _ = require('lodash');
module.exports = (context, cb) => {
  var goodReadsUsers = GOODREADS_USERS;
  console.warn(goodReadsUsers);
  processUser(context, goodReadsUsers[0])
    .then(() => {
      cb(null, {done: 'true'})
    })
    .catch((error) => {
      cb(error);
    });
};

function processUser(context, userId) {
  var toRead = goodreads.fetchToReadShelf(context.secrets.GOODREADS_KEY, userId)
    .then((response) =>  _.get(response, 'data.GoodreadsResponse.reviews.review', []))
    .then(processGoodreadsReviews);
  var currentData = storage.get(context);

  /*
  Storage data to be saved as follows:
  {
    [userId#1]: {
      [bookId#1]: { metadata...}
      [bookId#2]: { metadata...}
    }
    [userId#2]: {...}
  }
  */
  return Promise.all([toRead, currentData])
    .then((promises) => {
      let newBooks = promises[0];
      let currentData = promises[1];
      let currentBooks = _.get(currentData, userId, {});

      return {
        [userId]: newBooks
      };
    })
    .then((updatedData) => {
      return storage.set(context, updatedData);
    })
    .then(() => {
      return storage.get(context).then(console.log);
    });
}

/*
 Creates the map of bookIds to their metadata
*/
function processGoodreadsReviews(reviews) {
  return _.reduce(reviews, (memo, review) => {
    let bookId = _.get(review, 'book.id.$t');
    if (!bookId) { return memo; }
    memo[bookId] = {
      id: bookId,
      link: _.get(review, 'book.link', '')
    }
    return memo;
  }, {});
}
