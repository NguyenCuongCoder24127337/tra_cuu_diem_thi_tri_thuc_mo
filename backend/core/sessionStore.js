const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");

async function createSessionStore(redisUrl) {
  const client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 20) {
          return new Error("Redis reconnect failed");
        }

        return Math.min(retries * 100, 3000);
      },
    },
  });

  client.on("error", (error) => {
    console.error("Redis session error:", error.message);
  });

  await client.connect();

  return {
    client,
    store: new RedisStore({
      client,
      prefix: "tra-cuu-diem:sess:",
    }),
  };
}

module.exports = {
  createSessionStore,
};
