const API_URL = 'https://webhooks-reactor.appspot.com/ably'
//https://webhook-reactor.appspot.com/auth

const staff = [
  {
    staffName: 'Agiri',
    keycode: 'keycodeunlock'
  },
  {
    staffName: 'Dalia',
    keycode: 'keycodeunlock1'
  }
]

const clientID = (function() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const randomChar = () => chars[Math.floor(Math.random() * chars.length)]
  const idLength = 16
  const id = new Array(idLength)
  for (let i = 0; i < idLength; i++) {
    id[i] = randomChar()
  }
  return id.join('')
})()

/**
 *
 * @param {{}} object
 */
function confirmUser(object) {
  for (let st of staff) {
    if (JSON.stringify(st) == JSON.stringify(object)) {
      return true
    }
  }
  return false
}

/**
 *
 * @param {string} staffName
 * @param {string} keycode
 */
function webHook(staffName, keycode) {
  const loginScreen = document.querySelector('.login')
  const confirm = document.querySelector('.success')
  const _message = document.querySelector('#message')

  loginScreen.style.display = 'none'
  confirm.style.display = 'block'
  _message.innerHTML = "Loading..."

  const ably = new Ably.Realtime({
    authUrl: 'https://webhooks-reactor.appspot.com/auth'
  })
  ably.connection.on('connected', function() {
    console.log("That was simple, you're now connected to Ably in realtime")
  })

  console.log(clientID)

  const outBoundChannels = ably.channels.get('attendant:staff:' + clientID)
  outBoundChannels.publish('staff', { staffId: clientID, staffName, keycode })

  outBoundChannels.subscribe('staff', message => console.log(message))

  const inboundChannel = ably.channels.get('attendant:bot:' + clientID)
  inboundChannel.subscribe(function(message) {
    console.log('Send back to server', message)
    if (message.data.status === 'success') {
      _message.innerHTML = 'Welcome, Hook sent message delivered to slack'
    } else {
      _message.innerHTML = 'Webhook Failed'
    }
  })
}

document.querySelector('#submit').addEventListener('click', e => {
  const staffName = document.querySelector('#staffName').value
  const keycode = document.querySelector('#keycode').value

  if (confirmUser({ staffName, keycode })) {
    webHook(staffName, keycode)
    console.log('user exist')
  } else {
    const denied = document.querySelector('.denied')
    denied.style.display = 'block'
    console.log('user does not exist')
  }
})
