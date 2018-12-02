const Discord = require('discord.js');
const client = new Discord.Client();
client.config = require('./settings.json');
const prefix = client.config.prefix;
const fs = require('fs');

client.commands = new Discord.Collection();
client.reaction_msgs = new Discord.Collection();
client.cooldowns = new Discord.Collection();

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

/**
 * Adds a msg to reaction listening collection.
 * @param {Object} [command] Object representing a bot's command.
 * @param {String/Object} [message] Discord Message's id/ Discord Message object.
 * @param {Array} [reactions] Array containing all Reactions to listen for.
 * @param {Object} [options] Object containing options; options: timeout: integer/false, user_id: string
 * @return {Boolean} True if added; else false.
 */
client.add_msg_reaction_listener = async (command, message, reactions, options) => {
  options = Object.assign({
    time: 60,
    extra: {},
  }, options);

  for (let reaction of reactions) {
    await message.react(reaction);
  }

  client.reaction_msgs.set(message.id, {
    time: options.time,
    emojis: reactions,
    command_name: command.name,
    message: message,
    extra: options.extra,
  });
};

/**
 * Adds a msg to reaction listening collection.
 * @param {String/Object} [message] Discord Message's id/ Discord Message object.
 * @return {Boolean} True if added; else false.
 */
client.remove_msg_reaction_listener = (message) => {};


client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    const msg = message;
    const args = msg.content.slice(client.config.prefix.length + 1).split(" ");
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

  client.on('messageReactionRemove', (reaction, user) => {
    if (user.bot) return;
  
    const data = client.reaction_msgs.get(reaction.message.id);
    if (!data) return;
    if (data.time <= ((new Date() - data.message.createdAt) / 1000)) return client.reaction_msgs.delete(reaction.message.id);
  
    if (data.emojis.includes(reaction.emoji.name)) {
      const command = client.commands.get(data.command_name);
      if (!command) return;
  
      try {
        command.on_reaction(client, command, data, 'removed', reaction);
      } catch (error) {
        console.error(error);
        data.message.channel.send('There was an error in trying to execute that command!');
      }
    }
  });

client.login(client.config.token);