import type{Response} from './Types.ts';

const prefix="http://localhost:8000";
export async function getFetcher(key:string){
    const resp=(await fetch(prefix+key,{mode:"cors"}).then((res)=>
        res.json()
    ))as Response<any>;
    console.log(resp);
    if(resp.code!==0){
        throw new Error(resp.msg+" "+resp.code);
    }
    return resp.data;
}

export async function postFetcher(
    key:string,
    body:{arg:Record<string,unknown>|Array<unknown>}
){
    const resp=(await fetch(prefix+key,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(body.arg),
        mode:"cors",
    }).then((res)=>res.json()))as Response<any>;

    if(resp.code!==0){
        throw new Error(resp.msg+" "+resp.code);
    }
    return resp.data;
}