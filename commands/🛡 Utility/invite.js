module.exports = {
  // Information
  name: 'invite',
  aliases: ['<', '>'],
  description: 'Invite the bot to other servers.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    msg.channel.send({
      embed: {
        title: 'Invite Bobby to your Discord Server',
        color: 0xff4d4d,
        description: '[Here](https://discordapp.com/oauth2/authorize/?permissions=1341643977&scope=bot&client_id=518434396244672513)',
        fields: [{
          name: 'Join Bobby\'s Official Discord Server',
          value: '[Here](https://discord.gg/mmPRWZM)',
        }],
      },
    });
  },
};