var config = require("./config.json");
var sqlite3 = require('sqlite3').verbose();
var m = new Date().getMonth() + 1;
var y = new Date().getFullYear();
var db = new sqlite3.Database('frclogs-' + m + '-' + y + '.sqlite');
const Discord = require("discord.js");
const fse = require("fs-extra");

const PREFIX = config.prefix;
const isCommander = ["171319044715053057", "180094452860321793"];
let bot = new Discord.Client({fetchAllMembers: true, sync: true, disabledEvents: ["TYPING_START", "TYPING_STOP", "ROLE_CREATE", "ROLE_DELETE", "USER_UPDATE"]});

var chalk = require("chalk");
var chan = chalk.bold.red;
var usr = chalk.bold.green;
var message = chalk.bold.blue;
var cmand = chalk.bgRed;
var gray = chalk.gray;

let plugins = new Map();

function loadPlugins() {
    console.log(__dirname + "/plugins");
    let files = fse.readdirSync(__dirname + "/plugins", "utf8");
    for (let plugin of files) {
        if (plugin.endsWith(".js"))
            plugins.set(plugin.slice(0, -3), require(__dirname + "/plugins/" + plugin));
        else
            console.log(plugin);
    }
    console.log("Plugins loaded.");
}

bot.on("ready", () => {
    console.log("RoBot is ready! Loading plugins...");
    loadPlugins();

    var str = "";
    var currentTime = new Date()
    var hours = currentTime.getHours()
    var minutes = currentTime.getMinutes()
    var seconds = currentTime.getSeconds()
    if (minutes < 10)
        minutes = "0" + minutes;
    if (seconds < 10)
        seconds = "0" + seconds;
    str += hours + ":" + minutes + ":" + seconds;
    console.log("Bot Online and Ready! On " + bot.guilds.size + " Servers!");
    bot.users.get(config.owner).sendMessage(":stopwatch: ``" + str + "`` :mega: RoBot is online and ready! :white_check_mark:");
    bot.user.setGame("FIRST Steamworks 2017");
});

bot.on("message", (msg) => {
    var n = msg.createdAt.toTimeString();
    var str = n.substring(0, n.indexOf(" "));

    if (msg.channel.type === "text") {
      var day = new Date().getDate();
      var month = new Date().getMonth() + 1;
      var year = new Date().getFullYear();
      db.serialize(function() {
        db.run(`CREATE TABLE IF NOT EXISTS frc_logs_${month}_${day}_${year} (MSGINDEX INTEGER PRIMARY KEY, TIME DATETIME DEFAULT CURRENT_TIMESTAMP, CHANNEL_ID VARCHAR(32) NOT NULL, CHANNEL_NAME VARCHAR(32) NOT NULL, AUTHOR_ID VARCHAR(32) NOT NULL, AUTHOR_NAME VARCHAR(32) NOT NULL, AUTHOR_NICKNAME VARCHAR(32), MESSAGE VARCHAR(2000) NOT NULL)`);
        var stmt = db.prepare(`INSERT INTO frc_logs_${month}_${day}_${year} (CHANNEL_ID, CHANNEL_NAME, AUTHOR_ID, AUTHOR_NAME, AUTHOR_NICKNAME, MESSAGE) VALUES (?, ?, ?, ?, ?, ?)`);
        var channelID = msg.channel.id, channelName = msg.channel.name, authorID = msg.author.id, authorNAME = msg.author.username, authorNICK = msg.member.nickname, message = msg.cleanContent;
        stmt.run(channelID, channelName, authorID, authorNAME, authorNICK, message);
        stmt.finalize();
      });

		  console.log(gray("[" + str + "] ") + chan(msg.channel.name) + " | " + usr(msg.author.username) + " | " + message(msg.cleanContent));

        if (msg.author.bot) return;

        if (msg.content.startsWith("I have read the rules and regulations") && msg.channel.id === "253661179702935552") {
            msg.guild.members.get(msg.author.id).setNickname(msg.author.username + " - (SET TEAM#)");
			msg.member.addRole('246469964574228481')
			.then(bot.channels.get("200090417809719296").sendMessage(msg.author + " has entered the server! They are member number " + msg.guild.members.size))
			.catch(err => {console.log(err)})
			
            setTimeout(function() {
                bot.channels.get("200090417809719296").sendMessage(msg.author.username + " Join Nick set to --> ``" + msg.author.username + " - (SET TEAM#)``");
            }, 1000)

            bot.channels.get('267837014014033931').sendMessage("Welcome " + msg.author + " to the **FIRST Robotics Competition Discord Server!** We now have ``" + msg.guild.members.size + "`` members.");
			msg.author.sendMessage("Thank you for reading the rules and regulations. We would like to welcome you to the FIRST Robotics Competition Discord Server! " +
                "Please follow the server rules and have fun! Don't hesitate to ping a member of the moderation team " +
                "if you have any questions! \n\n*Please change your nick with '/nick NAME - TEAM#' to reflect your team number!*");
            msg.guild.channels.get('253661179702935552').fetchMessages({
				limit: 5
			})
			.then(messages => msg.channel.bulkDelete(messages))
			.catch(msg.channel.bulkDelete);
			msg.channel.sendMessage("Welcome to our server. This is the channel for new member verification. Please read <#288856064089128960> to enter the server!")
        }

        if (msg.content.startsWith(PREFIX)) {
            var content = msg.content.split(PREFIX)[1];
			
			var cmd = content.substring(0, content.indexOf(" ")),
				args = content.substring(content.indexOf(" ") + 1, content.length);
				
			if(cmd == "sudo" && isCommander.indexOf(msg.author.id) > -1) {
				msg.delete();
				content = msg.content.split(PREFIX)[2];
				msg.author = msg.mentions.users.array()[0];
				msg.member = msg.guild.members.get(msg.mentions.users.array()[0].id);
				console.log(content + "|" + msg.author.username);
				cmd = content.substring(0, content.indexOf(" "));
				args = content.substring(content.indexOf(" ") + 1, content.length);
			}
			
			command(msg, cmd, args, content);
        }
    } else {
		if (msg.author.bot) return;
		msg.channel.sendMessage("This bot cannot be used in DMs!");
	}
});

