// コマンド設定部分
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("./config.js")
require("dotenv").config();

const ping = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong!');

const commands = [ping]
const adminCmd = []

//登録用関数
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v10');
const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)
async function main(){
    await rest.put(
        Routes.applicationCommands(config.clientID),
        { body: commands }
    );
    await rest.put(
        Routes.applicationGuildCommands(config.clientID, config.dev.testGuild),
        { body: adminCmd }
    )
}

main().catch(err => console.log(err))