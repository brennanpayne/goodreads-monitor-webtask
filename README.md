There are two Auth0 Webtasks in this repo.

### Monitor
#### Goodreads
This will check goodreads for books added to the `to-read` shelf.  If books are found, it will report to the `NOTIFY_WEBHOOK`.

##### Expected Meta
`NOTIFY_WEBHOOK`: Webhook to `POST` to with newly added books.

Example:
```
NOTIFY_WEBHOOK="https://wt-859c0e2cb1760add6e7813f538214600-0.run.webtask.io/mailgun"
```

##### Goodreads Users To Monitor
Found in `goodreads-users`, list the Goodreads UserId & the Name (used in the email), to monitor.

Example:
```
[
  {
    "id": "1234",
    "name": "Alice"
  },
  {
    "id": "5678",
    "name": "Bob"
  }
]
```

##### Expected Secrets
`GOODREADS_KEY`: Goodreads API Key

Example:
```
GOODREADS_KEY="123abc"
```


### Monitor
#### Mailgun
This will consume an array of Goodreads users with new books and email the `NOTIFY_EMAIL`, with links to the books.

##### Expected Meta
`NOTIFY_EMAIL`: Which email to notify with list of new books

Example:
```
NOTIFY_EMAIL="brennan.s.payne@gmail.com"
```
