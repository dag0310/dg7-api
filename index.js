const express = require('express')
var cors = require('cors')
const dgram = require('dgram')
const net = require('net')
const sunriseSunsetJs = require('sunrise-sunset-js')
const app = express()
const port = 3000

app.use(cors())

const UDP_PORT = 49880
const UDP_COMMANDS = {
  light_on: '0,0,6,0,256,67,0,1,10,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,39,0',
  light_off: '0,0,6,0,256,67,0,1,10,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,39,0',
  shutters_up: '0,0,6,0,256,67,0,1,10,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,39,0',
  shutters_down: '0,0,6,0,256,67,0,1,10,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,5,1,1,1,1,1,5,1,5,1,1,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,5,1,1,1,1,1,5,1,1,1,5,1,1,1,5,1,39,0',
}
const TCP_COMMANDS = {
  zone_off: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PWR00\x0D',
  zone_on: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PWR01\x0D',
  vol_up: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1MVLUP\x0D',
  vol_down: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1MVLDOWN\x0D',
  mute: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1AMTTG\x0D',
  source_01: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI10\x0D',
  source_02: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI01\x0D',
  source_03: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI02\x0D',
  source_04: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI05\x0D',
  source_05: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI03\x0D',
  source_06: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI25\x0D',
  source_07: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI24\x0D',
  source_08: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI23\x0D',
  source_09: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI2B\x0D',
  source_10: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLI29\x0D',
  fm_button1: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS01\x0D',
  fm_button2: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS02\x0D',
  fm_button3: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS03\x0D',
  fm_button4: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS04\x0D',
  fm_button5: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS05\x0D',
  fm_button6: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRS06\x0D',
  zone_statusquery: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PWRQSTN\x0D',
  vol_statusquery: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1MVLQSTN\x0D',
  mute_statusquery: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1AMTQSTN\x0D',
  source_statusquery: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1SLIQSTN\x0D',
  fm_statusquery: 'ISCP\x00\x00\x00\x10\x00\x00\x00\x08\x01\x00\x00\x00!1PRSQSTN\x0D',
}

function checkQueryParams (query, queryParams, res) {
  for (const queryParam of queryParams) {
    if (!query[queryParam]) {
      res.send(`Query param "${queryParam}" not found.`)
      return false
    }
  }
  return true
}

const udpRequest = (req, res) => {
  if (!checkQueryParams(req.query, ['command'], res)) {
    return
  }
  const message = UDP_COMMANDS[req.query.command]
  if (message === undefined) {
    res.send(`UDP command "${req.query.command}" not found.`)
    return
  }
  const udpSocket = dgram.createSocket('udp4')
  udpSocket.bind(() => {
    udpSocket.setBroadcast(true)
    udpSocket.send(message, 0, message.length, UDP_PORT, '255.255.255.255', () => {
      res.send()
    })
  })
}
app.post('/udp', udpRequest)

app.post('/tcp', (req, res) => {
  if (!checkQueryParams(req.query, ['command', 'host', 'port'], res)) {
    return
  }
  const message = TCP_COMMANDS[req.query.command]
  if (message === undefined) {
    res.send(`TCP command "${req.query.command}" not found.`)
    return
  }

  const tcpSocket = new net.Socket()
  tcpSocket.connect(parseInt(req.query.port, 10), req.query.host, () => {
    // console.log('CONNECTED TO: ' + req.query.host + ':' + req.query.port)
    tcpSocket.write(message)
    // tcpSocket.end()
  })

  tcpSocket.on('data', data => {
    res.send(data)
    tcpSocket.destroy()
  })

  // tcpSocket.on('close', () => {
  // console.log('Connection closed')
  // })
})

app.post('/event', (req, res) => {
  for (const key of ['interval', 'time', 'lat', 'lon', 'command']) {
    if (!Object.keys(req.query).includes(key)) {
      if ((key === 'lat' || key === 'lon') && !['sunrise', 'sunset'].includes(req.query.time)) {
        continue
      }
      res.send({ message: `Missing query param '${key}'` })
      return
    }
  }

  let eventTime
  switch (req.query.time) {
    case 'sunrise': eventTime = sunriseSunsetJs.getSunrise(parseFloat(req.query.lat), parseFloat(req.query.lon)); break
    case 'sunset': eventTime = sunriseSunsetJs.getSunset(parseFloat(req.query.lat), parseFloat(req.query.lon)); break
    default:
      const timeTokens = req.query.time.split(':')
      eventTime = new Date()
      eventTime.setHours(timeTokens[0], timeTokens[1] || 0, timeTokens[2] || 0, 0)
  }

  const now = new Date()
  const minutesInterval = parseInt(req.query.interval, 10)
  if (eventTime >= new Date(now - (minutesInterval * 60000)) && eventTime < now) {
    udpRequest({ query: { command: req.query.command } }, { send: () => {} })
    res.send({ message: 'Inside event time period', eventTime, now })
    return
  }

  res.send({ message: 'Outside event time period', eventTime, now })
})

app.listen(port, () => console.log(`dg7 API listening at http://localhost:${port}`))
