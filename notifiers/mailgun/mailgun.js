'use latest';
const _ = require('lodash');

module.exports = (context, cb) => {
  var users = context.body;
  var notifications = _.map(users, (user) => {
    if (_.keys(user.newBooks).length > 0) {
      return notify(context, user);
    } else {
      return Promise.resolve();
    }
  });
  Promise.all(notifications)
    .then(() => {
      cb(null, 200)
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
    from: 'Brennan <brennan@itasca-software.com>',
    to: context.meta.NOTIFY_EMAIL,
    subject: `${user.user.name} has added some new books to her list!`,
    text: buildText(user),
    html: buildHtml(user)
  };
  return mailgun.messages().send(data)
}
