import RoomList from './RoomList.tsx';
import Chatting from './Chatting.tsx';
import { useState, useEffect } from'react';
import {Message,MessageAddArgs,RoomPreviewInfo, RoomAddArgs,RoomDeleteArgs} from './Types.ts';
import './ChatsRoom.css';
import { getFetcher, postFetcher } from './fetcher.ts';
import useSWR from 'swr';
import {useNavigate,useLocation} from "react-router-dom";

const ChatsRoom = () => {
    let navigate=useNavigate();

    const location=useLocation();
    const userName=location.state.userName;

    //房间列表数据钩子
    const {data:RoomListRes,mutate:mutateRoomList}=useSWR<{rooms:RoomPreviewInfo[]}>('/api/room/list',getFetcher);
    //房间列表数据
    const [getList,setList]=useState<RoomPreviewInfo[]>(RoomListRes?RoomListRes.rooms:[]);
    //更新房间列表数据
    useEffect(()=>{
        setList(RoomListRes?RoomListRes.rooms:[]);
    }, [RoomListRes]);
    //
    useEffect(()=>{
        console.log('当前房间列表:',getList);
    }, [getList]);


    //被选中的房间
    const [selectRoom, setSelectRoom]=useState<number|null>(null);
    //选择房间函数
    const handleClick = (roomId:number) => {
        const index=(getList.findIndex(Item=>Item.roomId===roomId));
        setSelectRoom(index);
    }
    //当selectRoom变化时,更新消息列表
    useEffect(() => {
        console.log('当前房间index:',selectRoom);
        if(selectRoom!==null){
            mutateMessages();
        }
    }, [selectRoom]);

    
     //消息列表数据钩子
     const {data:messagesRes,mutate:mutateMessages}=useSWR<{messages:Message[]}>(selectRoom!==null?`/api/room/message/list?roomId=${getList[selectRoom].roomId}`:null,selectRoom!==null?getFetcher:null);
     //消息数据
     const [MessageList,setMessageList]=useState<Message[]>([])
     //更新房间消息数据
     useEffect(()=>{
        setMessageList(messagesRes?messagesRes.messages:[]);
     }, [messagesRes]);
    
    
    //删除房间函数
    const handleDelete=async (props:RoomDeleteArgs) => {
        const index=(getList.findIndex(Item=>Item.roomId===props.roomId));
        await postFetcher('/api/room/delete',{arg:{'user':props.user,'roomId':props.roomId}})
        //更新房间列表数据
        mutateRoomList();
        //若被删除的是被选中的房间，则把被选中的房间设为null
        if (selectRoom !== null){
            if(selectRoom===index){
                setSelectRoom(null);
            }
        }
    }
    

    //用户下拉菜单
    const[userMenu,setUserMenu]=useState(false);
    const handleUserMenu=()=>{
        setUserMenu(!userMenu);
        setisAdding(false);
    }
    const userMenuList=()=>{
        return(
            <div className='userMenuContainer'>
                <div className='userMenuList'>
                    <ul style={{listStyle:'none',padding:0,margin:0}}>
                        <li>用户信息</li>
                        <li onClick={()=>{setUserMenu(false);navigate('/')}}>退出登录</li>
                    </ul>
                </div>
            </div>
        )
    }



    //是否在添加房间
    const [isAdding,setisAdding]=useState(false);
    //添加房间函数
    const handleAdd=()=>{
        setisAdding(!isAdding);
        setUserMenu(false);
    }
    //提交房间信息函数
    const handleSubmit=async (props:RoomAddArgs)=>{
        setisAdding(false);
        await postFetcher('/api/room/add',{arg:{'user':props.user,'roomName':props.roomName}});
        //更新房间列表数据
        mutateRoomList();
    }
    //添加房间的表单
    const AddList=()=>{
        return(
            <div className={`addRoomForm`}>
                <label htmlFor='roomName'>房间名称:</label>
                <input type='text' id='roomName' required></input>
                <br/>
                <button id='createRoom' onClick={()=>{handleSubmit({'user':userName,'roomName':(document.getElementById('roomName') as HTMLInputElement).value})}}>创建房间</button>
                <button id='cancelAdd' onClick={()=>{setisAdding(false)}}>取消创建</button>
            </div>
        )
    }


    //提交消息函数
    const handleMessage=async(props:MessageAddArgs)=>{
        console.log(props);
        await postFetcher('/api/message/add',{arg:{'sender':props.sender,'roomId':props.roomId,'content':props.content}});
        console.log('Message added')
        //更新房间列表数据 最后一条消息会变
        mutateRoomList();
        (document.getElementById('ChattingInput') as HTMLInputElement).value = '';
    }

    //更新消息函数
    const handleUpdate=async()=>{
        console.log('当前房间消息列表:',MessageList);
        if(selectRoom!=null){
            const newMessageRes=await getFetcher(`/api/room/message/getUpdate?roomId=${getList[selectRoom].roomId}&sinceMessageId=${MessageList.length>0?MessageList[MessageList.length-1].messageId:0}`);
            if(newMessageRes.messages&&newMessageRes.messages.length>0){
                setMessageList(MessageList=>MessageList.concat(newMessageRes.messages));
            }
        }
    }

    //定时调用更新消息函数
    useEffect(() => {
        const intervalId = setInterval(handleUpdate, 1000);
        return () => clearInterval(intervalId);
    }, [selectRoom, MessageList]);

    return(
        <div className="ChatsRoom">
            <RoomList
                List={getList}  //房间列表数据
                onClick={handleClick}  //选择房间函数
                onDelete={handleDelete}  //删除房间函数
                selectedId={selectRoom!==null?getList[selectRoom].roomId:null}  //当前选中的房间id
                
                onAdd={handleAdd}  //添加房间函数
                userName={userName}  //当前用户名称
                onUserMenu={handleUserMenu}  //用户下拉菜单函数
            />
            <Chatting
                Room={selectRoom!==null?getList[selectRoom]:null}  //当前选中的房间数据
                messages={MessageList}  //聊天记录数据
                onSubmit={handleMessage}  //提交消息函数

                userName={userName}  //当前用户名称
            />
            {isAdding?AddList():null}
            {userMenu?userMenuList():null}
        </div>
    );
}

export default ChatsRoom;