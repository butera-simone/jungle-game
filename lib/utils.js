const { emptyString, unicodeBullet } = require('./constants')

const randomNumber = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomElement = (arr) => arr[randomNumber(0, arr.length - 1)]

function formatClass (c) {
  const attacks = getAttacks(c)

  const res = []
  res.push(emptyString)
  res.push(`            ${c.emoji}`.padEnd(25))
  for (let index = 0; index < 4; index++) {
    res.push(emptyString)
  }
  res.push(` ${c.name}`.padEnd(25))
  res.push((attacks.length > 0) ? (` ${unicodeBullet}${attacks[0]}`.padEnd(25)) : emptyString)
  res.push((attacks.length > 1) ? (` ${unicodeBullet}${attacks[1]}`.padEnd(25)) : emptyString)
  res.push((attacks.length > 2) ? (` ${unicodeBullet}${attacks[2]}`.padEnd(25)) : emptyString)
  return res
}

function formatEnemy (enemy) {
  const C = enemy.constructor
  const res = []

  res.push(emptyString)
  res.push(`            ${C.emoji}`.padEnd(25))
  for (let index = 0; index < 6; index++) {
    res.push(emptyString)
  }
  res.push(` ${enemy.health} 💚`.padEnd(25))
  res.push(` Level ${enemy.level} ${C.name}`.padEnd(25))
  return res
}

function formatEvent (event) {
  const C = event.constructor
  const res = []

  res.push(emptyString)
  res.push(`            ${C.emoji}`.padEnd(25))
  for (let index = 0; index < 7; index++) {
    res.push(emptyString)
  }
  res.push(` ${C.name}`.padEnd(25))
  return res
}

const getAttacks = (c) => {
  const res = []

  for (const methodName of Object.getOwnPropertyNames(c.prototype)) if (methodName !== 'constructor') res.push(methodName)

  const proto = Reflect.getPrototypeOf(c)

  for (const methodName of Object.getOwnPropertyNames(proto.prototype)) if (!['run', 'constructor', 'maxHealth'].includes(methodName)) res.push(methodName)

  return res
}

function combineStrings (str1, str2, length) {
  const totalSpaces = length - (str1.length + str2.length)
  const spaces = ' '.repeat(totalSpaces)
  return str1 + spaces + str2
}

function randomAttack (animal) {
  const possibleAttacks = getAttacks(animal.constructor)
  return animal[(getRandomElement(possibleAttacks))]()
}

module.exports = {
  formatClass, formatEnemy, formatEvent, getAttacks, combineStrings, randomAttack, getRandomElement, randomNumber
}
