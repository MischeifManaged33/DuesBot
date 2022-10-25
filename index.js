//https://discordapp.com/api/oauth2/authorize?client_id=1034366705620746281&permissions=8&scope=bot

const {Discord, GatewayIntentBits, Client}  = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
});

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", (message) => {
    const msg = message.toString().split(" ");

    if(message.content === "ping"){
        message.reply("pong");
    }

    if(msg[0] === '!due'){
        var person = message.mentions.users.first().id;
        message.channel.send(`Hey, <@${person}>`);

        const newb = {
            "id": person,
            "amount": 0,
            "time": 0
        }

        const data = JSON.stringify(newb);

        fs.appendFile("./dues.json", data, function(err){});
    }
});

client.login(TOKEN);