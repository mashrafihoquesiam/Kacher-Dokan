(function(){
  function SpringRealtime(){
    this.handlers={}; this.es=null; this.token='';
  }
  SpringRealtime.prototype.on=function(name,fn){
    (this.handlers[name]||(this.handlers[name]=[])).push(fn);
    if(this.es) this._bind(name);
    return this;
  };
  SpringRealtime.prototype._bind=function(name){
    if(!this.es || this.es.__bound?.has(name)) return;
    this.es.__bound=this.es.__bound||new Set(); this.es.__bound.add(name);
    this.es.addEventListener(name,(ev)=>{
      let data=ev.data; try{data=JSON.parse(ev.data);}catch(_){ }
      (this.handlers[name]||[]).forEach(fn=>{try{fn(data);}catch(e){console.warn('[Realtime handler]',name,e);}});
    });
  };
  SpringRealtime.prototype._connect=function(token){
    if(!token||token===this.token&&this.es)return;
    this.token=token; if(this.es){try{this.es.close();}catch(_){}}
    this.es=new EventSource('/api/realtime/stream?token='+encodeURIComponent(token));
    Object.keys(this.handlers).forEach(n=>this._bind(n));
    this.es.onerror=()=>console.warn('[Realtime] SSE reconnecting...');
  };
  SpringRealtime.prototype.emit=function(name,payload){
    if(name==='user:identify'&&payload&&payload.token)this._connect(payload.token);
    // order:join is retained for compatibility; authorization is already tied to the SSE user token.
    return this;
  };
  SpringRealtime.prototype.disconnect=function(){if(this.es){this.es.close();this.es=null;}};
  window.io=function(){return new SpringRealtime();};
})();
