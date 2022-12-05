const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});
const Keyv = require('keyv')
const fs = require("fs")
const gbanConfig = new Keyv('sqlite://db.sqlite', { table: 'gbanConfig' })
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
    gbanConfig.on('error', err => console.error('Keyv connection error:', err));
    
});

client.on("guildCreate", (guild) => {
    guild.systemChannel.send("a")
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
                        .setLabel("🗑️Delete")
                        .setStyle(ButtonStyle.Danger)
                        .setCustomId("delete")
                    )
                ]
            })
        } else if (commandName === "hello"){
            const lang = {
                ja: (name) => `こんにちは、${name}さん。`,
                en: (name) => `Hello, ${name}!`
            }
            return interaction.reply(lang[interaction.options.getString("language")](interaction.member?.displayName || interaction.user.username))
        } else if (commandName === "gban") {
            const choice = interaction.options.getString("option");
            if (choice == "enable") {
                interaction.reply({
                    content: "enabled",
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
                    ],
                    ephemeral: true
                })
            } else if (choice == "disable") {
                interaction.reply({
                    content: "disabled",
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
                    ],
                    ephemeral: true
                })
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId == "delete") {
            interaction.message.delete()
        } else if (interaction.customId == "ok") {
            const configData = gbanConfig.get(interaction.guildId)
            if (!configData) {
                try{
                    gbanConfig.set(interaction.guildId, true)
                }catch(err){
                    console.error(err)
                    client.channels.cache.get(config.log.error).send(err)
                    //TODO:エラーメッセージ返信
                    return;
                }
                client.channels.cache.get(config.log.register).send({
                    embeds: []//TODO:成功ログ中身
                })
                //TODO:登録メッセージ返信
            }
        } else if (interaction.customId == "ng") {
            const configData = gbanConfig.get(interaction.guildId)
            if(!configData) {
                try{
                    gbanConfig.set(interaction.guildId, false)
                }catch(err){
                    console.error(err)
                    client.channels.cache.get(config.log.error).send(err)
                    //TODO:エラーメッセージ返信
                    return;
                }
                client.channels.cache.get(config.log.register).send({
                    embeds: []//TODO:成功ログ中身
                })
                //TODO:登録メッセージ返信
            }
        } else {
            interaction.reply({
                content: "Button",
                ephemeral: true
            })
        }
    }
})

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith("#")) return
    const [command, ...args] = message.content.slice(1).split(/\s+/)
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