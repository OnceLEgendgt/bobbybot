module.exports = {
    // Information
    name: 'ban',
    aliases: [],
    description: 'Ban someone.',
    usage: '<user mention> <reason>',
    // Requirements
    args: {
      req: true,
      min: 2,
  },
    // Function
    run: (client, command, msg, args) => {
      const member = msg.mentions.members.first();
      if(!member) return msg.channel.send("You must tag someone!");
      const reason = args.slice(1).join(" ");
      if(!reason) return msg.channel.send("You must add a reason!");
        member.ban(2).then((member) => {
          //Success message
        msg.channel.send({embed: {
          color: 0xff4d4d,
          thumbnail: member.avatarURL,
            title: `Successfully banned ${member.displayName}`,
            description: `**Reason:** ${reason}`,
        }});
        }).catch((err) => {
          // Error
          msg.channel.send(`An error occured while executing this command:\n**Error:**\n` + "```js " + err + "```");
        });
      },
  };