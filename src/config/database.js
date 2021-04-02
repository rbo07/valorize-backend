module.exports = {
    host: process.env.HOST_NAME,
    dialect: "mysql",
    username: process.env.USER_NAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    define: {
        timestamps: true,
        underscored: true,
    },
}