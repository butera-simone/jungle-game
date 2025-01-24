const readline = require('readline')

const {
  Totem, Fruit
} = require('./lib/events')

const {
  clearCode, unicodeBullet, colors, emptyOption
} = require('./lib/constants')

const {
  formatClass, formatEnemy, formatEvent, getAttacks, combineStrings, randomAttack, getRandomElement, randomNumber
} = require('./lib/utils')

class Game {
  #rl = null
  color = colors.green
  debug = false
  classes = []
  #events = [Totem, Fruit]
  state = {
    message: [],
    possiblePaths: [],
    availableClasses: [],
    stage: 'start',
    character: null,
    enemy: null,
    currentEvent: null
  }

  constructor (config = {}) {
    if (config.classes) this.classes.push(...config.classes)
    if (config.events) this.events.push(...config.events)
    if (config.color) {
      if (config.color in colors) {
        this.color = colors[config.color]
      } else throw new Error(`The only colors supported are ${Object.keys(colors)}`)
    }
    this.#rl = readline.createInterface(process.stdin, process.stdout)
  }

  #getQuestionArray () {
    if (this.state.message.length > 0) {
      const res = [...this.state.message, '']
      this.state.message = []
      return res
    } else return []
  }

  #clear () {
    if (!this.debug) process.stdout.write(clearCode)
  }

  #extractStartingClasses () {
    return this.classes.sort(() => 0.5 - Math.random()).slice(0, 3)
  }

  #getRandomEvent () {
    const C = getRandomElement(this.#events)
    return new C()
  }

  #getRandomEnemy () {
    const C = getRandomElement(this.classes)
    const enemyLevel = randomNumber(1, this.state.character.level)
    return new C(enemyLevel)
  }

  #format (question = [], option1 = emptyOption, option2 = emptyOption, option3 = emptyOption) {
    const character = this.state.character
    for (let index = 0; index < 8; index++) {
      if (typeof question[index] === 'string') {
        question[index] = ' ' + question[index]
        if (question[index].length < 77) question[index] = question[index].padEnd(77)
      } else question[index] = ''.padEnd(77)
    }
    let status = ''
    if (this.state.stage === 'start' || character.health < 1) status = status.padEnd(77)
    else {
      const firstPart = ` Level ${character.level} ${character.constructor.name}`
      const health = '💚'.repeat(character.health) + ' '
      status = combineStrings(firstPart, health, 77)
    }
    const screen = `╔═════════════════════════╦═════════════════════════╦═════════════════════════╗
║${option1[0]}║${option2[0]}║${option3[0]}║
║${option1[1]}║${option2[1]}║${option3[1]}║
║${option1[2]}║${option2[2]}║${option3[2]}║
║${option1[3]}║${option2[3]}║${option3[3]}║
║${option1[4]}║${option2[4]}║${option3[4]}║
║${option1[5]}║${option2[5]}║${option3[5]}║
║${option1[6]}║${option2[6]}║${option3[6]}║
║${option1[7]}║${option2[7]}║${option3[7]}║
║${option1[8]}║${option2[8]}║${option3[8]}║
║${option1[9]}║${option2[9]}║${option3[9]}║
╚═════════════════════════╩═════════════════════════╩═════════════════════════╝
╔═════════════════════════════════════════════════════════════════════════════╗
║${status}║
╚═════════════════════════════════════════════════════════════════════════════╝
╔═════════════════════════════════════════════════════════════════════════════╗
║${question[0]}║
║${question[1]}║
║${question[2]}║
║${question[3]}║
║${question[4]}║
║${question[5]}║
║${question[6]}║
║${question[7]}║
╚═════════════════════════════════════════════════════════════════════════════╝
`
    const result = screen + '> '
    return result
  }

  #enemyTurn () {
    const damageToYou = randomAttack(this.state.enemy)
    this.state.message.push(`You received ${damageToYou} damage from your enemy!`)
    this.state.character.health -= damageToYou
    this.#checkYourHealth()
  }

  #checkYourHealth () {
    if (this.state.stage !== 'postmortem' && this.state.character.health < 1) {
      this.state.message.push('You dead!')
      this.state.enemy = null
      this.state.stage = 'postmortem'
    }
  }

  #oneIteration () {
    if (this.state.stage === 'start') {
      if (this.state.availableClasses.length === 0) this.state.availableClasses = this.#extractStartingClasses()
      const availableClasses = this.state.availableClasses
      const questionArray = this.#getQuestionArray()
      questionArray.push(
        'Choose your starting class:'
      )
      for (const c of this.state.availableClasses) {
        questionArray.push(unicodeBullet + c.name)
      }
      this.#rl.setPrompt(
        this.#format(questionArray,
          (availableClasses.length > 0) ? formatClass(availableClasses[0]) : emptyOption,
          (availableClasses.length > 1) ? formatClass(availableClasses[1]) : emptyOption,
          (availableClasses.length > 2) ? formatClass(availableClasses[2]) : emptyOption
        )
      )
    } else if (this.state.stage === 'choice') {
      while (this.state.possiblePaths.length < 3) {
        if (randomNumber(1, 4) === 4) this.state.possiblePaths.push(this.#getRandomEvent())
        else this.state.possiblePaths.push(this.#getRandomEnemy())
      }
      const possiblePaths = this.state.possiblePaths
      const questionArray = this.#getQuestionArray()
      questionArray.push('Choose your path number:')
      for (const index in possiblePaths) {
        const path = possiblePaths[index]
        if (path instanceof Animal) {
          questionArray.push(` ${Number(index) + 1}) Fight a level ${path.level} ${path.constructor.name}`)
        } else {
          questionArray.push(` ${Number(index) + 1}) ${path.proposal}`)
        }
      }
      const [first, second, third] = possiblePaths
      this.#rl.setPrompt(
        this.#format(
          questionArray,
          (first instanceof Animal) ? formatEnemy(first) : formatEvent(first),
          (second instanceof Animal) ? formatEnemy(second) : formatEvent(second),
          (third instanceof Animal) ? formatEnemy(third) : formatEvent(third)
        )
      )
    } else if (this.state.stage === 'fight') {
      const questionArray = this.#getQuestionArray()
      questionArray.push('What are you going to do?')
      const yourAttacks = getAttacks(this.state.character.constructor)
      for (const attack of yourAttacks) {
        if (this.state.character[attack].description) questionArray.push(unicodeBullet + attack + ` (${this.state.character[attack].description})`)
        else questionArray.push(unicodeBullet + attack)
      }
      questionArray.push(unicodeBullet + 'run')
      this.#rl.setPrompt(
        this.#format(
          questionArray,
          emptyOption,
          formatEnemy(this.state.enemy)
        )
      )
    } else if (this.state.stage === 'postmortem') {
      const questionArray = this.#getQuestionArray()
      questionArray.push('Thanks for playing!')
      this.#rl.setPrompt(
        this.#format(questionArray)
      )
      this.#nextTick()
    }

    this.#nextTick()
  }

  #nextTick () {
    this.#clear()
    process.stdout.write(this.color)
    this.#rl.prompt()
  }

  start () {
    this.#oneIteration()

    this.#rl
      .on('line',
        function (line) {
          if (line.length > 13) this.state.message.push('Input was too long!')
          else if (this.state.stage === 'start') {
            for (const C of this.state.availableClasses) {
              if (C.name.toUpperCase() === line.toUpperCase()) {
                this.state.character = new C()
                this.state.stage = 'choice'
                break
              }
            }
            if (this.state.stage === 'start') this.state.message.push(`"${line}" is not an option!`)
          } else if (this.state.stage === 'choice') {
            const n = Number(line)
            if ([1, 2, 3].includes(n)) {
              if (this.state.possiblePaths[n - 1] instanceof Animal) {
                this.state.enemy = this.state.possiblePaths.splice(n - 1, 1)[0]
                this.state.message.push(`You're fighting a level ${this.state.enemy.level} ${this.state.enemy.constructor.name}`)
                this.state.stage = 'fight'
              } else {
                const event = this.state.possiblePaths.splice(n - 1, 1)[0]
                event.effect(this.state.character)
                this.state.message.push(event.message)
              }
            } else this.state.message.push(`"${line}" is not an option!`)
          } else if (this.state.stage === 'fight') {
            const yourAttacks = getAttacks(this.state.character.constructor)
            if (yourAttacks.includes(line.toLowerCase())) {
              const damageToEnemy = this.state.character[line.toLowerCase()]()
              this.state.message.push(`You inflicted ${damageToEnemy} damage with ${line}`)
              this.state.enemy.health -= damageToEnemy
              if (this.state.enemy.health < 1) {
                this.state.message.push('You defeated the enemy!')
                this.state.enemy = null
                this.state.stage = 'choice'
              } else this.#enemyTurn()
            } else if (line.toLowerCase() === 'run') {
              if (this.state.character.run()) {
                this.state.message.push('You managed to run away!')
                this.state.enemy = null
                this.state.stage = 'choice'
              } else {
                this.state.message.push('Your attempt to flee failed!')
                this.#enemyTurn()
              }
            } else this.state.message.push(`"${line}" is not an option!`)
            this.#checkYourHealth()
          }
          this.#oneIteration()
        }.bind(this)
      )
      .on('close',
        function () {
          this.#clear()
          process.exit(0)
        }.bind(this)
      )
  }
}

class Animal {
  constructor (level) {
    this.level = level ?? 1
    this.health = this.maxHealth
  }

  get maxHealth () {
    return 2 + this.level
  }

  bite () {
    return this.level * 2
  }

  run () {
    return (randomNumber(1, 3) === 3)
  }
}

Animal.prototype.bite.description = 'damage equal to your level x 2'

module.exports = {
  Game, Animal
}
