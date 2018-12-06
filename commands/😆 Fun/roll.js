module.exports = {
  // Information
  name: 'roll',
  description: 'Bobby will roll a 100-sided die for you.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    msg.channel.send('You rolled a ' + (Math.floor(Math.random() * 100) + 1) + '!');
  },
};