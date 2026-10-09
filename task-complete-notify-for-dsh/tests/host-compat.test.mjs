import {test} from 'node:test'
import assert from 'node:assert/strict'
import {Context} from '@deepseek-ai/cordis'
import * as plugin from '../lib/index.js'
import {_setIo} from '../lib/notify.js'

test('DSH 0.2 Cordis event bus dispatches a single completion notification', async () => {
 const calls=[]
 const restore=_setIo({execFile:(cmd,args,opts,cb)=>{calls.push({cmd,args});cb?.(null)},spawn:()=>({unref(){}}),spawnSync:()=>({status:1}),existsSync:()=>true})
 try {
  const ctx=new Context()
  ctx.plugin(plugin,{sound:false})
  await new Promise(resolve=>setTimeout(resolve,50))
  const session={header:{id:'compat-smoke',origin:'user'}}
  const agent={id:'compat-smoke',session}
  ctx.emit('agent/status',{agent,status:'running'})
  ctx.emit('session/event',session,{type:'turn/end',data:{reason:{kind:'completed'}}})
  ctx.emit('agent/status',{agent,status:'idle'})
  assert.equal(calls.filter(call=>call.cmd==='osascript').length,process.platform==='darwin'?1:0)
 } finally {restore()}
})
