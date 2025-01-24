const { getRandomElement } = require('./utils.js')

const fruitEmojis = [
  '🍎',
  '🍏',
  '🍊',
  '🍋',
  '🍌',
  '🍉',
  '🍇',
  '🍓',
  '🫐',
  '🍒',
  '🍍',
  '🥭',
  '🥝',
  '🍑',
  '🍐',
  '🍈'
]

class GameEvent {}

class Fruit extends GameEvent {
  static get emoji () {
    return getRandomElement(fruitEmojis)
  }

  effect (character) {
    let maxHeal = Math.floor(character.maxHealth / 2)
    while (maxHeal > 0 && character.health < character.maxHealth) {
      character.health++
      maxHeal--
    }
  }

  proposal = 'Eat some fruit to recover your health'

  message = 'You eat some fruit and rest.'
}

class Totem extends GameEvent {
  static emoji = '🗿'

  effect (character) {
    character.level++
  }

  proposal = 'Visit a totem to raise your level'

  message = 'You meditate next to the ancient figure and level up.'
}

module.exports = {
  Fruit, Totem
}
