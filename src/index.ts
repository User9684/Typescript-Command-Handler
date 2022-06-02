const token = ''
const mongoURI = ''
const DiscordJS = require('discord.js')
const startup = require('./modules/startup')

const {
    Intents,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
    MessageSelectMenu,
} = DiscordJS

const categories = [
    {
      name: 'Help',
    }, 
]

const client = new DiscordJS.Client({
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
})

startup.init(client, token, '../commands', categories, mongoURI)