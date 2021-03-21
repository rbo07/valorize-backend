module.exports = {
    host: process.env.MYSQL_URL,
    // host: "http://187.45.196.222", IP do Banco de Dados
    dialect: "mysql",
    username: "valorize_db",
    password: "db@valorize*07",
    database: "valorize_db",
    define: {
        timestamps: true,
        underscored: true,
    },
}