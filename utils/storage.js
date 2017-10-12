'use latest';
const _ = require('lodash');
const get = (context) => {
  return new Promise((resolve, reject) => {
    context.storage.get((error, data) => {
      if (error) return reject(error);
      return resolve(data || {});
    });
  });
}

const set = (context, newData) => {
  return get(context)
    .then((currentData) => {
      let mergedData = _.assign({}, currentData, newData);
      context.storage.set(mergedData,  (error) => {
        if (error) return Promise.reject(error);
        return Promise.resolve();
      });
    })


}
module.exports = {get: get, set: set}