bot.on("guildMemberAdd", (member) => {
    if (member.guild.id === "176186766946992128") {
        bot.channels.get('200090417809719296').sendMessage(member + " joined the server");

        member.guild.channels.get('253661179702935552').sendMessage("Welcome " + member + " to the FIRST® Robotics Competition server! " +
            "You are currently unable to see the server's main channels. " +
            "To gain access to the rest of the server, please read the rules in <#288856064089128960>.");
    }
});

bot.on("guildMemberRemove", (member) => {
    bot.channels.get('267837014014033931').sendMessage(member.user.username + " left the server. RIP " + member.user.username + ".");
});

bot.on("guildBanAdd", (guild, user) => {
    bot.channels.get('267837014014033931').sendMessage(":hammer: " + user.user.username + " was banned.");
});

bot.on("voiceStateUpdate", (oldMember, newMember) => {
	if(newMember.voiceChannel != null) {
		if(newMember.voiceChannel.name.includes("General") && newMember.voiceChannel.name.includes("#1"))
			newMember.addRole('296436001524547584')
		else if(newMember.voiceChannel.name.includes("General") && newMember.voiceChannel.name.includes("#2"))
			newMember.addRole('296436015156166657')
		if(oldMember.voiceChannel != null) {
			if(oldMember.voiceChannel.name.includes("General") && !newMember.voiceChannel.name.includes("General"))
				newMember.removeRoles(['296436001524547584', '296436015156166657'])
			else {
				if(oldMember.voiceChannel.name.includes("General #1") && newMember.voiceChannel.name.includes("General #2"))
					newMember.removeRole('296436001524547584')
				else if(oldMember.voiceChannel.name.includes("General #2") && newMember.voiceChannel.name.includes("General #1"))
					newMember.removeRole('296436015156166657')
			}
		}
	} else {
		if(oldMember.voiceChannel.name.includes("General"))
			newMember.removeRoles(['296436001524547584', '296436015156166657'])
	}
});

bot.login(config.token);

function command(msg, cmd, args, content) {
	if (plugins.get(cmd) !== undefined && content.indexOf(" ") !== -1) {
		console.log(cmand(msg.author.username + " executed: " + cmd + " " + args));
		msg.content = args;
		plugins.get(cmd).main(bot, msg);
	} else if (plugins.get(content) !== undefined && content.indexOf(" ") < 0) {
		console.log(cmand('[NOARGS]' + msg.author.username + " executed: " + content));
		plugins.get(content).main(bot, msg);
	} else {
		console.log("ERROR:" + content);
	}
}
