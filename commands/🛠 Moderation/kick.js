module.exports = {
    // Information
    name: 'kick',
    aliases: ['boot'],
    description: 'kick someone.',
    usage: '<user mention> <reason>',
    // Requirements
    args: {
      req: true,
      min: 1,
  },
    // Function
    run: (client, command, msg, args) => {
      const member = msg.mentions.members.first();
      if(!member) return msg.channel.send("You must tag someone!");
      
      member.kick().then((member) => {
        //Success message
        msg.channel.send({embed: {
          color: 0xff4d4d,
          thumbnail: member.avatarURL,
            title: `Successfully kicked ${member.displayName}`,
            description: `**Reason:** ${reason}`,
        }});
      }).catch((err) => {
        // Error
        msg.channel.send(`An error occured while executing this command:\n**Error:**\n` + "```js " + err + "```");
      });
    },
  };