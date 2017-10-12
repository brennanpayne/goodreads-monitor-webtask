'use latest';

const goodreads = require('./goodreads-api');
const storage = require('../utils/storage');
const GOODREADS_USERS = require('./goodreads-users');
const axios = require('axios');
const _ = require('lodash');
module.exports = (context, cb) => {
  var allUsers = _.map(GOODREADS_USERS, (goodReadsUser, index) => {
    return new Promise(function(resolve, reject) {
      // Naive queuing of processing each user to not violate goodreads API terms (1req/sec)
      setTimeout(() => {
        processUser(context, goodReadsUser.id).then((result) => {
          return resolve({
            user: goodReadsUser,
            newBooks: result
          });
        })
      }, index * 1500);
    });
  });

  Promise.all(allUsers)
    .then((results) => {
      console.warn(results);
      // Fire and forget on this one.
      axios.post(context.meta.NOTIFY_WEBHOOK, {
        params: results
      });
      return cb(null, results)
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
      let remoteBooks = promises[0];
      let localData = promises[1];

      return storage.set(context, {
        [userId]: remoteBooks
      }).then(() => {
        let localBooks = _.get(localData, userId, {});
        let newBooksById = determineDifference(localBooks, remoteBooks);
        return _.pick(remoteBooks, newBooksById);
      });
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
      link: _.get(review, 'book.link', ''),
      title: _.get(review, 'book.title')
    }
    return memo;
  }, {});
}

/*
 Determine the difference between lists
*/
function determineDifference(currentBooks, newBooks) {
  // I want to get the books that are in newBooks, but not in currentBooks, as an arry of ids
  return _.difference(_.keys(newBooks), _.keys(currentBooks));
}
