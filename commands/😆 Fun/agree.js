module.exports = {
  // Information
  name: 'agree',
  aliases: ['ok'],
  description: 'Bobby agrees with you.',
  // Requirements
  // Function
  run: (client, command, msg, args) => {
    msg.channel.send(`I agree with ${msg.member.user}`);
  },
};