const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});
const mongoose = require('mongoose');
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
});

client.on("guildCreate", (guild) => {
    guild.systemChannel.send("test")
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
        } else if (commandName == "gban") {//TODO:このコマンドのメッセージを整形
            if (config.dev.developerID.includes(interaction.user.id) === true) {
                const inputID = interaction.options.getString("user_id");
                if (inputID == interaction.user.id)return interaction.reply({
                    content: "自分のことはBANできません。",
                    ephemeral: true
                });
                const inputReason = interaction.options.getString("reason")
                const reason = client.user.tag + "が実行 | 理由:" + inputReason + " | 7日分のメッセージを同時に削除 | ©2022 DiscordHeiwaGroup"
                if (inputID.match(/\d{10,20}/)) {
                    try{
                        client.guilds.cache.forEach(guilds => {
                            guilds.members.ban(
                                inputID, {reason: reason, days: 7}
                            )
                        })
                    }catch(err){
                        console.log(err)
                        interaction.reply({
                            content: err,
                            ephemeral: true
                        })
                        return;
                    }
                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle("SUCCESSFULY GBANed!!")
                            .setDescription("I've banned <@!" + inputID + ">\nReason for " + inputReason)
                            .setColor("#2f3136")
                            .setTimestamp()
                        ]
                    })
                } else {
                    interaction.reply({
                        content: "ID doesn't matches \d{10,20}",
                        ephemeral: true
                    })
                }
            }
        }
    } else if (interaction.isButton()) {
        if (interaction.customId == "delete") {
            interaction.message.delete()
        } else {
            interaction.reply({
                content: "Button",
                ephemeral: false
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