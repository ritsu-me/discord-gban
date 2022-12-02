const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
            .setTimestamp()
        ]
    })
    client.user.setActivity('Setting up GBAN function...', { type: 'PLAYING' });
    lang.on('error', err => console.error('Keyv connection error:', err));
    
});

client.on("guildCreate", (guild) => {
    guild.systemChannel.send()
})

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        const { commandName } = interaction
        if (commandName === "ping"){
            const apiPing = Date.now() - interaction.createdTimestamp
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":ping_pong:Pong!")
                    .setDescription("Here's your pings!!")
                    .addFields(
                        {
                            name: ":electric_plug:WebSocket Ping",
                            value: "`" + client.ws.ping + "ms`"
                        },
                        {
                            name: ":yarn:API Endpoint Ping",
                            value: "`" + apiPing + "ms`"
                        }
                    )
                    .setColor("#2f3136")
                    .setTimestamp()
                ]
            })
            return interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(":ping_pong:Pong!")
                    .setDescription("Here's your pings!!")
                    .addFields(
                        {
                            name: ":electric_plug:WebSocket Ping",
                            value: "`" + client.ws.ping + "ms`",
                            inline: true
                        },
                        {
                            name: ":yarn:API Endpoint Ping",
                            value: "`" + apiPing + "ms`",
                            inline: true
                        },
                        {
                            name: "WebSocket Latency",
                            value: "`" + client.ws.ping*2 + "ms`"
                        }
                    )
                    .setColor("#2f3136")
                    .setTimestamp()
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel("Confirm")
                        .setStyle(ButtonStyle.Success)
                        .setCustomId("ok")
                    )
                    .addComponents(
                        new ButtonBuilder()
                        .setLabel("Discard")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("ng")
                    )
                ]
            })
        } else if (commandName === "hello"){
            const lang = {
                ja: (name) => `こんにちは、${name}さん。`,
                en: (name) => `Hello, ${name}!`
            }
            return interaction.reply(lang[interaction.options.getString("language")](interaction.member?.displayName || interaction.user.username))
        } else if (commandName === "register") {
            interaction.reply({//サーバー追加時にメッセージ送信
                embeds: [
                    new EmbedBuilder()
                    .setTitle("Thank you for using GBAN!!")
                    .setDescription(":flag_us:Please select language that you want to use in this Bot.\n:flag_jp:このBotで使用したい言語を選んでください。")
                    .setColor("#2f3136")
                ],
                components: [
                    new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('en')
                            .setLabel('English')
                            .setStyle(ButtonStyle.Primary)
                    ).addComponents(
                        new ButtonBuilder()
                            .setCustomId('jp')
                            .setLabel('日本語')
                            .setStyle(ButtonStyle.Primary)
                    )
                ],
                ephemeral: true
            })
        }
    } else if (interaction.isButton()) {
        interaction.reply({
            content: "おん",
            ephemeral: true
        })
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