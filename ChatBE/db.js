const mysql=require('mysql');

const db=mysql.createPool({
    host:'localhost',
    user:'root',
    password:'liuhan73',
    database:'ChatsRoom',
});

module.exports=db;