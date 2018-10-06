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

const path = require('path');
const Telegraf = require('telegraf')
const TelegrafI18n = require('telegraf-i18n')
const session = require('telegraf/session')
const Markup = require('telegraf/markup')
const Extra = require('telegraf/extra')
const { reply } = Telegraf
const { match } = require('telegraf-i18n')

const bot = new Telegraf(process.env.BOT_TOKEN)

// Register session middleware
bot.use(session())

/*
bot.on('text', ({ session, reply }, next) => {
  session.counter = session.counter || 0
  session.counter++
  return Promise.all([
    reply(`Session Message counter: ${session.counter}`),
    next()
  ])
})
*/

// i18n middleware
const i18n = new TelegrafI18n({
  defaultLanguage: 'en',
  allowMissing: true,
  useSession: true,
  sessionName: 'session',
  directory: path.resolve(__dirname, 'locales')
})

// Register i18n middleware
bot.use(i18n.middleware())

// set location in session
function location(ctx, location) {
  ctx.session.location = location
  console.log('ctx.session.location: ' + ctx.session.location)
  // 3 buttons are readable
  var themeKeyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t('theme1'), 'theme1'),
    Markup.callbackButton(ctx.i18n.t('theme2'), 'theme2'),
    Markup.callbackButton(ctx.i18n.t('theme3'), 'theme3')
  ])
  var themeKeyboardMarkup = Extra.markup(themeKeyboard)
  if (ctx.session.location === 'locsg') {
    const message = 'Gut - Wir vom TAE Team sind auch in St.Gallen.'
    + "\n" + ctx.i18n.t('themequestion')
    ctx.reply(message, themeKeyboardMarkup)
  }
  if (ctx.session.location === 'lochomeoffice') {
    const message = 'Schön - Wir vom TAE Team sind in St.Gallen.'
    + "\n" + ctx.i18n.t('themequestion')
    ctx.reply(message, themeKeyboardMarkup)
  }
  if (ctx.session.location === 'locotherlocation') {
    const message = 'Gut - Wir vom TAE Team sind in St.Gallen.'
    + "\n" + ctx.i18n.t('themequestion')
    ctx.reply(message, themeKeyboardMarkup)
  }
}

// set theme in session
function theme(ctx, theme) {
  ctx.session.theme = theme
  console.log('ctx.session.theme: ' + ctx.session.theme)
  if (ctx.session.theme === 'theme1') {
    const message = ctx.i18n.t('theme1')
    + "\n" + 'der Testspezifikation Helfer der TQAs'
    + "\n" + 'Hier haben wir Doku im Confluence'
    var urlKeyboard = Markup.inlineKeyboard([
      Markup.urlButton(ctx.i18n.t('theme1') + ' Dokumentation', 'https://www.wikipedia.org/')
    ])
    var urlKeyboardMarkup = Extra.markup(urlKeyboard)
    ctx.reply(message, urlKeyboardMarkup)
  }
  if (ctx.session.theme === 'theme2') {
    const message = ctx.i18n.t('theme2')
    + "\n" + 'Da darfst Du Dich vertrauensvoll an ... wenden.'
    ctx.reply(message)
  }
  if (ctx.session.theme === 'theme3') {
    const message = ctx.i18n.t('theme3')
    + "\n" + 'Da darfst Du Dich vertrauensvoll an das ganze ... Team wenden.'
    var urlKeyboard = Markup.inlineKeyboard([
      Markup.urlButton(ctx.i18n.t('theme3'), 'https://www.wikipedia.org/')
    ])
    var urlKeyboardMarkup = Extra.markup(urlKeyboard)
    ctx.reply(message, urlKeyboardMarkup)
  }
}

// location actions
bot.action('locsg', (ctx) => location(ctx, 'locsg'))
bot.action('lochomeoffice', (ctx) => location(ctx, 'lochomeoffice'))
bot.action('locotherlocation', (ctx) => location(ctx, 'locotherlocation'))

// theme actions
bot.action('theme1', (ctx) => theme(ctx, 'theme1'))
bot.action('theme2', (ctx) => theme(ctx, 'theme2'))
bot.action('theme3', (ctx) => theme(ctx, 'theme3'))

// start
bot.start((ctx) => {
  console.log('bot.start()')
  const message = ctx.i18n.t('greeting')
  + "\n" + "\n" + ctx.i18n.t('tidi')
  + "\n" + ctx.i18n.t('target')
  + "\n" + ctx.i18n.t('fun')
  + "\n" + "\n" + ctx.i18n.t('locationquestion')
  // console.log(message)
  // 3 buttons are readable
  var locationKeyboard = Markup.inlineKeyboard([
    Markup.callbackButton(ctx.i18n.t('locsg'), 'locsg'),
    Markup.callbackButton(ctx.i18n.t('lochomeoffice'), 'lochomeoffice'),
    Markup.callbackButton(ctx.i18n.t('locotherlocation'), 'locotherlocation')
  ])
  var locationKeyboardMarkup = Extra.markup(locationKeyboard)
  return ctx.reply(message, locationKeyboardMarkup)
})

// Start polling
console.log('startPolling')
bot.startPolling()
