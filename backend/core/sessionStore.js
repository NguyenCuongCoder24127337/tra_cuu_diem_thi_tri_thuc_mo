const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");
const session = require("express-session");

async function createSessionStore(redisUrl) {
  if (!redisUrl) {
    return {
      client: null,
      store: new session.MemoryStore(),
      isMemoryStore: true,
    };
  }

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

  await client.connect();

  client.on("error", (error) => {
    console.error("Redis session error:", error.message);
  });

  return {
    client,
    store: new RedisStore({
      client,
      prefix: "tra-cuu-diem:sess:",
    }),
    isMemoryStore: false,
  };
}

module.exports = {
  createSessionStore,
};
