module.exports = {
    // Information
    name: 'softban',
    aliases: ['sb'],
    description: 'Bans someone then unbans them straight away which also deletes 2 days of their messages. (softban)',
    usage: '<user mention>',
    // Requirements
    args: {
      req: true,
      min: 1,
  },
    // Function
    run: (client, command, msg, args) => {
      const member = msg.mentions.members.first();
      const id = msg.mentions.members.first().id;
      if(!member) return msg.channel.send("You must tag someone!");
      const reason = args.slice(1).join(" ");
      if(!reason) return msg.channel.send("You must add a reason!");
      member.ban(2).then((member) => {
        //Success message
        msg.channel.send({embed: {
          color: 0xff4d4d,
          thumbnail: member.avatarURL,
            title: `Successfully softbanned ${member.displayName}`,
            description: `**Reason:** ${reason}`,
        }});
        msg.guild.unban(id);
      }).catch((err) => {
        // Error
        msg.channel.send(`An error occured while executing this command:\n**Error:**\n` + "```" + err + "```");
      });
    },
  };