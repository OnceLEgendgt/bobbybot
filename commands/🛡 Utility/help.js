module.exports = {
  // Information
  name: 'help',
  aliases: ['h', '?'],
  description: 'Information on Bobby\'s usage.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    if (!args.length) {
      const commands = {};
      // check for admin commands
      client.commands.forEach(function(command) {
        if (['admin'].includes(command.category.toLowerCase())) {
          return;
        } else if (!(command.category in commands)) {
          commands[command.category] = [];
        }
        commands[command.category].push(command.name);
      });
      
      const fields = [];
      for (const category of Object.keys(commands)) {
        fields.push({
          name: category,
          value: '*' + commands[category].join(', ') + '*',
        });
      }
      
      msg.channel.send({
        embed: {
          color: 0xff4d4d,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL,
          },
          title: 'Help Menu',
          description: `The prefix for my commands is \`${client.config.prefix}\`\nUsing a command would look like this: \`${client.config.prefix} <command name> <args>\``,
          fields: fields,
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
          },
        },
      });
    } else {
      let command = client.commands.get(args[0]) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(args[0]));
      if (!command) return msg.channel.send(`${client.config.emojis.x} Unknown command!\nCan't help you with a command that doesn't exist ( ͡° ͜ʖ ͡°)`);
      if(client.subcommands.get(command.name) && args.length > 1) {
        command = client.subcommands.get(command.name).get(args[1]) || client.subcommands.get(command.name).find(cmd => cmd.aliases && cmd.aliases.includes(args[1]));
        if(!command) return msg.channel.send(`${client.config.emojis.x} Unknown subcommand!\nCan't help you with a subcommand that doesn't exist ( ͡° ͜ʖ ͡°)`);
      }
      let parent = " ";
      if('parent' in command) parent = command.parent + " ";
      // Setup fields
      const fields = [];

      if ('args' in command && command.args.req === true) {
        fields.push({
          name: 'Required Arguments',
          value: `The command requires \`${command.args.min}\` argument(s).\n**Usage**: \`${client.config.prefix} ${parent}${command.name} ${command.usage}\``,
        });
      }
      
      /*if ('explanation' in command) {
        const field_id = fields.push({
          name: 'Argument Information',
          value: '',
        }) - 1;
        for (const argument of Object.keys(command.explanation)) {
          fields[field_id].value += `__**${argument} :**__\n`;
          if ('description' in command.explanation[argument]) fields[field_id].value += `${command.explanation[argument].description}\n`;
          if ('default' in command.explanation[argument]) fields[field_id].value += `**Default:** *${command.explanation[argument].default}*\n`;
          if ('options' in command.explanation[argument]) fields[field_id].value += `**Options:** *${command.explanation[argument].options.join(', ')}*\n`;
        }
      }*/
      
      const requirements = [];
      for (const requirement of ['dev_only', 'guild_only', 'cooldown']) {
        if (requirement in command) {
          requirements.push(requirement.replace('_', ' ') + ': ' + command[requirement]);
        }
      }
      
      if (requirements.length > 0) {
        fields.push({
          name: 'Command Requirements',
          value: requirements.join(' | '),
        });
      }
      
      if ('aliases' in command) {
        fields.push({
          name: 'Command Aliases',
          value: `You can use the command with these alternate names: **${command.aliases.join(", ")}**`,
        });
      }
      
      if (client.subcommands.get(command.name)) {
        let subcmds = client.subcommands.get(command.name).keyArray();
        for (let i = 0; i < subcmds.length; i++) {
          subcmds[i] = "- **" + subcmds[i] + "**: " + client.subcommands.get(command.name).get(subcmds[i]).description;
        }
        subcmds.push(`The subcommands **must go after** the main command. (\`${client.config.prefix} ${command.name} <subcommand>\` )`);
        fields.push({
          name: 'Subcommands',
          value: subcmds.join("\n"),
        });
      }
      
      parent = "";
      if('parent' in command) parent = command.parent + " ";
      msg.channel.send({
        embed: {
          color: Math.floor(Math.random() * 16777214) + 1,
          author: {
            name: client.user.username,
            icon_url: client.user.avatarURL,
          },
       //   title: `${client.config.prefix} ${parent}${command.name}`,
          title: `${client.config.emojis.info} **${parent.toUpperCase()}${command.name.toUpperCase()}**`,
          description: command.description,
          fields: fields,
          timestamp: new Date(),
          footer: {
            icon_url: client.user.avatarURL,
            text: client.config.embed.footer
          },
        },
      });
    }
  },
};