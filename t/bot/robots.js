/* JAHIM ROBOTS — tab UI, robot XML, custom blocks, multi-market engine hooks */
(function(){'use strict';
var MK=['R_10','R_25','R_50','R_75','R_100','1HZ10V','1HZ25V','1HZ50V','1HZ75V','1HZ100V'];
var JT=window.JT={stake:1,base:1,mult:2.1,phase:'A',cfg:'',
 init:function(o){JT.stake=JT.base=+o.stake;JT.mult=+o.mult;JT.phase='A'},
 result:function(win){var r=JT.cfg,rec=/odd|over4/.test(r);
  if(win){JT.stake=JT.base;JT.phase='A'}else{JT.stake=+(JT.stake*JT.mult).toFixed(2);if(rec)JT.phase='B'}},
 run:async function(c,all,sym){var e=window.__JT_engine;if(!e)return;JT.cfg=c.robot;
  var ms=all?MK:[sym];
  for(var i=0;i<ms.length;i++){var h;try{h=await JT.sig(e,c,ms[i])}catch(x){h=null}
   if(h){h.o.amount=JT.stake;h.o.symbol=ms[i];return e.purchase({contract_type:h.t,opts:h.o})}}},
 sig:async function(e,c,m){var r=c.robot,N=+c.n,X=+c.x,B=JT.phase==='B',d,l;
  if(r==='worm'){var q=await e.jtTicks(m);if(!q||q.length<20)return null;q=q.slice(-20);
   var hi=Math.max.apply(0,q),lo=Math.min.apply(0,q),t=(hi-lo)/3,pip=e.$scope.ticksService.pipSizes[m]||2;
   var s=q.slice(-String(c.pa).length).map(function(v){return v>=hi-t?'B':v<=lo+t?'R':'G'}).join('');
   var off=((hi-lo)*0.25).toFixed(pip),o={prediction:void 0,duration:5,duration_unit:'t'};
   if(s===String(c.pa).toUpperCase()){o.barrierOffset='+'+off;return{t:'CALL',o:o}}
   if(s===String(c.pb).toUpperCase()){o.barrierOffset='-'+off;return{t:'PUT',o:o}}return null}
  d=await e.jtDigits(m);if(!d||d.length<30)return null;l=d[d.length-1];
  var odd5=function(){return d.slice(-5).every(function(v){return v%2===0})},
   same=function(n){return d.slice(-n).every(function(v){return v===l})};
  if(r==='streak')return same(N)?{t:'DIGITDIFF',o:{prediction:l}}:null;
  if(r==='twin')return same(2)?{t:'DIGITDIFF',o:{prediction:l}}:null;
  if(r==='freq200'){var w=d.slice(-200),k=w.filter(function(v){return v===N}).length;
   return k*100/w.length>=X?{t:'DIGITDIFF',o:{prediction:N}}:null}
  if(r==='twin_odd'){if(B)return odd5()?{t:'DIGITODD',o:{prediction:void 0}}:null;return same(2)?{t:'DIGITDIFF',o:{prediction:l}}:null}
  var low=d.slice(-N).every(function(v){return v<X});
  if(r==='over_odd'){if(B)return odd5()?{t:'DIGITODD',o:{prediction:void 0}}:null;return low?{t:'DIGITOVER',o:{prediction:2}}:null}
  if(r==='over2_over4'){if(B)return{t:'DIGITOVER',o:{prediction:4}};return low?{t:'DIGITOVER',o:{prediction:2}}:null}
  return null}};
var ROB=[
{id:'streak',t:'DIFFERS ON STREAK',d:'The robot waits for N consecutive identical digits and opens a DIFFERS contract against that digit.',n:4,x:0},
{id:'freq200',t:'DIGIT 1 IN 200 TICKS',d:'The robot analyses 200 last digits and opens a DIFFERS contract when digit 1 appears >= 12%.',n:1,x:12},
{id:'twin_odd',t:'DIGIT DIFFERS RECOVERY WITH DIGIT ODD',d:'Phase-A: twin digits open contract DIFFERS. Phase-B (recovery): 5 even digits open ODD contract.',n:2,x:0},
{id:'twin',t:'DIGIT DIFFERS TWIN',d:'The robot will wait for the twin digit trigger to open a DIFFERS contract.',n:2,x:0},
{id:'over_odd',t:'DIGIT OVER RECOVERY WITH DIGIT ODD',d:'Phase-A: trigger digit open contract DIGITOVER. Phase-B (recovery): 5 even digits open ODD contract.',n:3,x:3},
{id:'over2_over4',t:'DIGIT OVER 2 RECOVERY OVER 4',d:'Trigger: last N digits all below threshold (default 3 digits < 3) \u2192 Over 2. Recovery: on loss \u2192 Over 4 until win.',n:3,x:3},
{id:'worm',t:'HIGHER LOWER WORM HEAD PRO',d:'User-defined B/G/R color pattern on 20-tick Worm Head. Pattern A \u2192 HIGHER, Pattern B \u2192 LOWER. B=Blue (highest), G=Green (middle), R=Red (lowest).',n:0,x:0,pa:'BBB',pb:'RRR'}];
function xml(r){var dig=r.id!=='worm',sh=function(n){return '<shadow type="math_number"><field name="NUM">'+n+'</field></shadow>'};
 return '<xml xmlns="http://www.w3.org/1999/xhtml" is_dbot="true" collection="false"><block type="trade_definition" deletable="false" x="0" y="0">'+
 '<statement name="TRADE_OPTIONS"><block type="trade_definition_market" deletable="false" movable="false"><field name="MARKET_LIST">synthetic_index</field><field name="SUBMARKET_LIST">random_index</field><field name="SYMBOL_LIST">1HZ100V</field><next>'+
 '<block type="trade_definition_tradetype" deletable="false" movable="false"><field name="TRADETYPECAT_LIST">'+(dig?'digits':'highlow')+'</field><field name="TRADETYPE_LIST">'+(dig?'matchesdiffers':'higherlower')+'</field><next>'+
 '<block type="trade_definition_contracttype" deletable="false" movable="false"><field name="TYPE_LIST">'+(dig?'DIGITDIFF':'both')+'</field><next>'+
 '<block type="trade_definition_candleinterval" deletable="false" movable="false"><field name="CANDLEINTERVAL_LIST">60</field><next>'+
 '<block type="trade_definition_restartbuysell" deletable="false" movable="false"><field name="TIME_MACHINE_ENABLED">FALSE</field><next>'+
 '<block type="trade_definition_restartonerror" deletable="false" movable="false"><field name="RESTARTONERROR">TRUE</field></block></next></block></next></block></next></block></next></block></next></block></statement>'+
 '<statement name="INITIALIZATION"><block type="jt_init"><field name="STAKE">1</field><field name="MULT">2.1</field></block></statement>'+
 '<statement name="SUBMARKET"><block type="trade_definition_tradeoptions"><mutation has_first_barrier="'+(dig?'false':'true')+'" has_second_barrier="false" has_prediction="'+dig+'"></mutation>'+
 '<field name="DURATIONTYPE_LIST">t</field><field name="CURRENCY_LIST">USD</field><field name="JT_ALL_MARKETS">TRUE</field>'+
 '<value name="DURATION">'+sh(dig?1:5)+'</value><value name="AMOUNT">'+sh(1)+'</value>'+(dig?'<value name="PREDICTION">'+sh(1)+'</value>':'<value name="BARRIEROFFSET">'+sh('0.1')+'</value>')+
 '</block></statement></block>'+
 '<block type="before_purchase" x="0" y="400"><statement name="BEFOREPURCHASE_STACK"><block type="jt_signal_trade"><field name="ROBOT">'+r.id+'</field><field name="N">'+r.n+'</field><field name="X">'+r.x+'</field><field name="PA">'+(r.pa||'BBB')+'</field><field name="PB">'+(r.pb||'RRR')+'</field></block></statement></block>'+
 '<block type="after_purchase" x="400" y="400"><statement name="AFTERPURCHASE_STACK"><block type="jt_result"><next><block type="trade_again"></block></next></block></statement></block></xml>'}
function defs(){var B=window.Blockly,G=B.JavaScript.javascriptGenerator,F=G.forBlock,A=G.ORDER_ATOMIC;
 B.Blocks.jt_init={init:function(){this.jsonInit({message0:'JAHIM init: stake %1 martingale x %2',args0:[{type:'field_number',name:'STAKE',value:1,min:0.35},{type:'field_number',name:'MULT',value:2.1,min:1}],previousStatement:null,nextStatement:null,colour:230,tooltip:'Sets base stake and loss multiplier'})}};
 F.jt_init=function(b){return 'window.JT.init({stake:'+b.getFieldValue('STAKE')+',mult:'+b.getFieldValue('MULT')+'});\n'};
 B.Blocks.jt_signal_trade={init:function(){this.jsonInit({message0:'JAHIM robot %1 N/digit %2 threshold %3 pattern A %4 B %5',args0:[
  {type:'field_dropdown',name:'ROBOT',options:ROB.map(function(r){return[r.t,r.id]})},{type:'field_number',name:'N',value:4},{type:'field_number',name:'X',value:0},
  {type:'field_input',name:'PA',text:'BBB'},{type:'field_input',name:'PB',text:'RRR'}],previousStatement:null,nextStatement:null,colour:230,tooltip:'Scans for the robot signal and buys. If "Trade all markets" is ticked in Trade options it scans every synthetic market.'})}};
 F.jt_signal_trade=function(b){var ws=b.workspace,t=ws.getBlocksByType('trade_definition_tradeoptions',false)[0],m=ws.getBlocksByType('trade_definition_market',false)[0],
  all=t&&t.getFieldValue('JT_ALL_MARKETS')==='TRUE',sym=m?m.getFieldValue('SYMBOL_LIST'):'1HZ100V';
  return 'await window.JT.run({robot:'+JSON.stringify(b.getFieldValue('ROBOT'))+',n:'+(+b.getFieldValue('N'))+',x:'+(+b.getFieldValue('X'))+',pa:'+JSON.stringify(b.getFieldValue('PA'))+',pb:'+JSON.stringify(b.getFieldValue('PB'))+'},'+all+','+JSON.stringify(sym)+');\n'};
 B.Blocks.jt_result={init:function(){this.jsonInit({message0:'JAHIM apply trade result (stake / recovery)',previousStatement:null,nextStatement:null,colour:230})}};
 F.jt_result=function(){return "window.JT.result(Bot.isResult('win'));\n"};}
function wrapTO(){var T=window.Blockly.Blocks.trade_definition_tradeoptions;if(!T||T.__jt)return !!(T&&T.__jt);var o=T.init;
 T.init=function(){o.apply(this,arguments);this.appendDummyInput('JT_ROW').appendField(new window.Blockly.FieldCheckbox('FALSE'),'JT_ALL_MARKETS').appendField('Trade all markets (scan every synthetic market for the signal)')};T.__jt=1;return true}
var iv=setInterval(function(){var B=window.Blockly;if(!B||!B.Blocks||!B.JavaScript||!B.JavaScript.javascriptGenerator)return;
 if(!B.Blocks.jt_init)defs();if(wrapTO())clearInterval(iv)},50);
function load(r){var t=document.getElementById('id-bot-builder');t&&t.click();var n=0,w=setInterval(function(){var ws=window.Blockly&&window.Blockly.derivWorkspace;
 if(ws&&++n>2||n>80){clearInterval(w);try{var x=xml(r);ws.clear();window.Blockly.Xml.domToWorkspace(window.Blockly.utils.xml.textToDom(x),ws);ws.strategy_to_load=x;ws.cleanUp&&ws.cleanUp()}catch(e){alert('Could not load robot: '+e.message)}}else n++},250)}
JT.mount=function(el){if(el.firstChild)return;el.className='jt-robots';
 el.innerHTML='<h2>ROBOTS</h2><div class="jt-grid">'+ROB.map(function(r,i){return '<div class="jt-card"><h3>'+r.t+'</h3><div class="jt-tags"><span class="t1">'+(r.id==='worm'?'HIGHER/LOWER':'DIGIT')+'</span><span class="t2">MULTI-MARKET</span><span class="t3">NO SEQUENCE</span></div><p>'+r.d+'</p><div class="jt-act"><button class="jt-det" data-i="'+i+'">Details</button><button class="jt-sel" data-i="'+i+'">\u25B6 Select</button></div></div>'}).join('')+'</div>';
 el.onclick=function(e){var b=e.target.closest('button');if(!b)return;var r=ROB[+b.dataset.i];if(b.className==='jt-sel')load(r);else alert(r.t+'\n\nNO SEQUENCE\n\nDESCRIPTION\n'+r.d)}};
})();
