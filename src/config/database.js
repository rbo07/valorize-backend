module.exports = {
   // host: process.env.CLEARDB_DATABASE_URL,
   // host: "http://187.45.196.222", IP do Banco de Dados
   // host: us-cdbr-east-03.cleardb.com
   //mysql://baa6f81fbb6f42:116d857a@us-cdbr-east-03.cleardb.com/heroku_56fabe11fc4acdd?reconnect=true
    // host: process.env.CLEARDB_DATABASE_URL,
    host: "https://us-cdbr-east-03.cleardb.com",
    dialect: "mysql",
    username: "baa6f81fbb6f42",
    password: "116d857a",
    database: "heroku_56fabe11fc4acdd",
    define: {
        timestamps: true,
        underscored: true,
    },
}