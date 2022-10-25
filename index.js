//https://discordapp.com/api/oauth2/authorize?client_id=1034366705620746281&permissions=8&scope=bot

const {Discord, GatewayIntentBits, Client}  = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const dues = require('./models/dues.js');

async function main(){
    await mongoose.connect(process.env.MONGO_DB);
}

main();

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
        message.channel.send(`Noted :eyes:`);
        var today = new Date();
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }

        week = today.addDays(7);

        const due = new dues ({
            id: person,
            amount: parseInt(msg[2]),
            date: week.toString()
        })

        waitSave(due);
    }
});

async function waitSave(due){
    due.save()
        .then(result => console.log(result))
        .catch(err => console.log(err));
}

client.login(TOKEN);