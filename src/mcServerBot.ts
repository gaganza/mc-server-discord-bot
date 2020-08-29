import Discord from 'discord.js';
import axios from 'axios';

const client = new Discord.Client();

let auth;
try {
  auth = require('./auth.json');
} catch (error) {
  auth = { token: process.env.TOKEN };
}

const SERVER_IP: string = '52.12.233.45';
const API_URL: string = 'https://api.mcsrvstat.us/2/';
const MY_USER_ID: string = '272894223546581004';
// channel ID of main server's commands channel
const CHANNEL_ID: string = '705636547126493195';
const ONE_SECOND: number = 1000;

// channel ID of my test server's test channel
// const TEST_CHANNEL_ID = '704203409330536501';

interface IServerResponse {
  port: number;
  debug: {
    ping: boolean;
    query: boolean;
    srv: boolean;
    querymismatch: boolean;
    ipinsrv: boolean;
    cnameinsrv: boolean;
    animatedmotd: boolean;
    cachetime: number;
    apiversion: number;
  };
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
  players: { online: number; max: number; list: string[] };
  version: string;
  online: boolean;
  protocol: number;
}

const getServerStatusData = (): Promise<IServerResponse> => {
  return axios.get(`${API_URL}${SERVER_IP}`).then((response) => {
    console.log(response.data);
    return response.data;
  });
};

const updateChannel = async (): Promise<void> => {
  const channel = client.channels.cache.get(CHANNEL_ID);

  if (channel) {
    const serverStatus = await getServerStatusData();

    if (!serverStatus.online) {
      // for some reason my typings state that `send` cannot be used but I know it can so just
      // force casting as any to be able to call it
      (channel as any).send(`${client.users.cache.get(MY_USER_ID)} - the server is offline!`);
    }
  }
};

client.on('ready', async () => {
  if (client && client.user) {
    console.log(`Logged in as ${client.user.tag}!`);
  }

  updateChannel();
  setInterval(updateChannel, ONE_SECOND * 60 * 60);

  client.on('message', async (message) => {
    if (message.content.substring(0, 1) == '#') {
      let args: string[] = message.content.substring(1).split(' ');
      const cmd: string = args[0].toLowerCase();
      args = args.splice(1);

      const serverData: IServerResponse = await getServerStatusData();

      switch (cmd) {
        case 'p':
        case 'ping':
          message.reply(`Currently ${serverData.players.online} players online`);
          break;

        case 'l':
        case 'list':
          if (serverData.players.online > 0) {
            message.reply(`Players currently online: ${serverData.players.list}`);
          } else {
            message.reply('There are no players online');
          }
          break;

        default:
          message.reply('That is an unsupported command');
      }
    }
  });
});

client.login(auth.token);
