'use latest';
var axios = require('axios');
var parser = require('xml2json');

const GOODREADS_ENDPOINT = "https://www.goodreads.com";
axios.defaults.baseURL = GOODREADS_ENDPOINT;
const parseXML = function(data) {
  try {
    return parser.toJson(data, {object: true}); //Parse XML into JS object
  } catch (e) {
    console.warn('Parsing XML error');
    console.warn(e);
    console.warn(data);
    return {}
  }
}


const goodreads = {
  fetchToReadShelf: (key, userId) => {
    if (!key) {
      return Promise.reject('Please provide an API Key for Goodreads');
    }
    if (!userId) {
      return Promise.reject('Please provide a user id.');
    }
    return axios.get('/review/list', {
      params: {
        v: 2,
        id: userId,
        shelf: 'to-read',
        key: key
      },
      responseType: 'document',
      transformResponse: [parseXML]
    });
  }
}
module.exports = goodreads;
