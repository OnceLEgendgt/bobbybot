const Discord = require('discord.js');
const client = new Discord.Client();
client.config = require('./settings.json');
const prefix = client.config.prefix;
const fs = require('fs');

client.commands = new Discord.Collection();
const command_folders = fs.readdirSync('./commands');
for (const folder of command_folders) {
  const command_files = fs.readdirSync(`./commands/${folder}`);
  for (const file of command_files) {
    if (file.split('.').pop() === 'js') {
      const command = require(`./commands/${folder}/${file}`);
      command.category = folder;
      client.commands.set(command.name, command);
    }
  }
}


client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    const msg = message;
    const args = msg.content.slice(client.config.prefix.length + 1).split(/ +/g);
    const command_name = args.shift().toLowerCase();

    const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
    if(!command) return;

    if ('args' in command && command.args.req && command.args.min > args.length) {
        return msg.channel.send(`You didn't provide the required arguments!\nUsage: \`${client.config.prefix} ${command.name} ` + ('usage' in command ? command.usage : '') + '`');
      }

    try {
        command.run(client, command, msg, args);
      } catch (error) {
        console.error(error);
        msg.channel.send('There was an error in trying to execute that command!');
      }
});

client.on('guildCreate', guild => {
    // Get channel in which bot is allowed to msg
    const default_channel = guild.channels.find(channel => channel.type === 'text' && channel.permissionsFor(guild.me).has('SEND_MESSAGES'));
    if (!default_channel) return;
  
    default_channel.send({
      embed: {
        color: 0xff4d4d,
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL,
        },
        title: 'Howdy folks!',
        url: 'https://discord.js.org/#/',
        description: `Yo, i\'m bobby.`,
        timestamp: new Date(),
        footer: {
          icon_url: client.user.avatarURL,
          text: 'yo',
        },
      },
    });
  });

client.login(client.config.token);