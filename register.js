// コマンド設定部分
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("./config.js")
require("dotenv").config();

const ping = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong!')
    
const hello = new SlashCommandBuilder()
    .setName('hello')
    .setDescription('挨拶をします。')
    .addStringOption(option =>
        option
            .setName('language')
            .setDescription('言語を指定します。')
            .setRequired(true) //trueで必須、falseで任意
            .addChoices(
                {name:'Japanese', value:'ja'},
                {name:'English', value:'en'}
            )
    );

const commands = [ping, hello]

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)
async function main(){
    await rest.put(
        Routes.applicationCommands(config.clientID),
        { body: commands }
    )
}

main().catch(err => console.log(err))