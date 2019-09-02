const { response, request } = require('express')
const Ably = require('ably')
const _request = require('request-promise')
const { ApplicationModel } = require('../model/app.model')

const API_KEY = process.env.ABLY_API_KEY,
  ZAPIER_URL = process.env.ZAPIER_URL

const httpOptions = body => {
  return {
    method: 'POST',
    uri: `${ZAPIER_URL}`,
    body,
    headers: {
      'Content-Type': 'application/json'
    },
    json: true
  }
}

/**
 * @param {request} req
 * @param {response} res
 */
exports.webHookController = (req, res) => {
  // init Ably
  const rest = new Ably.Rest(`${API_KEY}`)
  // check if req is from ably
  console.log('Body Request', req.body)
  // init webHook for usage
  const webhookMessages = req.body

  // get items from webHookMessages
  for (const item of webhookMessages.items) {
    // get decode ably messages
    const messages = Ably.Realtime.Message.fromEncodedArray(item.data.messages)
    // loop through messages
    for (const message of messages) {
      // set staffId
      const { clientID, staffName } = message.data
      // create new channel
      const channels = rest.channels.get('attendant:bot:' + clientID)
      // responsed message
      const response = 'Welcome to work'
      //zappier webhook
      _request(httpOptions({ message: response, clientID, staffName }))
        .then(zap => {
          // log zap request
          console.log('Zap', zap)
          // publish new channel
          channels.publish('bot', zap, err => {
            if (err) {
              res.status(400).send('Failed')
            } else {
              // get applicatiion model
              const timeLog = new ApplicationModel({ clientID, staffName })
              // save to DB
              timeLog.save((err, logged) => {
                if (err) {
                  console.log(err)
                } else {
                  console.log(logged)
                }
              })
              // send ok if eveything goes well
              res.status(200).send('ok')
            }
          })
        })
        .catch(err => console.log('Zap Error', err))
    }
  }
}

/**
 * @param {request} req
 * @param {response} res
 */
exports.authController = (req, res) => {
  const rest = new Ably.Rest({ key: `${API_KEY}` })
  rest.auth.requestToken({ clientId: '*' }, function(err, token) {
    if (err) {
      res.send(err)
    } else {
      res.send(token)
    }
  })
}
