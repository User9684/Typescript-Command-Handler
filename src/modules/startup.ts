const fs = require( 'fs');
const {REST}  = require( '@discordjs/rest');
const {SlashCommandBuilder}  = require( '@discordjs/builders');
const {Routes}  = require( 'discord-api-types/v9');
const {Client, Intents, Collection, ClientOptions, MessageEmbed} = require('discord.js');
const mongoose = require('mongoose');
const registerEvents = require('./modules/registerEvents.js')

let client_:any
let instance:any = {};
let commands_:any = {};
let categories:any = {};

const walk = function (dirPath:any, arrayOfFiles?:any) {
    let files = fs.readdirSync(dirPath)
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach((file:any) => {
      if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
        arrayOfFiles = walk(`${dirPath}/${file}`, arrayOfFiles)
      } else {
        const file_type = file.split('.').pop();
        if (file_type === 'js') {
          arrayOfFiles.push(`${dirPath}/${file}`)
        }
      }
    })
    return arrayOfFiles
}



export = {
    async init(client:any, token:string, commandsPath:any, categoryObject:Array<{name:string}>, mongoUri:string, settings?:any) {
        instance.embedColor = settings?.embedColor || '00a2ff'
        instance.categories = categories;
        await mongoose.connect(mongoUri);
        instance.cooldowns = require('./handlerschemas/cooldown.js');
        const schemas = fs.readdirSync(__dirname+'/../schemas').filter((file:any) => file.endsWith('.js'));
        for (const file of schemas) {
            const schema = require(`../schemas/${file}`);
        }
        const globalCommands: any[] = [];
        client.commands = new Collection();
        const unfilteredFiles = walk(`${__dirname}/${commandsPath}`)
        const commandFiles = unfilteredFiles.filter((file:any) => file.endsWith('.js') && !file.split('/').pop().startsWith('!'));
        categoryObject.forEach((value:{name: string}, index) => {
            categories[value.name] = {
                name: value.name,
                commands: []
            };
        });
        for (const file of commandFiles) {
            const name:any = file.split('/').pop().split('.')[0]
            commands_[name] = file
            const command = require(file);
            const x = categories[command.category]
            const commandInfo = {
                name: name,
                description: command.description,
                cooldown: command.cooldown,
                init: command.init||undefined
            }
            categories[command.category].commands.splice(x.commands.length,0,commandInfo)
            client.commands.set(name, command);
            if(!command.testOnly || command.testOnly === false){
                command.name = name
                globalCommands.push(command);
            }
        }
        instance.commands = globalCommands
        client.once('ready',() => {
            globalCommands.forEach((command)=>{
                if(command.init && typeof(command.init) == 'function') {
                    command.init(client)
                }
            })
            registerEvents.init(client)
            console.log('Registering commands!')
            if(client?.user?.id && token){
                const CLIENT_ID = client.user.id;
                const rest = new REST({
                    version: '9'
                }).setToken(token);
                (async () => {
                    try {
                        await rest.put(
                            Routes.applicationCommands(CLIENT_ID), 
                            {
                                body: globalCommands
                            },
                        );
                        console.log('Registered Global Commands');
                    } catch (error) {
                        if (error) console.log(error);
                    }
                })();
            } else {
                console.error('ID could not be fetched! Did you use the right token?')
            }
        })
        client.login(token);
        client_ = client;
        return client
    },
    async getInstance() {
        return instance;
    },
    async getClient() {
        return client_;
    },
    async getCommandFile(name:string) {
        return commands_[name];
    }
}