/* *
 * DiscoBot - Gaymers Discord Bot
 * Copyright (C) 2015 - 2017 DiscoBot Authors
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 * */

const commands = require('../index');

module.exports = {
  usage: '',
  description: 'See what commands I can run!',
  allowDM: true,
  process: (bot, message) => {

    function generateCommandSet(role) {

      let title = role ? role : 'Available';
      title += ' Commands';
      let commandString = '```markdown' + '\n';

      commandString +=  title + '\n';
      commandString +=  Array(title.length + 1).join('=') + '\n';
      let commandArray = [];

      // TODO: Display commands based on requireRoles
      for (let command in commands.commands) {
        let cmd = commands.commands[command];
        let info = '!' + command;

        // Skip commands that require roles based on parameter
        if (cmd.requireRoles && !role){
          // Drops user commands
          continue;
        }
        if (!cmd.requireRoles && role){
          // Drops non role commands when generating role list
          continue;
        }

        if (cmd.requireRoles && role){
          if (!cmd.requireRoles.includes(role)){
            // Drops commands not requiring the role parameter
            continue;
          }
        }

        if (cmd.usage) {
          info += ' ' + cmd.usage;
        }

        if (cmd.description) {
          info += ' - ' + cmd.description;
        }

        if ((commandString.length + info.length) < 1900) {
          commandString += info + '\n';
        } else {
          commandString += '```';
          commandArray.push(commandString);
          commandString = '```'; // Reset
          commandString += info + '\n';
        }
      }
      commandString += '```';
      commandArray.push(commandString);

      return commandArray;
    }

    const userMessage = 'Available Commands';
    const userCommands = generateCommandSet(false);
    const member = bot.guilds.first().members.get(message.author.id);

    for (let i = 0; i < userCommands.length; i++) {
      message.author.send(userCommands[i]);
    }

    if (member.roles.exists('name','Moderator') && !member.roles.exists('name','Admin')) {

      const modCommands = generateCommandSet('Moderator');
      for (let i = 0; i < modCommands.length; i++) {
        message.author.send(modCommands[i]);
      }
    }

    if (member.roles.exists('name','Admin')) {
      const adminCommands = generateCommandSet('Admin');
      for (let i = 0; i < adminCommands.length; i++) {
        message.author.send(adminCommands[i]);
      }
    }

    // If !help was run in a public channel, send a message to that channel too
    if (message.channel.type === 'text') {
      message.reply('Check your DMs :wink:');
    }
  }
};
