var seedrandom = require('seedrandom');

module.exports = {
  // Information
  name: 'gayrate',
  aliases: ['gay', 'g%', '%g'],
  description: 'Bobby will tell you how gay something is.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    let randomnumber = Math.floor(seedrandom(msg.author.toString())() * 101);
    if(!args[0]) {
      return msg.channel.send({
        embed: {
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL,
          },
          title: 'Scanning...',
          thumbnail: {
            url: msg.author.avatarURL,
          },
          description: `**${msg.member.user.username}** is ${randomnumber}% gay! :gay_pride_flag:`,
          color: 0xff4d4d,
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
          },
        },
      });
    };

    randomnumber = Math.floor(seedrandom(args[0].toLowerCase())() * 101);
    msg.channel.send({
      embed: {
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL,
        },
        title: 'Scanning...',
        description: `**${args.join(" ")}** is ${randomnumber}% gay! :gay_pride_flag:`,
        color: 0xff4d4d,
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
        },
      },
    });
  },
};