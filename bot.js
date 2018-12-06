// Import anything and everything required throughout the project
// *****************************************************************************
const Discord = require('discord.js');
const client = new Discord.Client();
client.config = require('./settings.json');
const prefix = client.config.prefix;
const fs = require('fs');
const Sequelize = require('sequelize');

// Setup Discord.js Client/Bot
// *****************************************************************************
client.commands = new Discord.Collection();
client.subcommands = new Discord.Collection();
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
    if(fs.lstatSync(`./commands/${folder}/${file}/`).isDirectory()) {
      subcmds = new Discord.Collection();
      let subcmd_files = fs.readdirSync(`./commands/${folder}/${file}/`);
      for(let subcmd_file of subcmd_files) {
        let command = require(`./commands/${folder}/${file}/${subcmd_file}`);
        subcmds.set(command.name, command);
      }
      client.subcommands.set(file, subcmds);
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

client.is_developer = (id) => {
  return client.config.developer_ids.includes(id);
};

/**
* Adds a msg to reaction listening collection.
* @param {String/Object} [message] Discord Message's id/ Discord Message object.
* @return {Boolean} True if added; else false.
*/
client.remove_msg_reaction_listener = (message) => {};

const Sounds = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: 'sounds.sql',
});

const sounds = Sounds.define('sounds', {
  name: {
    type: Sequelize.STRING,
    unique: true,
  },
  url: Sequelize.STRING,
  userID: Sequelize.STRING,
  usage_count: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
});

client.sounds = sounds;


client.on('ready', () => {
  sounds.sync();
  console.log('Ready!');
  client.user.setActivity(`${client.config.prefix} help | ${client.guilds.size} servers`);
});

client.on('message', msg => {
  // if message doesn't start with prefix ignore
  if (!msg.content.startsWith(client.config.prefix) || msg.author.bot) return;
  
  // parse arguments
  const args = msg.content.slice(client.config.prefix.length + 1).split(" ");
  
  // get command name from arguments
  const command_name = args.shift().toLowerCase();
  
  // test if command exists
  const command = client.commands.get(command_name) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command_name));
  if(!command) return; // if it doesn't, ignore it
  
  client.handleCommand(command, msg, args);  
});

/**
 * Handles passed in command
 * @param {Object} [command] The command to be handled
 * @param {Object} [msg] The message that requested the command to be handled
 * @param {Array} [args] An array of everything the user wrote after the command call
 */
client.handleCommand = (command, msg, args) => {
  
  // if required arguments aren't specified, don't run command and notify end user
  if ('args' in command && command.args.req && command.args.min > args.length) {
    let parent = " ";
    if('parent' in command) parent = command.parent + " ";
    return msg.channel.send(`You didn't provide the required arguments!\nUsage: \`${client.config.prefix} ${parent}${command.name} ` + ('usage' in command ? command.usage : '') + '`');
  }
  // if command has subcommands
  if (client.subcommands.get(command.name)) {
    if(args.length < 1) return msg.channel.send(`${client.config.emojis.x} No subcommand specified`)
    const subcommand = client.subcommands.get(command.name).find(cmd => cmd.aliases && cmd.aliases.includes(args[0])) || client.subcommands.get(command.name).get(args.shift()); // see if the subcommand exists
    if(!subcommand) return msg.channel.send(`${client.config.emojis.x} Subcommand not found!\n${client.config.emojis.info} For further help, use \`${client.config.prefix} help sounds\``) // if no, notify user and return
    
    // run the command
    try {
      client.handleCommand(subcommand, msg, args)
    } catch (err) {
      // if exception thrown notify end user and error in console
      console.error(err);
      msg.channel.send(`${client.config.emojis.x} An error occured while executing that command!`);
    }
    // return as to not error because command.run isn't a thing (see sounds.js)
    return;
  }
  // if no subcommands, run the command normally
  try {
    command.run(client, command, msg, args);
  } catch (error) {
    console.error(error);
    msg.channel.send(`${client.config.emojis.x} An error occured while executing that command!`);
  }
}

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
      description: `Yo, I\'m bobby.`,
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