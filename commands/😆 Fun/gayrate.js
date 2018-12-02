module.exports = {
  // Information
  name: 'gayrate',
  aliases: ['gay', 'g%', '%g'],
  description: 'LMAOBot will tell you how gay you\'re.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    const randomnumber = Math.floor(Math.random() * 101);
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