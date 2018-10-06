// env load
// import dotenv from 'dotenv'
const dotenv = require('dotenv')
// env config
const result = dotenv.config()
if (result.error) {
  throw result.error
}
console.log('ENV:')
console.log(result.parsed)

const Telegraf = require('telegraf')
const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const { enter, leave } = Stage
const { reply } = Telegraf

// const randomPhoto = 'https://picsum.photos/200/300/?random'

const keyboard = Markup.inlineKeyboard([
  Markup.urlButton('❤️', 'http://telegraf.js.org'),
  Markup.callbackButton('Delete', 'delete')
])


// Middleware reply with 'yo'
const sayYoMiddleware = ({ reply }, next) => reply('yo').then(() => next())

// Greeter scene
const greeterScene = new Scene('greeter')
greeterScene.enter((ctx) => ctx.reply('Hi'))
greeterScene.leave((ctx) => ctx.reply('Bye'))
greeterScene.hears('hi', enter('greeter'))
greeterScene.on('message', (ctx) => ctx.replyWithMarkdown('Send `hi`'))

// Echo scene
const echoScene = new Scene('echo')
echoScene.enter((ctx) => ctx.reply('echo scene'))
echoScene.leave((ctx) => ctx.reply('exiting echo scene'))
echoScene.command('back', leave())
echoScene.on('text', (ctx) => ctx.reply(ctx.message.text))
echoScene.on('message', (ctx) => ctx.reply('Only text messages please'))

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([greeterScene, echoScene], { ttl: 10 })

// Register session middleware
bot.use(session())

// Register stage middleware
bot.use(stage.middleware())

bot.command('greeter', enter('greeter'))
bot.command('echo', enter('echo'))
bot.on('message', (ctx) => ctx.reply('Try /echo or /greeter'))

// Register logger middleware
bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('Antwortzeit %sms', ms)
  })
})

// Login widget events
bot.on('connected_website', ({ reply }) => reply('Website verbunden'))
// Telegram passport events
bot.on('passport_data', ({ reply }) => reply('Telegram password verbunden'))

// Random location on some text messages
bot.on('text', ({ replyWithLocation }, next) => {
  if (Math.random() > 0.2) {
    return next()
  }
  return Promise.all([
    // replyWithLocation((Math.random() * 180) - 90, (Math.random() * 180) - 90),
    replyWithLocation(47.550176, 9.303009), // Amriswil
    next()
  ])
})

// bot.on('text', ({ replyWithHTML }) => replyWithHTML('<b>Hello</b>'))

bot.action('delete', ({ deleteMessage }) => deleteMessage())

// Text messages handling
bot.hears('Hey', sayYoMiddleware, (ctx) => {
  ctx.session.heyCounter = ctx.session.heyCounter || 0
  ctx.session.heyCounter++
  return ctx.replyWithMarkdown(`_Hey counter:_ ${ctx.session.heyCounter}`)
})
  
// Command handling
bot.command('answer', sayYoMiddleware, (ctx) => {
  console.log(ctx.message)
  return ctx.reply('*42*', Extra.markdown())
})

// bot.command('cat', ({ replyWithPhoto }) => replyWithPhoto(randomPhoto))

// Streaming photo, in case Telegram doesn't accept direct URL
// bot.command('cat2', ({ replyWithPhoto }) => replyWithPhoto({ url: randomPhoto }))

// Look ma, reply middleware factory
// bot.command('foo', reply('http://coub.com/view/9cjmt'))

// Wow! RegEx
bot.hears(/reverse (.+)/, ({ match, reply }) => reply(match[1].split('').reverse().join('')))


// /help
bot.help((ctx) => ctx.reply('helfen?'))
// bot.on('help', ({ replyWithHTML }) => replyWithHTML('<b>Hello</b>'))


// /command
bot.command('oldschool', (ctx) => ctx.reply('Hello'))
bot.command('modern', ({ reply }) => reply('Yo'))
bot.command('hipster', Telegraf.reply('λ'))

// /start
bot.start((ctx) => ctx.reply('Hallo, ich bin der erste TAE Testautomation Bot.'))


// bot.on('message', (ctx) => ctx.telegram.sendCopy(ctx.from.id, ctx.message, Extra.markup(keyboard)))

bot.on('sticker', (ctx) => ctx.reply('👍'))
// bot.on('gif', (ctx) => ctx.reply('👍 👍'))

// test git 'giphy'
/*
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.hears(/buy/i, (ctx) => ctx.reply('Buy-buy'))
*/

// Start polling
console.log('startPolling')
bot.startPolling()
