// コマンド設定部分
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require("./config.js")
require("dotenv").config();

const ping = new SlashCommandBuilder()
.setName('ping')
.setDescription('Ping値を出力します。[なし]');

const gban = new SlashCommandBuilder()
.setName("gban")
.setDescription("ユーザーに対してグローバルBANを実行します。[Bot管理者専用コマンド]")
.addStringOption(option =>
    option
    .setName("user_id")
    .setDescription("GBANを実行するユーザーのIDを入力します。")
    .setRequired(true)
)
.addStringOption(option =>
    option
    .setName("reason")
    .setDescription("GBANを実行する理由を入力します。")
    .setRequired(true)
)

const commands = [ping]
const adminCmd = [gban]

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