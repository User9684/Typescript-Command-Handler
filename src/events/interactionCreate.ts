const {getClient, getInstance, getCommandFile} = require('../modules/startup')

const multi:any = {
    ['s']: 1,
    ['m']: 60,
    ['h']: 3600,
    ['d']: 86400,
    ['w']: 604800,
    ['M']: 2628002.88,
    ['y']: 31535965.4396976
}

async function convertToSeconds(timeString:string) {
    const mString:string = (timeString.charAt(timeString.length-1)||'s')
    const m:number = multi[mString]
    const time = Number(timeString.slice(0,-1))*m
    return time
}

export = async(client:any, interaction:any) => {
    const currentUnix = Date.now()
    const instance = await getInstance()
    if(interaction.isCommand()){
        const commandName = interaction.commandName
        const commandFile = await getCommandFile(commandName)
        const command = require(commandFile)
        const commandCooldown:number = await convertToSeconds((command.cooldown || '0s'))
        const guildOnly = command.guildOnly
        if (guildOnly && !interaction.inGuild()) return interaction.reply({content: 'This can only be used in guilds!',ephemeral: true})
        const cooldowns = instance.cooldowns
        const userCooldown = await cooldowns.findOne({
            _id: commandName+interaction.user.id
        })
        let isOnCooldown = false
        let timeLeft:number = 0
        if(userCooldown) {
            const timeSince:number = (currentUnix - (userCooldown?.unix || currentUnix))/1000
            timeLeft = Number((commandCooldown - timeSince).toFixed(1))
            if(timeSince <= commandCooldown) {
                isOnCooldown = true
            } else {
                await cooldowns.findOneAndRemove({
                    _id: commandName+interaction.user.id
                })
            }
        }

        const args = interaction?.options?.data

        if(!isOnCooldown) {
            command.callback({client, interaction, settings:{}, args, inst: instance})
            await cooldowns.findOneAndUpdate({
                _id: commandName+interaction.user.id
            },{
                _id: commandName+interaction.user.id,
                unix: currentUnix
            },{
                upsert: true
            })
        } else {
            command.error({error: 'COOLDOWN', command: commandName, interaction, info: {timeLeft}})
        }
        return interaction.commandId
    } else if(interaction.isButton()){

    }
}