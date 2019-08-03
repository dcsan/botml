#!/usr/bin/env node

const Botml = require('./botml')
const chalk = require('chalk')
const log = require('./log')

let argv = require('yargs')
  .locale('en')
  .usage(`Usage: $0 [OPTIONS] [files...]
       $0 [ --help | -v | --version ]`)
  .showHelpOnFail(false, 'Specify --help for available options')
  .option('voice', { default: true, describe: 'OSX only: enable text-to-speech' })
  .boolean('voice')
  .option('debug', { default: false, describe: 'Show debugging information' })
  .boolean('debug')
  .help()
  .alias('h', 'help')
  .version()
  .alias('v', 'version')
  .example('$0 --voice=false alice.bot')
  .argv

if (argv.voice) process.env.enableVoice = true
if (argv.debug) process.env.debug = true

log.info(chalk.bold('Botml interactive console'))

let bot = new Botml()

let files = argv._
if (files.length === 0) {
  log.warn(chalk.dim('No .bot files defined. Loading the hello.bot example. Say hi!'))
  files = [ './examples/hello.bot' ]
}
bot.load(files)

function exitHandler ({ exit }, err) {
  if (err) log.error(err.stack)
  if (exit) bot.stop()
}
process.on('exit', exitHandler.bind(null))
process.on('SIGINT', exitHandler.bind(null, { exit: true }))
process.on('uncaughtException', exitHandler.bind(null, { exit: true }))

bot.start(true)

bot.on('right', (params) => {
  log.warn('bot event>>', 'right', params)
  log.info('bot', JSON.stringify(bot, null, 2))
})

bot.on('wrong', (params) => {
  log.warn('bot event>>', 'wrong:', params)
  log.info('bot', JSON.stringify(bot, null, 2))
})

bot.on('status', (params) => {
  log.warn('status.params', params)
  // let [age, name, birthplace] = params
  // console.log(params)
  // console.log('age', age)
  let vars = bot.context.variables
  log.warn('vars', vars)
  // log.warn('status age:', age)
  // log.info('bot', JSON.stringify(bot, null, 4))
})

bot.on('dbg', (params) => {
  // log.info('bot', JSON.stringify(bot, null, 4))
  log.info('age:', bot.context.variables.get('age'))
  log.info('color:', bot.context.variables.get('color'))
})

bot.on('reset', () => {
  bot.context.variables.set('color', undefined)
})
