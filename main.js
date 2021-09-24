import SerialPort from 'serialport'
import { find } from 'lodash-es'
const allowedCards = [
  '1675585/25/37185'
]
class CardReader {
  floodTimeout = 5000
  reader = null
  cards = []
  floodTimer = null
  card = {
    raw: '',
    key: '',
    fid: '',
    kid: '',
    str: ''
  }
  constructor(port, baudRate, cardReadHandler = null) {
    if (!port) {
      throw new Error('Не указан порт');
    }
    if (!baudRate) {
      throw new Error('Не указана скорость порта')
    }

    if (cardReadHandler) {
      this.cardReadHandler = cardReadHandler
    } else {
      this.cardReadHandler = this.defaultCardReadHandler
    }

    this.init()
  }

  init () {
    this.reader = new SerialPort('COM3', {
      baudRate: 9600,
    });
    if (this.reader !== null) {
      this.attachEvents()
    }
  }

  attachEvents() {
    let rawCard = ''
    let prevRawCard = ''
    this.reader.on('data', (data) => {
      rawCard += new Buffer(data);
      if(rawCard.length === 14) {
        if (rawCard !== prevRawCard) {
          this.parsePacket(rawCard)
          prevRawCard = rawCard
          clearTimeout(this.floodTimer)
          this.floodTimer = setTimeout(function () {
            prevRawCard = ''
          }, this.floodTimeout)
        }
        rawCard = ''
      }
    });
  }

  parsePacket (packet) {
    const debug = false
    if (debug) {
      console.log('data received: ', packet.substring(1, 13));
      console.log('KEY:', parseInt(packet.substring(3,11), 16));
      console.log('FID:', parseInt(packet.substring(5,7), 16));
      console.log('KID:', parseInt(packet.substring(7,11), 16));
      console.log('--------');
    }
    const card = Object.assign({}, this.card)
    card.raw = packet.substring(1, 13);
    card.key = parseInt(packet.substring(3,11), 16);
    card.fid = parseInt(packet.substring(5,7), 16);
    card.kid = parseInt(packet.substring(7,11), 16);
    card.str = `${card.key}/${card.fid}/${card.kid}`
    const exist = find(this.cards, {raw: card.raw})
    if (exist === undefined) {
      this.cards.push(card)

    }
    this.cardReadHandler(card)
  }
  defaultCardReadHandler(card) {
    console.log('Card:')
    console.log('-------------')
    console.log(card.str)
    console.log(card)
  }
}
const cardReadHandler = (card) => {
  // console.log(card)
  const check = allowedCards.indexOf(card.str)
  if (check !== -1) {
    console.log('CARD ALLOWED!')
  } else {
    console.log('CARD NOT ALLOWED')
  }
}

new CardReader(
  'COM3',
  9600,
  cardReadHandler
)
