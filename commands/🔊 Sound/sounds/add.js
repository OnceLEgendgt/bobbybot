const ytdl = require('ytdl-core');

module.exports = {
  name: "create",
  description: "Add a sound to the bot's soundboard.",
  args: {
    min: 2,
    req: true
  },
  parent: "sounds",
  aliases: ["add", "+"],
  usage: "<sound name> <youtube link>",
  run: async (client, command, msg, args) => {
    args.shift();
    let soundName = args[0], soundURL = args[1];
    
    if(!soundURL.includes('youtube.com/watch')) return msg.channel.send(`${client.config.emojis.x} Invalid URL!\n${client.config.emojis.info} We currently only support YouTube links.`);
    if(soundURL.includes('list' || 'playlist')) return msg.channel.send(`${client.config.emojis.x} Playlists aren't supported.`);
    
    ytdl.getInfo(soundURL, async (err, info) => {
      if (err) console.error(err);
      if(info.length_seconds > 60) return msg.channel.send(`${client.config.emojis.x} Sounds longer than 1 minute aren't supported.`);
      
      try {
        const sound = await client.sounds.create({
          name: soundName,
          url: soundURL,
          userID: msg.author.id,
        });
        return msg.channel.send(`${client.config.emojis.check} **${sound.name}** has been successfully created!`)
      } catch(e) {
        if (e.name === 'SequelizeUniqueConstraintError') return msg.channel.send(`${client.config.emojis.x} A sound by that name already exists!`);
        throw Error(e);
      }
    });
  },
};