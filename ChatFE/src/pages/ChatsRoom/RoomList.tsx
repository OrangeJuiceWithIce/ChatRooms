import { useState } from "react";
import {RoomPreviewInfo,RoomDeleteArgs} from './Types.ts';
import { Dropdown } from "antd";  //右击下拉菜单组件
import Circle from './Circle.tsx';
import './RoomList.css';

//带有交互函数的房间
interface RoomProps extends RoomPreviewInfo{
    onClick: ()=>void;  //选择房间函数
    onDelete:()=>void;  //删除房间函数
    isSelect: boolean;  //是否被选中
}

//房间列表
interface RoomListProps {
    List: RoomPreviewInfo[];
    onClick: (roomId:number)=>void;
    onDelete: (props:RoomDeleteArgs)=>void;
    selectedId: number|null;  //当前选中的房间id

    onAdd:()=>void;//添加房间函数
}

//房间列表中的某一条
function RoomMessage(props:RoomProps){
    //右击菜单是否显示
    const [showState,setShowState]=useState(true);
    
    //右击下拉菜单
    const items=[
        {
            label:'删除',
            key:'1',
            onClick:()=>{props.onDelete(),setShowState(false)},
        },
        {
            label:'2nd menu item',
            key:'2',
        },
        {
            label:'3rd menu item',
            key:'3',
        }
    ];

    if(!showState){
        return null;
    }

    return(
        <Dropdown menu={{items}} trigger={['contextMenu']}>
            <div className={`RoomContainer ${props.isSelect? 'selected' :''}`} onClick={props.onClick}>
                <Circle />
                <div className="RoomInfo">
                    <div className="NameAndTime">
                        <h2 style={{fontSize: '0.8rem'}}>{props.roomName}</h2>
                        <p style={{fontSize: '0.6rem',color:'#afafaf'}}>{props.lastMessage?String(props.lastMessage.time).slice(5,16):'--'}</p>
                    </div>
                    <p className="RoomContent"style={{fontSize: '0.6rem'}}>{props.lastMessage?props.lastMessage.content:'---'}</p>
                </div>
            </div>
        </Dropdown>
    )
}

//房间列表
function RoomList(props:RoomListProps){
    return(
        <div>
            <div className="RoomListTitle">
                <svg  //加号按钮
                className="plus"
                style={{float:'right'}}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1024 1024"
                width="30" height="30"
                onClick={props.onAdd} //添加房间函数
                >
                <path d="M480 64A416.64 416.64 0 0 0 64 480 416.64 416.64 0 0 0 480 896 416.64 416.64 0 0 0 896 480 416.64 416.64 0 0 0 480 64z m0 64C674.752 128 832 285.248 832 480S674.752 832 480 832A351.552 351.552 0 0 1 128 480C128 285.248 285.248 128 480 128zM448 256v192H256v64h192v192h64V512h192V448H512V256z"/>
                </svg>
            </div>
            <div className="RoomList">
                {props.List.map(room=>(
                    <RoomMessage
                    key={room.roomId}
                    onClick={()=>{props.onClick(room.roomId)}}
                    onDelete={()=>{props.onDelete({user:'Amy',roomId:room.roomId})}}
                    roomId={room.roomId} roomName={room.roomName} lastMessage={room.lastMessage}
                    isSelect={props.selectedId===room.roomId}
                    />
                ))}
            </div>
        </div>
    )
}

export default RoomList;