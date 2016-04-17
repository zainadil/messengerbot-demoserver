var express = require('express');
var app = express();
var bodyParser  = require('body-parser');
var request = require('request');

const actions = {
  say: (sessionId, context, message, cb) => {
    console.log(message);
    cb();
  },
  merge: (sessionId, context, entities, message, cb) => {
    cb(context);
  },
  error: (sessionId, context, error) => {
    console.log(error.message);
  },
};

const Wit = require('node-wit').Wit;
const client = new Wit(process.env.WIT_TOKEN, actions);

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
  client.converse('user-session', 'Hi', {}, (error, data) => {
    if (error) {
      console.log('Oops! Got an error: ' + error);
    } else {
      console.log('Response: ' + JSON.stringify(data));
    }
  });
});

app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook/', function (req, res) {
  messaging_events = req.body.entry[0].messaging;
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i];
    sender = event.sender.id;
    if (event.message && event.message.text) {
      text = event.message.text;

      //Understand the message and respond intelligently

      if(text === 'interesting'){
        sendGenericMessge(sender)
      } else {
        sendTextMessage(sender, text.substring(0, 200));
      }
    }
  }
  res.sendStatus(200);
});


function sendTextMessage(sender, text){
  messageData = {
    text:text
  }
  sendMessage(sender, messageData);
}

function sendGenericMessge(sender){
  messageData = {
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "First card",
          "subtitle": "Element #1 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
          "buttons": [{
            "type": "web_url",
            "url": "https://www.messenger.com/",
            "title": "Web url"
          }, {
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for first element in a generic bubble",
          }],
        },{
          "title": "Second card",
          "subtitle": "Element #2 of an hscroll",
          "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
          "buttons": [{
            "type": "postback",
            "title": "Postback",
            "payload": "Payload for second element in a generic bubble",
          }],
        }]
      }
    }
  };
  sendMessage(sender, messageData);
}

function sendMessage(sender, messageData) {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: {access_token:process.env.PAGE_ACCESS_TOKEN},
    method: 'POST',
    json: {
      recipient: {id:sender},
      message: messageData,
    }
  }, function(error, response, body) {
    if (error) {
      console.log('Error sending message: ', error);
    } else if (response.body.error) {
      console.log('Error: ', response.body.error);
    }
  });
}

PORT = process.env.PORT || 4000
app.listen(PORT, function () {
  console.log('Example app listening on port: ' + PORT);
});

function askWitAi(question) {
  request({
      url: 'https://api.wit.ai/message',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + 'G3Z23QTGXVDE2IVNLRKO7BGGIHXKQH3P',
      },
      qs: { q:question}
    }, function (error, response, body) {
      if (error) {
        console.log('Error sending message: ', error);
      } else if (response.body.error) {
        console.log('Error: ', response.body.error);
      } else {
        console.log(response.body)
      }
    });
}
