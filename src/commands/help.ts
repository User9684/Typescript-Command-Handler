const maxCommands = 5
const { 
  MessageEmbed, 
  MessageActionRow, 
  MessageButton 
} = require('discord.js');

export default {
  category: 'Help',
  description: 'Get a list of all Status+ commands!',
  slash: true,
  testOnly: false,
  cooldown: '5s',
  guildOnly: true,

  // This method is invoked anytime the command is ran
  callback: async (commandObject:any) => {
    const {
        interaction,
        inst
    } = commandObject
    if (!inst.commands) return console.error('Commands not found in inst')
    const pages:any = {}
    for (const uwu in inst.categories) {
      const owo = inst.categories[uwu]
      let pageInt = Object.keys(pages).length
      pages[pageInt] = {
        name: uwu,
        commands: []
      }
      let count = 0
      owo.commands.forEach((command:any) => {
        if(count>=maxCommands) {
          pageInt++
          pages[pageInt] = {
            name: uwu,
            commands: [],
          }
          count = 0
        }
        let b = pages[pageInt].commands
        pages[pageInt].commands.splice(b.length,0,command)
        count++
      })
    }
    let currentPageInt = 0
    let lastPage = 0

    let row
    const row1 = new MessageActionRow()
    .addComponents([
      new MessageButton()
      .setEmoji('⬅️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_BACK')
      .setDisabled(true),
      new MessageButton()
      .setEmoji('➡️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_FORWARDS'),
      new MessageButton()
      .setEmoji('🗑️')
      .setStyle('DANGER')
      .setCustomId('HELP_END'),
    ])
    const row2 = new MessageActionRow()
    .addComponents([
      new MessageButton()
      .setEmoji('⬅️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_BACK'),
      new MessageButton()
      .setEmoji('➡️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_FORWARDS'),
      new MessageButton()
      .setEmoji('🗑️')
      .setStyle('DANGER')
      .setCustomId('HELP_END'),
    ])
    const row3 = new MessageActionRow()
    .addComponents([
      new MessageButton()
      .setEmoji('⬅️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_BACK'),
      new MessageButton()
      .setEmoji('➡️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_FORWARDS')
      .setDisabled(true),
      new MessageButton()
      .setEmoji('🗑️')
      .setStyle('DANGER')
      .setCustomId('HELP_END'),
    ])
    const row4 = new MessageActionRow()
    .addComponents([
      new MessageButton()
      .setEmoji('⬅️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_BACK')
      .setDisabled(true),
      new MessageButton()
      .setEmoji('➡️')
      .setStyle('PRIMARY')
      .setCustomId('HELP_FORWARDS')
      .setDisabled(true),
      new MessageButton()
      .setEmoji('🗑️')
      .setStyle('DANGER')
      .setCustomId('HELP_END')
      .setDisabled(true),
    ])

    let embed = new MessageEmbed()
    async function embed_(msg?:any, int?:any){
      switch(currentPageInt){
        case Object.keys(pages).length-1:
          row = row3
          break;
        case 0:
          row = row1
          break;
        case -1:
          row = row4
          break;
        default:
          row = row2
          break;
      }
      if(currentPageInt !== -1){
        embed.setTitle(`**${pages[currentPageInt].name}** Category`)
        embed.setColor(inst.embedColor)
        embed.setDescription('')
        pages[currentPageInt].commands.forEach((cmd:any)=>{
          let str = embed.description+`\n**${cmd.name}** - ${cmd.description}`
          embed.setDescription(str)
        }) 
      } else {
        embed.setTitle(`**${pages[lastPage].name}** Category`)
        embed.setColor(inst.embedColor)
        embed.setDescription('')
        pages[lastPage].commands.forEach((cmd:any)=>{
          let str = embed.description+`\n**${cmd.name}** - ${cmd.description}`
          embed.setDescription(str)
        }) 
      }
      if(msg && msg.channel && msg?.editable === true) {
        await msg.edit({
          embeds: [embed],
          components: [row],
          fetchReply: true
        })
      }
      if(int) {
        await int.deferUpdate({fetchReply: true})
      }
    }
    embed_()
    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    })
    const filter = (i:any) => i.customId === 'HELP_FORWARDS' || i.customId === 'HELP_BACK' || i.customId === 'HELP_END'
    const collector = msg.createMessageComponentCollector({
      filter,
      time: 15000,
    });
    collector.on('collect', async (i:any) => {
      if (i.user.id !== interaction.user.id) return interaction.reply({content:'These buttons are not for you!',ephemeral:true});
      switch(i.customId){
        case 'HELP_FORWARDS':
          if(currentPageInt < Object.keys(pages).length) {
            collector.resetTimer()
            lastPage = currentPageInt
            currentPageInt++
          }
          break;
        case 'HELP_BACK':
          if(currentPageInt>0) {
            collector.resetTimer()
            lastPage = currentPageInt
            currentPageInt--
          }
          break;
        case 'HELP_END':
          collector.stop()
          break;
      }
      await embed_(msg,i)
    })
    collector.on('end',async() => {
      lastPage = currentPageInt
      currentPageInt = -1
      embed_(msg)
    })
  },
  error: async () => {

  }
};