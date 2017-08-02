var lmgtfy = require('lmgtfy')

module.exports = {
  name: 'lmgtfy',
  usage: '<p>lmgtfy <query>',
  permission: 1,
  help: 'Posts a LMGTFY link in chat',
  main: function (bot, msg) {
    msg.channel.send(lmgtfy(msg.content))
  }
}
