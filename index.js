//https://discordapp.com/api/oauth2/authorize?client_id=1034366705620746281&permissions=8&scope=bot

const {Discord, GatewayIntentBits, Client, ActivityType, Guild, GuildChannel}  = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const mongoose = require('mongoose');
const dues = require('./models/dues.js');
const schedule = require('node-schedule');

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

function scheduleMessage(channel){
    const date = new Date();
    date.addDays(1);
    schedule.scheduleJob(date, () => {
        channel.send("!shame");
    })
}

Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("PAY YOUR DUES");
});

client.on("messageCreate", async (message) => {
    const msg = message.toString().split(" ");

    if(message.content === "ping"){
        message.reply("pong");
    }

    if(msg[0] === "!help"){
        message.channel.send("Commands:\n!due - @<user in debt> <amount to be paid (int)> <message for what it was for> - This is used to assign debt to others\n!shame - (optional)@<user to be shamed> - This is used to shame those who are poor and in debt\n!pay - @<person to be paid> <amount paid> - This is to finally pay of the debt and become free. Amount paid has to be in increments specified when shamed");
    }

    if(msg[0] === "!pay"){
        var owner = message.mentions.users.first().id;
        var id = message.author.id;
        var amount = msg[2];

        const res = await dues.deleteOne({id: id, amount: amount, owner: owner});

        if(res.deletedCount <= 0){
            message.channel.send("Sorry, something went wrong.")
        }else{
            message.channel.send("Debt paid :pensive:");
        }
    }

    if(msg[0] === '!shame'){

        if(message.mentions.users.size === 0){
            var docs = await dues.find({});
            if(docs.length <= 0){
                message.channel.send("There are no outstanding debts :angry:");
            }else{
                for(i = 0; i < docs.length; i++){
                    if(docs[i].message == "\0"){
                        message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> pay up`);
                    }else{
                        message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> for ${String(docs[i].message)} pay up`);
                    }
                }
            }
        }else{    
            var person = message.mentions.users.first().id;    
            var docs = await dues.find({id: person});
            if (docs.length <= 0){
                message.channel.send("You have no outstanding debts :angry:");
            }else{
                for(i = 0; i < docs.length; i++){
                    if(docs[i].message == "\0"){
                        message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> pay up`);
                    }else{
                        message.channel.send(`<@${String(docs[i].id)}> you owe $${String(docs[i].amount)} to <@${String(docs[i].owner)}> for ${String(docs[i].message)} pay up`);
                    }
                }
            }
        }
    }

    if(msg[0] === '!parrot'){
        var p = "";
        for(i = 1; i < msg.length; i++){
            p = p + msg[i];
        }
        message.channel.send(p);
    }

    if(msg[0] === '!due'){
        var person = message.mentions.users.first().id;
        var today = new Date();

        if(msg.length == 3){
           if(isNaN(parseInt(msg[2]))){
            message.channel.send("Make sure your amount is a number");
           }else{
            const due = new dues ({
                id: String(person),
                amount: parseInt(msg[2]),
                date: today.toString(),
                owner: message.author.id,
                message: "\0"
            })
    
            waitSave(due);

            message.channel.send(`Noted :eyes:`);
           }
        }else if(msg.length >= 4){
            if(isNaN(parseInt(msg[2]))){
                message.channel.send("Make sure your amount is a number");
               }else{
                var dueMessage = "";
                for(var i = 3; i < msg.length; i++){
                    dueMessage = dueMessage.concat(" ", msg[i]);
                }
                console.log(dueMessage);
                const due = new dues ({
                    id: String(person),
                    amount: parseInt(msg[2]),
                    date: today.toString(),
                    owner: message.author.id,
                    message: dueMessage
                })
        
                waitSave(due);
    
                message.channel.send(`Noted :eyes:`);
               }
        }else{
            message.channel.send("There are not enough spaces for all parameters to have been met");
        }
    }
});

async function waitSave(due){
    due.save()
        .then(result => console.log(result))
        .catch(err => console.log(err));
}

client.login(TOKEN);