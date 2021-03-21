module.exports = {
   // host: process.env.CLEARDB_DATABASE_URL,
   // host: "http://187.45.196.222", IP do Banco de Dados
    host: process.env.MYSQL_URL,
    dialect: "mysql",
    username: "valorize_db",
    password: "db@valorize*07",
    database: "valorize_db",
    define: {
        timestamps: true,
        underscored: true,
    },
}