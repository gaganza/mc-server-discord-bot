const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require('axios');

let auth;
try {
  auth = require("./auth.json");
} catch (error) {
  auth = { token: process.env.TOKEN };
}

const SERVER_IP = '52.12.233.45';
const API_URL = 'https://api.mcsrvstat.us/2/';
const MY_USER_ID = '272894223546581004';
// channel ID of main server's commands channel
const CHANNEL_ID = '705636547126493195';
const ONE_SECOND = 1000;

// channel ID of my test server's test channel
// const TEST_CHANNEL_ID = '704203409330536501';

function getServerStatusData() {
  return axios.get(`${API_URL}${SERVER_IP}`).then((response) => {
      console.log(response.data);
      return response.data;
  })
}

async function updateChannel() {
  const channel = client.channels.cache.get(CHANNEL_ID);
  
  let serverStatus = await getServerStatusData();
  
  if (serverStatus.online) {
    channel.send(`Currently ${serverStatus.players.online} players online`)
  } else {   
    channel.send(`${client.users.cache.get(MY_USER_ID)} - the server is offline!`)
  }
}

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  updateChannel();
  setInterval(updateChannel, ONE_SECOND * 60 * 60)
});


client.login(auth.token);