const { randomNumber } = require('./utils')
const { Animal } = require('..')

class Monkey extends Animal {
  static emoji = '🐒'
  punch () {
    this.health--
    return this.level * 3
  }

  kick () {
    return randomNumber(0, 5)
  }
}

Monkey.prototype.kick.description = 'random damage from 0 to 5'
Monkey.prototype.punch.description = 'damage equal to your level x 3, and you lose 1 health'

module.exports = {
  Monkey
}
