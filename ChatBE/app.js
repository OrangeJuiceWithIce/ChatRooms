const express=require('express');
const app=express();

const db=require('./db');

app.options('*', (req, res) => {
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.send();
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    next();
});

app.use(express.json());

//获取房间列表
app.get('/api/room/list',(req,res)=>{
    const getquery='select * from rooms';
    var rooms=[];
    db.query(getquery,(err,result)=>{
        if(err){
            console.log('查询数据库失败:',err);
            res.status(500).json({msg:'get room list error',code:1,data:null});
            return;
        }
        console.log('查询数据库成功');
        if (result&&result.length > 0) {
            // 将 result 数组中的数据映射为Room对象数组
            rooms = result.map(row => ({
                roomId: row.roomId,
                roomName: row.roomName,
                lastMessage: JSON.parse(row.lastMessage),//将数据库中的JSON字符串转换为对象
            }));
        }
        const RoomListRes={'rooms':rooms};
        res.status(200).json({msg:'get room list success',code:0,data:RoomListRes});
    });
});

//添加房间
app.post('/api/room/add',(req,res)=>{
    const roomName=req.body.roomName;
    if(!roomName){
        res.status(400).send('房间名称不能为空',BadRequest);
    }
    const insertquery='insert into rooms (roomName,lastMessage) values (?,?)';
    const getquery='select roomId from rooms order by roomId desc limit 1';
    db.query(insertquery,[roomName,null],(err,result)=>{
        if(err){
            console.log('往数据库中添加房间失败:' ,err);
            res.status(500).json({msg:'add room error',code:1,data:null});
            return;
        };
        console.log('往数据库中添加房间成功');
        db.query(getquery,(err,result)=>{
            if(err){
                console.log('获取房间Id失败:',err);
            }
            if(result&&result.length>0){
                console.log('获取房间Id成功');
                const roomId=result[0].roomId;
                const RoomAddRes={'roomId':roomId};
                const response={msg:'add room success',code:0,data:RoomAddRes};
                res.status(200).json(response);
            }
        });
    })
})

//删除房间
app.post('/api/room/delete',(req,res)=>{
    const roomId=req.body.roomId;
    const deletequery='delete from rooms where roomId=?';
    const deleteMessage='delete from messages where roomId=?';
    db.query(deletequery,[roomId],(err,resulet)=>{
        if(err){
            console.log('删除房间失败:',err);
            res.status(500).json({msg:'delete room error',code:1,data:null});
            return;
        };
        console.log('删除房间成功');
        db.query(deleteMessage,[roomId],(err,result)=>{
            if(err){
                console.log('删除该房间消息失败:',err);
                res.status(500).json({msg:'delete room error',code:1,data:null});
                return;
            };
            console.log('删除该房间消息成功')
        })
        const response={msg:'delete room success',code:0,data:null};
        res.status(200).json(response);
    })
})

//提交一条消息
app.post('/api/message/add',(req,res)=>{
    //消息的基本信息
    const roomId=req.body.roomId;
    const content=req.body.content;
    const sender=req.body.sender;
    var messageId;
    const time=new Date().toISOString().slice(0,19).replace('T',' ');

    //三大指令
    const insertquery='insert into messages(roomId,content,sender,time)values(?,?,?,?)';
    const getquery='select messageId from messages order by messageId desc limit 1';
    const updatequery='update rooms set lastMessage=? where roomId=?';
    
    //1.添加消息
    db.query(insertquery,[roomId,content,sender,time],(err,result)=>{
        if(err){
            console.log('往数据库中添加消息失败:',err);
            res.status(500).json({msg:'add message error',code:1,data:null});
            return;
        }
        console.log('往数据库中添加消息成功');
        //2.获取消息Id
        db.query(getquery,(err,result)=>{
            if(err){
                console.log('获取消息Id失败:',err);
                res.status(500).json({msg:'add message error',code:1,data:null});
                return;
            }
            if(result&&result.length>0){
                console.log('获取消息Id成功');
                messageId=result[0].messageId;

                //3.更新当前房间的最后一条消息
                const lastMessage=JSON.stringify({'messageId':messageId,'roomId':roomId,'sender':sender,'content':content,'time':time});
                console.log('最后一条消息:',lastMessage);
                db.query(updatequery,[lastMessage,roomId],(err,result)=>{
                    if(err){
                        console.log('更新房间的最后一条消息失败:',err);
                        res.status(500).json({msg:'add message error',code:1,data:null});
                        return;
                    }
                    console.log('更新房间的最后一条消息成功');
                    res.status(200).json({msg:'add message success',code:0,data:null});
                });
            }
            else{
                res.status(500).json({msg:'add message error',code:1,data:null});
            }
        });
    });
})

//获取房间消息
app.get('/api/room/message/list',(req,res)=>{
    const roomId=req.query.roomId;
    const getquery='select * from messages where roomId=?';
    db.query(getquery,[roomId],(err,result)=>{
        if(err){
            console.log('查询房间消息失败:',err);
            res.status(500).json({msg:'get message list error',code:1,data:null});
            return;
        }
        if(result&&result.length>0){
            res.status(200).json({msg:'get message list success',code:0,data:{messages:result}});
        }
        console.log('查询房间消息成功');
    })
})

app.get('/api/room/message/getUpdate',(req,res)=>{
    const roomId=req.query.roomId;
    const sinceMessageId=req.query.sinceMessageId;

    const getquery='select * from messages where roomId=? and messageId>?';
    db.query(getquery,[roomId,sinceMessageId],(err,result)=>{
        if(err){
            console.log('更新房间消息失败:',err);
            res.status(500).json({msg:'update message error',code:1,data:null});
            return;
        }
        res.status(200).json({msg:'update message success',code:0,data:{messages:result}});
        console.log(result)
        console.log('更新房间消息成功');
    })
})

app.listen(8000,()=>{
    console.log('Server is running on port 8000');
})