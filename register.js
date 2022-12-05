// コマンド設定部分
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("./config.js")
require("dotenv").config();

const ping = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('pong!');

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

const register = new SlashCommandBuilder()
    .setName("gban")
    .setDescription("グローバルBAN機能の設定です。[管理者コマンド]")
    .addStringOption(option =>
        option
            .setName("option")
            .setDescription("GBANを使用するかしないか選択できます。")
            .setRequired(true)
            .setChoices(
                {
                    name: "使用する",
                    value: "enable"
                },
                {
                    name: "使用しない",
                    value: "disable"
                }
            )
        )

const commands = [ping, hello]
const adminCmd = [register]

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