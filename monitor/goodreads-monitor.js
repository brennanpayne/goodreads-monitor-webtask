'use latest';

const goodreads = require('./goodreads-api');
const storage = require('../utils/storage');
const _ = require('lodash');
module.exports = (context, cb) => {
  var goodReadsUsers = context.meta.GOODREADS_USERS;
  console.warn(context.meta);
  var toRead = goodreads.fetchToReadShelf(context.secrets.GOODREADS_KEY, goodReadsUsers[0])
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
  Promise.all([toRead, currentData])
    .then((promises) => {
      let newBooks = promises[0];
      let currentData = promises[1];
      let currentBooks = _.get(currentData, context.secrets.GOODREADS_USER_ID, {});

      return {
        [context.secrets.GOODREADS_USER_ID]: newBooks
      };
    })
    .then((updatedData) => {
      return storage.set(context, updatedData);
    })
    .then(() => {
      return storage.get(context).then(console.log);
    })
    .then(() => {
      cb(null, {done: 'true'})
    })
    .catch((error) => {
      cb(error);
    });
};

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
