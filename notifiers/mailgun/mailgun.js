'use latest';
const _ = require('lodash');

module.exports = (context, cb) => {
  var users = context.body;
  var notifications = _.reduce(users, (user) => {
    if (_.keys(user.newBooks).length > 0) {
      memo.push(notify(context, user));
    }
    return memo;
  }, []);
  Promise.all(notifications)
    .then((emails) => {
      cb(null, emails);
    })
    .catch((error) => {
      cb(error)
    })
};

function buildText(user) {
  return _.reduce(user.newBooks, (memo, newBook) => {
    return `${memo} ${newBook.title}: ${newBook.title}\n`;
  }, '');
}


function buildHtml(user) {
  return _.reduce(user.newBooks, (memo, newBook) => {
    return `${memo} <a href=${newBook.link}>${newBook.title}</a><br/>`;
  }, '');
}

function notify(context, user) {
  const mailgun = require('mailgun-js')({ apiKey: context.secrets.MAILGUN_API_KEY, domain: context.secrets.MAILGUN_DOMAIN });

  var data = {
    from: 'Goodreads Notifier <brennan@itasca-software.com>',
    to: context.meta.NOTIFY_EMAIL,
    subject: `${user.user.name} has added some new books to her list!`,
    text: buildText(user),
    html: buildHtml(user)
  };
  return mailgun.messages().send(data)
}
