import {Client} from "discord.js";

export const createBot = () => {
    const bot = new Client();

    bot.on('ready', () => {
        console.log(`Logged in as ${bot.user!.tag}!`);

    });

    bot.on('message', msg => {
        if (msg.content === 'ping') {
            msg.reply('Pong!');
        }
    });

    bot.login(process.env.BOT_TOKEN);

    return bot;
}