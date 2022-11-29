const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require('discord.js');
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});
const Keyv = require('keyv')
const fs = require("fs")
const lang = new Keyv('sqlite://db.sqlite', { table: 'lang' })
const config = require("./config.js")
const functions = require("./functions.js")
require("dotenv").config()

client.once("ready", () => {
    console.log("Logged in as " + client.user.tag + ".")
    client.channels.cache.get(config.log.ready).send({
        embeds: [
            new EmbedBuilder()
            .setTitle("起動完了")
            .setDescription("> Botが起動しました。\n> 運営担当者は動作チェックをお願いします。")
            .setColor("#2f3136")
            .addFields(
                {
                    name: "WebSocket Ping",
                    value: "`" + client.ws.ping + "ms`"
                }
            )
            .setTimestamp()
        ]
    })
    lang.on('error', err => console.error('Keyv connection error:', err));
    
});

client.on("guildCreate", (guild) => {
    guild.systemChannel.send()
})

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()){
        const { commandName } = interaction
        if (commandName === "ping"){
            const now = Date.now()
            const text = `pong!\n\ngateway:${client.ws.ping}ms`
            await interaction.reply({
                content: text,
                ephemeral: true
            })
            return interaction.editReply(`${text}\n往復:${Date.now() - now}ms`)
        } else if (commandName === "hello"){
            const lang = {
                ja: (name) => `こんにちは、${name}さん。`,
                en: (name) => `Hello, ${name}!`
            }
            return interaction.reply(lang[interaction.options.getString("language")](interaction.member?.displayName || interaction.user.username))
        }
    }
})

process.on("uncaughtException", error => {
    console.error(`[${functions.timeToJST(Date.now(), true)}] ${error.stack}`);
    const embed = new EmbedBuilder()
        .setTitle("ERROR - uncaughtException")
        .setDescription("```\n" + error.stack + "\n```")
        .setColor("#e83929")
        .setTimestamp();
    client.channels.cache.get(config.log.error).send({ embeds: [embed] });
});

process.on("unhandledRejection", (reason, promise) => {
    console.error(`\u001b[31m[${functions.timeToJST(Date.now(), true)}] ${reason}\u001b[0m\n`, promise);
    const embed = new EmbedBuilder()
        .setTitle("ERROR - unhandledRejection")
        .setDescription("```\n" + reason + "\n```")
        .setColor("#e83929")
        .setTimestamp();
    client.channels.cache.get(config.log.error).send({ embeds: [embed] });
});

client.login(process.env.BOT_TOKEN)