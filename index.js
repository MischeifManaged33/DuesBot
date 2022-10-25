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

    if(msg[0] === "!pay"){
        
    }

    if(msg[0] === '!shame'){

        if(message.mentions.users.size === 0){
        dues.find({}, function(err, docs){
            if(err){
                message.channel.send('you have no overdue funds!! (or emma made an error)');
            }else{
                for(i = 0; i < docs.length; i++){
                    message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> pay up`);
                }
            }
        })
    }else{    
        var person = message.mentions.users.first().id;    
        dues.find({id: person}, function (err, docs) {
            if(err){
                message.channel.send('you have no overdue funds!! (or emma made an error)');
            }else{
                for(i = 0; i < docs.length; i++){
                    message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> pay up`);
                }
            }
        });
    }
        
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
            date: week.toString(),
            owner: message.author.id
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