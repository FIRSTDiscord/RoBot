// Work on perms checks
module.exports = {
    name: 'prune',
    type: 'moderation',
    usage: 'prune <amount> | <user-mention> | bots',
    permission: 2,
    help: 'Prunes messages from the channel.',
    main: function(bot, msg) {
        if (msg.member.hasPermission('MANAGE_MESSAGES') || msg.author.id === require('../config.json').owner) {
            var num = msg.content;
            if (!isNaN(num)) {
                msg.channel.fetchMessages({
                        limit: num
                    })
                    .then(messages => msg.channel.bulkDelete(messages))
                    .catch(msg.channel.bulkDelete);

                msg.channel.send('Deleted ' + num + ' messages under request of <@' + msg.author.id + '>')
                    .then(msg2 => setTimeout(() => {
                        msg2.delete();
                    }, 5000));
            } else if (msg.mentions.users.first()) {
                var amount = num.split(" ")[1] || null;
                console.log(amount);
                msg.channel.fetchMessages({
                        limit: 100
                    })
                    .then(messages => {
                        msgar = messages.array();
                        msgar = msgar.filter(msg2 => msg2.author.id === msg.mentions.users.first().id);
                        if (amount && !isNaN(amount)) msgar = msgar.slice(0, amount);
                        msgar.map(msg => msg.delete().catch(console.error));
                        msg.channel.send('Deleted ' + msgar.length + ' messages from **' + msg.mentions.users.first().username + '** under request of <@' + msg.author.id + '>')
                            .then(msg2 => setTimeout(() => {
                                msg2.delete();
                            }, 5000));
                    });
            } else if (num == "bots") {
                console.log(amount);
                msg.channel.fetchMessages({
                        limit: 100
                    })
                    .then(messages => {
                        msgar = messages.array();
                        msgar = msgar.filter(msg => msg.author.bot);
                        msgar.map(msg => msg.delete().catch(console.error));
                        msg.channel.send('Deleted ' + msgar.length + ' messages from **bots** under request of <@' + msg.author.id + '>')
                            .then(msg2 => setTimeout(() => {
                                msg2.delete();
                            }, 5000));
                    });
            } else {
                msg.channel.send('Please specify a number, mention a user, mention a user and specify a number, or use the bots argument!');
            }
        }
    },
};
