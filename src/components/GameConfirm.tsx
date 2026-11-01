'use client';
import {useState,useRef,useEffect} from 'react';
export function useGameConfirm(){
 const [message,setMessage]=useState<string|null>(null),resolve=useRef<((value:boolean)=>void)|null>(null),box=useRef<HTMLDivElement>(null);
 const finish=(value:boolean)=>{resolve.current?.(value);resolve.current=null;setMessage(null);};
 useEffect(()=>()=>{resolve.current?.(false);},[]);
 useEffect(()=>{if(!message)return;const previous=document.activeElement as HTMLElement|null;box.current?.querySelector<HTMLButtonElement>('button')?.focus();const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();finish(false);}if(e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();const buttons=Array.from(box.current?.querySelectorAll('button')??[]);buttons[(buttons.indexOf(document.activeElement as HTMLButtonElement)+1)%buttons.length]?.focus();}};window.addEventListener('keydown',key,true);return()=>{window.removeEventListener('keydown',key,true);previous?.focus();};},[message]);
 return {confirm:(text:string)=>new Promise<boolean>(r=>{resolve.current?.(false);resolve.current=r;setMessage(text);}),dialog:message?<div className="confirm-backdrop" onPointerDown={e=>e.stopPropagation()}><div className="game-confirm" role="alertdialog" aria-modal="true" aria-label="ยืนยันรายการ" ref={box}><h3>ยืนยันรายการ</h3><p>{message}</p><div><button onClick={()=>finish(false)}>ยกเลิก</button><button onClick={()=>finish(true)}>ยืนยัน</button></div></div></div>:null};
}
