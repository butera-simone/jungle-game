const clearCode = '\x1B[2J\x1B[3J\x1B[H\x1Bc'

const unicodeBullet = '• '

const colors = {
  red: '\u001b[31m',
  green: '\u001b[32m',
  yellow: '\u001b[33m',
  blue: '\u001b[34m',
  white: '\u001b[37m'
}

const emptyString = '                         '

const emptyOption = [
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         ',
  '                         '
]

module.exports = {
  clearCode, unicodeBullet, colors, emptyOption, emptyString
}
