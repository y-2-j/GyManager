let config;

switch (process.env.NODE_ENV) {
    case "production":
        config = {
            SERVER: {
                PORT: process.env.PORT,
                HOST: process.env.HOST
            },
            DB: {
                USER: process.env.DB_USER,
                PASSWORD: process.env.DB_PASSWORD,
                HOST: process.env.DB_HOST,
                DATABASE: process.env.DATABASE
            },
            SESSION_SECRET: process.env.SESSION_SECRET,
            COOKIE_SECRET: process.env.COOKIE_SECRET
        };
        break;

    default:
        config = require("./secret.json");
        break;
}

module.exports = config;