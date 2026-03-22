/* ════════════════════════════════════════
   DATABASE
════════════════════════════════════════ */
const DB={
  g(k){try{return JSON.parse(localStorage.getItem('mdoc_'+k)||'null');}catch{return null;}},
  s(k,v){try{localStorage.setItem('mdoc_'+k,JSON.stringify(v));}catch{}},
  emps(){return this.g('emps')||[];},courses(){return this.g('courses')||[];},
  files(){return this.g('files')||[];},personal(){return this.g('personal')||[];},
  saveEmps(d){this.s('emps',d);},saveCourses(d){this.s('courses',d);},
  saveFiles(d){this.s('files',d);},savePersonal(d){this.s('personal',d);},
};

/* ════════════════════════════════════════
   UTILS
════════════════════════════════════════ */
const today=new Date();
const clrs=['#1a3560','#6b21a8','#0f766e','#b45309','#9d174d','#1e40af','#065f46','#7c2d12'];
const gc=n=>clrs[(n||'?').charCodeAt(0)%clrs.length];
const gi=n=>(n||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase();
const fd=d=>d?new Date(d).toLocaleDateString('ar-IQ',{year:'numeric',month:'long',day:'numeric'}):'—';
const fds=d=>d?new Date(d).toLocaleDateString('ar-IQ'):'—';
const addY=(d,y)=>{let n=new Date(d);n.setFullYear(n.getFullYear()+parseInt(y));return n;};
const dDiff=(a,b)=>Math.floor((b-a)/86400000);
const getPD=e=>{const b=e.lp||e.start||e.hire;return b?addY(b,e.py||3):null;};
const getDL=e=>{const p=getPD(e);return p?dDiff(today,p):null;};

const catI={official:{icon:'📄',label:'كتاب رسمي',color:'#7ab3f8'},thanks:{icon:'🏅',label:'شكر وتقدير',color:'#e8c96a'},
  order:{icon:'📋',label:'أمر إداري',color:'#a78bfa'},certificate:{icon:'🎓',label:'شهادة',color:'#34d399'},
  complaint:{icon:'⚠️',label:'شكوى',color:'#f87171'},other:{icon:'📎',label:'أخرى',color:'#94a3b8'}};
const pfT={natid:{icon:'🪪',label:'البطاقة الوطنية',bg:'rgba(90,130,246,0.1)',color:'#7ab3f8'},
  deptid:{icon:'🏢',label:'هوية الدائرة',bg:'rgba(201,168,76,0.1)',color:'#e8c96a'},
  rescard:{icon:'🏠',label:'بطاقة السكن',bg:'rgba(52,211,153,0.1)',color:'#34d399'},
  salary:{icon:'💰',label:'شريط الراتب',bg:'rgba(240,168,48,0.1)',color:'#f0a830'},
  passport:{icon:'🛂',label:'جواز السفر',bg:'rgba(167,139,250,0.1)',color:'#a78bfa'},
  other:{icon:'📎',label:'وثيقة شخصية',bg:'rgba(148,163,184,0.1)',color:'#94a3b8'}};
const stI={done:{cls:'cs-done',lbl:'✅ مكتملة'},prog:{cls:'cs-prog',lbl:'🔄 جارية'},
  need:{cls:'cs-need',lbl:'❌ مطلوبة'},plan:{cls:'cs-plan',lbl:'📅 مخططة'}};
const empStI={active:{cls:'sba',lbl:'فعّال'},leave:{cls:'sbl',lbl:'إجازة'},suspended:{cls:'sbs',lbl:'موقوف'}};

/* ════════════════════════════════════════
   STATE
════════════════════════════════════════ */
let cId=null,edId=null,fiB64=null,fiNm=null,pfB64=null,pfNm=null;

/* ════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════ */
function rSB(f=''){
  const emps=DB.emps().filter(e=>!f||e.name.includes(f)||(e.id||'').toLowerCase().includes(f.toLowerCase())||(e.dept||'').includes(f));
  document.getElementById('ss1').textContent=DB.emps().length;
  document.getElementById('ss2').textContent=DB.emps().filter(e=>{const d=getDL(e);return d!==null&&d<=30;}).length;
  document.getElementById('ss3').textContent=DB.courses().filter(c=>c.status==='done').length;
  const el=document.getElementById('sbList');
  if(!emps.length){el.innerHTML=`<div class="lsb-empty"><div class="ei">👥</div>${f?'لا نتائج مطابقة':'لا يوجد موظفون.<br>اضغط إضافة موظف للبدء.'}</div>`;return;}
  const shM={morning:{cls:'sm',lbl:'صباحي'},rotation:{cls:'sr',lbl:'مناوب'}};
  el.innerHTML=emps.map(e=>{
    const d=getDL(e);const dot=d!==null&&d<=0?'<span class="ndot"></span>':'';
    const sh=shM[e.shift]||shM.morning;
    return `<div class="erow ${e.id===cId?'active':''}" onclick="openEmp('${e.id}')">
      <div class="eav" style="background:${gc(e.name)}">${gi(e.name)}</div>
      <div><div class="ern">${dot}${e.name}</div><div class="eri">${e.id||'—'} · ${e.dept||'—'}</div>
      <span class="shift-tag ${sh.cls}">${sh.lbl}</span></div>
    </div>`;
  }).join('');
}
function sbSrch(v){rSB(v.trim());}

/* ════════════════════════════════════════
   NAVIGATION
════════════════════════════════════════ */
function goWelcome(){
  cId=null;
  document.getElementById('welcomeScreen').style.display='';
  document.getElementById('empPanel').style.display='none';
  document.getElementById('topTitle').innerHTML='MDOC &mdash; <span>نظام إدارة ملفات الموظفين</span>';
  document.getElementById('topStatus').textContent='لا يوجد موظف محدد';
  document.getElementById('rsbFoot').style.display='none';
  rSB();
}
function openEmp(id){cId=id;document.getElementById('welcomeScreen').style.display='none';
  document.getElementById('empPanel').style.display='block';rDetail(id);rSB();updRSBFoot(id);}

function rNav(el,pane){
  document.querySelectorAll('.rsb .ni').forEach(n=>n.classList.remove('active'));
  el.classList.add('active');
  document.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const p=document.getElementById(pane);if(p)p.classList.add('active');
  document.querySelectorAll('.tab').forEach(t=>{if(t.getAttribute('data-p')===pane)t.classList.add('active');});
}
function sTab(el,id){
  el.closest('.tw').querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  document.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));document.getElementById(id).classList.add('active');
  document.querySelectorAll('.rsb .ni').forEach(n=>{const f=n.getAttribute('onclick')||'';
    if(f.includes("'"+id+"'"))n.classList.add('active');else n.classList.remove('active');});
}
function updRSBFoot(id){
  const e=DB.emps().find(x=>x.id===id);
  if(!e){document.getElementById('rsbFoot').style.display='none';return;}
  const d=getDL(e);const pc=d===null?'pok':d<=0?'pov':d<=30?'pso':'pok';
  const pl=d===null?'غير محدد':d<=0?`متأخر ${Math.abs(d)} يوم`:`بعد ${d} يوم`;
  document.getElementById('rsbFoot').style.display='block';
  document.getElementById('rsbInfo').innerHTML=`<div class="rfn">${e.name}</div><div class="rfi2">${e.id||'—'} · ${e.grade||'—'}</div>
    <div class="rfp ${pc}"><span>🎯</span><span>${pl}</span></div>`;
}

/* ════════════════════════════════════════
   RENDER DETAIL
════════════════════════════════════════ */
function rDetail(id){
  const e=DB.emps().find(x=>x.id===id);if(!e){goWelcome();return;}
  const d=getDL(e),pd=getPD(e),si=empStI[e.status]||empStI.active;
  const hD=e.hire?new Date(e.hire):null;
  const sYrs=hD?((today-hD)/(365.25*24*3600*1000)).toFixed(1):'—';
  const lD=e.lp||e.start||e.hire?new Date(e.lp||e.start||e.hire):null;
  let prog=0;if(lD&&pd)prog=Math.min(100,Math.max(0,(today-lD)/(pd-lD)*100));
  const pc=d===null?'pok':d<=0?'pov':d<=30?'pso':'pok';
  const pl=d===null?'غير محدد':d<=0?`متأخر ${Math.abs(d)} يوم`:`بعد ${d} يوم`;
  const shM={morning:{cls:'shm',lbl:'☀️ موظف صباحي'},rotation:{cls:'shr',lbl:'🔄 موظف مناوب'}};
  const sh=shM[e.shift]||shM.morning;
  const eC=DB.courses().filter(c=>c.empId===id);
  const eF=DB.files().filter(f=>f.empId===id);
  const ePF=DB.personal().filter(p=>p.empId===id);
  document.getElementById('topTitle').innerHTML=`ملف <span>${e.name}</span>`;
  document.getElementById('topStatus').textContent=`${e.id||''} · ${e.dept||''}`;

  document.getElementById('empDetailContent').innerHTML=`
  <div class="ehcard">
    <div class="dav" style="background:${gc(e.name)}">${gi(e.name)}</div>
    <div style="flex:1">
      <div class="dname">${e.name}</div><div class="dsub">${e.title||'—'} · ${e.grade||'—'}</div>
      <div class="dchips">
        <span class="sbg ${si.cls}">${si.lbl}</span>
        <span class="shchip ${sh.cls}">${sh.lbl}</span>
        <span class="chip">🏢 <strong>${e.dept||'—'}</strong></span>
        <span class="chip">📍 <strong>${e.branch||'—'}</strong></span>
        <span class="chip">🪪 <strong>${e.id||'—'}</strong></span>
        <span class="chip">⏱ <strong>${sYrs} سنة</strong></span>
        <span class="chip ${pc}">🎯 <strong>${pl}</strong></span>
      </div>
    </div>
    <div class="dacts">
      <button class="btn btng bsm" onclick="openEmpModal('${e.id}')">✏️ تعديل</button>
      <button class="btn btnr bsm" onclick="cDel('emp','${e.id}')">🗑</button>
    </div>
  </div>

  <div class="tw">
    <div class="tab active" data-p="tp_info" onclick="sTab(this,'tp_info')">📋 البيانات</div>
    <div class="tab" data-p="tp_promo" onclick="sTab(this,'tp_promo')">🎯 الترقية</div>
    <div class="tab" data-p="tp_courses" onclick="sTab(this,'tp_courses')">📚 الدورات <span style="font-size:10px;background:var(--card);border-radius:8px;padding:1px 5px;margin-right:2px">${eC.length}</span></div>
    <div class="tab" data-p="tp_files" onclick="sTab(this,'tp_files')">📁 الملفات الرسمية <span style="font-size:10px;background:var(--card);border-radius:8px;padding:1px 5px;margin-right:2px">${eF.length}</span></div>
    <div class="tab" data-p="tp_personal" onclick="sTab(this,'tp_personal')">🪪 الملفات الشخصية <span style="font-size:10px;background:var(--card);border-radius:8px;padding:1px 5px;margin-right:2px">${ePF.length}</span></div>
    <div class="tab" data-p="tp_tl" onclick="sTab(this,'tp_tl')">📅 السجل</div>
  </div>

  <div class="tp active" id="tp_info">
    <div class="ig">
      <div class="ib"><div class="il">المسمى الوظيفي</div><div class="iv">${e.title||'—'}</div></div>
      <div class="ib"><div class="il">الدرجة الوظيفية</div><div class="iv">${e.grade||'—'}</div></div>
      <div class="ib"><div class="il">تاريخ التعيين</div><div class="iv" style="font-size:12px">${fd(e.hire)}</div></div>
      <div class="ib"><div class="il">تاريخ المباشرة</div><div class="iv" style="font-size:12px">${fd(e.start)}</div></div>
      <div class="ib"><div class="il">الدائرة / القسم</div><div class="iv">${e.dept||'—'}</div></div>
      <div class="ib"><div class="il">الفرع / الموقع</div><div class="iv">${e.branch||'—'}</div></div>
      <div class="ib"><div class="il">الراتب الشهري</div><div class="iv">${e.salary?Number(e.salary).toLocaleString('ar-IQ')+' د.ع':'—'}</div></div>
      <div class="ib"><div class="il">سنوات الخدمة</div><div class="iv" style="color:var(--teal)">${sYrs} سنة</div></div>
      <div class="ib"><div class="il">نوع الدوام</div><div class="iv">${sh.lbl}</div></div>
      ${e.notes?`<div class="ib" style="grid-column:1/-1"><div class="il">ملاحظات</div><div class="iv" style="font-size:12px;font-weight:500;color:var(--text2)">${e.notes}</div></div>`:''}
    </div>
  </div>

  <div class="tp" id="tp_promo">
    <div class="pcrd">
      <div class="ptop"><div class="ptitle">مسار الاستحقاق الوظيفي</div>
        <span class="sbg ${d!==null&&d<=0?'sbs':d!==null&&d<=30?'sbl':'sba'}">${pl}</span>
      </div>
      <div class="pmeta"><span>آخر ترقية: ${fd(e.lp)}</span><span>الترقية القادمة: ${pd?fd(pd):'—'}</span></div>
      <div class="pgtrack"><div class="pgbar" style="width:${prog.toFixed(1)}%"></div></div>
      <div style="text-align:center;font-size:10px;color:var(--text3)">${prog.toFixed(0)}% — مدة الاستحقاق ${e.py||3} سنوات</div>
      <div class="psteps">
        <div class="pstep"><span class="psi">📋</span><div class="pst"><div class="pt">تاريخ التعيين</div><div class="ps">${fds(e.hire)}</div></div><span class="psc">${e.hire?'✅':'—'}</span></div>
        <div class="pstep"><span class="psi">🚀</span><div class="pst"><div class="pt">تاريخ المباشرة</div><div class="ps">${fds(e.start)}</div></div><span class="psc">${e.start?'✅':'—'}</span></div>
        <div class="pstep"><span class="psi">🏆</span><div class="pst"><div class="pt">آخر ترقية</div><div class="ps">${fds(e.lp)}</div></div><span class="psc">${e.lp?'✅':'—'}</span></div>
        <div class="pstep"><span class="psi">🎯</span><div class="pst"><div class="pt">الترقية المستحقة</div><div class="ps">${pd?fds(pd):'—'}</div></div><span class="psc ${pc}">${d!==null&&d<=0?'🔴':'⏳'}</span></div>
        <div class="pstep"><span class="psi">📚</span><div class="pst"><div class="pt">دورات معلقة</div><div class="ps">${eC.filter(c=>c.status==='need').length} دورة</div></div><span class="psc">${eC.filter(c=>c.status==='need').length===0?'✅':'🔴'}</span></div>
      </div>
    </div>
  </div>

  <div class="tp" id="tp_courses">
    <div class="ch">
      <div class="cflts">
        <div class="cfb active" onclick="fCT(this,'all')">الكل (${eC.length})</div>
        <div class="cfb" onclick="fCT(this,'done')">✅ مكتملة (${eC.filter(c=>c.status==='done').length})</div>
        <div class="cfb" onclick="fCT(this,'need')">❌ مطلوبة (${eC.filter(c=>c.status==='need').length})</div>
        <div class="cfb" onclick="fCT(this,'prog')">🔄 جارية (${eC.filter(c=>c.status==='prog').length})</div>
      </div>
      <button class="btn btng bsm" onclick="openCourseModal('${id}')">➕ إضافة دورة</button>
    </div>
    ${eC.length?`<div style="overflow-x:auto"><table class="ctbl" id="ctBody">
      <thead><tr><th>الدورة</th><th>المحاضر</th><th>الجهة</th><th>النوع</th><th>الأيام</th><th>الساعات</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
      <tbody>${bCRows(eC)}</tbody></table></div>`
    :`<div class="es"><div class="ei">📚</div><div class="et">لا توجد دورات</div><div class="es2">اضغط إضافة دورة للبدء</div></div>`}
  </div>

  <div class="tp" id="tp_files">
    <div class="fctabs" id="fCatTabs">
      <div class="fct active" onclick="fOF(this,'all')">📂 الكل (${eF.length})</div>
      <div class="fct" onclick="fOF(this,'official')">📄 رسمية (${eF.filter(f=>f.cat==='official').length})</div>
      <div class="fct" onclick="fOF(this,'thanks')">🏅 شكر (${eF.filter(f=>f.cat==='thanks').length})</div>
      <div class="fct" onclick="fOF(this,'order')">📋 أوامر (${eF.filter(f=>f.cat==='order').length})</div>
      <div class="fct" onclick="fOF(this,'certificate')">🎓 شهادات (${eF.filter(f=>f.cat==='certificate').length})</div>
      <div class="fct" onclick="fOF(this,'complaint')">⚠️ شكاوى (${eF.filter(f=>f.cat==='complaint').length})</div>
    </div>
    <div class="sh"><div></div><button class="btn btng bsm" onclick="openFileModal('${id}')">➕ إضافة ملف</button></div>
    <div class="fgrid" id="fGrid">${bFCards(eF)}</div>
  </div>

  <div class="tp" id="tp_personal">
    <div class="sh">
      <div style="font-size:14px;font-weight:800;color:var(--text)">🪪 الملفات الشخصية للموظف</div>
      <button class="btn btng bsm" onclick="openPFModal2('${id}')">➕ إضافة ملف شخصي</button>
    </div>
    <div class="pfgrid" id="pfGrid">${bPFCards(ePF,id)}</div>
  </div>

  <div class="tp" id="tp_tl">
    <div class="tl">${bTL(e,eC)}</div>
  </div>`;
}

/* ════════════════════════════════════════
   BUILD HELPERS
════════════════════════════════════════ */
function bCRows(list,f='all'){
  const rows=f==='all'?list:list.filter(c=>c.status===f);
  if(!rows.length)return`<tr><td colspan="9" style="text-align:center;padding:26px;color:var(--text3)">لا توجد دورات في هذه الفئة</td></tr>`;
  return rows.map(c=>{
    const si=stI[c.status]||stI.done;
    const tH=c.type==='online'?'<span class="ct ctnet">💻 إلكترونية</span>':'<span class="ct cton">🏛️ موقعية</span>';
    const dn=parseInt(c.days)||0;
    const dl=dn>0?(dn>=14?Math.floor(dn/7)+' أسابيع'+(dn%7?' و'+dn%7+' أيام':''):dn+' أيام'):'—';
    return`<tr><td>${c.name}</td><td style="color:var(--text2)">${c.lecturer||'—'}</td>
      <td style="color:var(--text2)">${c.provider||'—'}</td><td>${tH}</td>
      <td style="color:var(--gold)">${dl}</td><td style="color:var(--text2)">${c.hours?c.hours+'س':'—'}</td>
      <td style="color:var(--text3)">${c.date?fds(c.date):'—'}</td>
      <td><span class="cs ${si.cls}">${si.lbl}</span></td>
      <td><button class="btn btnr bsm" style="padding:3px 7px" onclick="cDel('course','${c.id}')">🗑</button></td>
    </tr>`;
  }).join('');
}
function fCT(el,f){el.closest('.ch').querySelectorAll('.cfb').forEach(b=>b.classList.remove('active'));el.classList.add('active');
  const tb=document.querySelector('#ctBody tbody');if(tb)tb.innerHTML=bCRows(DB.courses().filter(c=>c.empId===cId),f);}

function bFCards(files,cat='all'){
  const list=cat==='all'?files:files.filter(f=>f.cat===cat);
  if(!list.length)return`<div class="fempty"><div class="fi">📭</div><p>لا توجد وثائق في هذه الفئة</p></div>`;
  return list.map(f=>{const ci=catI[f.cat]||catI.other;
    return`<div class="fcard"><div class="fctop"><div class="fico">${ci.icon}</div>
      <div><div class="fcl" style="color:${ci.color}">${ci.label}</div>
      <div class="fnm">${f.name}</div><div class="fmt">${f.ref?'#'+f.ref+' · ':''}${fds(f.date)}</div></div></div>
      ${f.notes?`<div style="font-size:10px;color:var(--text3);line-height:1.6;margin-bottom:8px">${f.notes}</div>`:''}
      <div class="facts">
        ${f.fileData?`<div class="fab" onclick="vF('${f.id}','files')">👁 عرض</div><div class="fab" onclick="dF('${f.id}','files')">⬇️</div>`:`<div class="fab" style="opacity:0.35;cursor:default">لا يوجد مرفق</div>`}
        <div class="fab del" onclick="cDel('file','${f.id}')">🗑</div>
      </div></div>`;}).join('');
}
function fOF(el,cat){document.querySelectorAll('#fCatTabs .fct').forEach(t=>t.classList.remove('active'));el.classList.add('active');
  document.getElementById('fGrid').innerHTML=bFCards(DB.files().filter(f=>f.empId===cId),cat);}

function bPFCards(recs,empId){
  const types=['natid','deptid','rescard','salary','passport','other'];
  return types.map(type=>{
    const rec=recs.find(r=>r.type===type);const ti=pfT[type];
    const hasF=rec&&rec.fileData;
    const exp=rec&&rec.expiry?new Date(rec.expiry):null;
    const expD=exp?dDiff(today,exp):null;
    let expL='',expC='';
    if(exp){if(expD<0){expL=`⛔ منتهية منذ ${Math.abs(expD)} يوم`;expC='ex';}
      else if(expD<=60){expL=`⚠️ تنتهي خلال ${expD} يوم`;expC='ne';}
      else expL=`✅ صالحة حتى ${fds(rec.expiry)}`;}
    return`<div class="pfcard ${hasF?'has':''}">
      <div class="pftop"><div class="pfic" style="background:${ti.bg}">${ti.icon}</div>
        <div><div class="pftitle">${ti.label}</div>
        <div class="pfsub">${rec&&rec.note?rec.note:(hasF?'تم الرفع':'لم يُرفع بعد')}</div></div>
      </div>
      <div class="pfst"><div class="pfdot ${hasF?'ok':'miss'}"></div>
        <div class="pfstxt" style="color:${hasF?'var(--teal)':'var(--red)'}">${hasF?'✅ متوفر':'❌ غير متوفر'}</div>
      </div>
      ${expL?`<div class="pfexp ${expC}">${expL}</div>`:''}
      ${rec&&rec.issued?`<div style="font-size:10px;color:var(--text3);margin-bottom:6px">📅 إصدار: ${fds(rec.issued)}</div>`:''}
      <div class="pfacts">
        ${hasF?`<button class="btn btnt bsm" style="flex:1" onclick="vF('${rec.id}','personal')">👁 عرض</button>
                <button class="btn btno bsm" onclick="dF('${rec.id}','personal')">⬇️</button>`:''}
        <button class="btn btng bsm" style="${hasF?'':'flex:1'}" onclick="openPFModalT('${empId}','${type}')">
          ${hasF?'🔄 تحديث':'📤 رفع الملف'}
        </button>
        ${rec?`<button class="btn btnr bsm" onclick="cDel('personal','${rec.id}')">🗑</button>`:''}
      </div>
    </div>`;
  }).join('');
}

function bTL(e,courses){
  const items=[];
  if(e.hire)items.push({date:e.hire,type:'tld-t',title:'📋 أمر التعيين',desc:`تعيين بوظيفة ${e.title||''} في ${e.dept||''}`});
  if(e.start)items.push({date:e.start,type:'tld-b',title:'🚀 المباشرة بالعمل',desc:`بدأ العمل في ${e.branch||''}`});
  if(e.lp)items.push({date:e.lp,type:'tld-g',title:`🏆 آخر ترقية — ${e.grade||''}`,desc:'صدر قرار الترقية'});
  courses.filter(c=>c.status==='done'&&c.date).sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(c=>{
    items.push({date:c.date,type:'tld-b',title:`📚 ${c.name}`,desc:`${c.provider||''} ${c.lecturer?'· '+c.lecturer:''} — ${c.days?c.days+' يوم':''} ${c.hours?'/ '+c.hours+' ساعة':''}`});
  });
  const pd=getPD(e);if(pd)items.push({date:pd.toISOString().split('T')[0],type:'tld-g',title:'🎯 الترقية المستحقة القادمة',desc:getDL(e)&&getDL(e)<=0?'⚠️ متأخرة':'مخططة',dashed:true});
  items.sort((a,b)=>new Date(a.date)-new Date(b.date));
  if(!items.length)return'<div class="es"><div class="ei">📅</div><div class="et">لا يوجد سجل بعد</div></div>';
  return items.map(i=>`<div class="tli"><div class="tld ${i.type}"></div>
    <div class="tlb" ${i.dashed?'style="border-style:dashed;opacity:0.72"':''}>
      <div class="tt">${i.title}</div><div class="td">${fd(i.date)}</div>
      ${i.desc?`<div class="tn">${i.desc}</div>`:''}
    </div></div>`).join('');
}

/* ════════════════════════════════════════
   FILE VIEW/DOWNLOAD
════════════════════════════════════════ */
function vF(fid,store){
  const f=(store==='files'?DB.files():DB.personal()).find(x=>x.id===fid);
  if(!f||!f.fileData)return;
  const w=window.open();
  w.document.write(`<html><body style="margin:0;background:#111">
    ${f.fileData.startsWith('data:image')?`<img src="${f.fileData}" style="max-width:100%;display:block;margin:auto">`:
    `<embed src="${f.fileData}" type="application/pdf" width="100%" height="100%">`}
  </body></html>`);
}
function dF(fid,store){
  const f=(store==='files'?DB.files():DB.personal()).find(x=>x.id===fid);
  if(!f||!f.fileData)return;
  const a=document.createElement('a');a.href=f.fileData;a.download=f.fileName||f.name||'doc';a.click();
}

/* ════════════════════════════════════════
   EMP CRUD
════════════════════════════════════════ */
function openEmpModal(id=null){
  edId=id;document.getElementById('empMT').textContent=id?'✏️ تعديل بيانات الموظف':'➕ إضافة موظف جديد';
  ['f_name','f_id','f_grade','f_title','f_dept','f_branch','f_hire','f_start','f_lp','f_sal','f_nt'].forEach(x=>document.getElementById(x).value='');
  document.getElementById('f_py').value='3';document.getElementById('f_st').value='active';document.getElementById('f_sh').value='morning';
  if(id){const e=DB.emps().find(x=>x.id===id);if(e){
    ['name','id','grade','title','dept','branch','hire','start','sal','nt'].forEach(k=>document.getElementById('f_'+k).value=e[k]||'');
    document.getElementById('f_lp').value=e.lp||'';document.getElementById('f_py').value=e.py||'3';
    document.getElementById('f_st').value=e.status||'active';document.getElementById('f_sh').value=e.shift||'morning';
  }}
  oo('empModal');
}
function saveEmp(){
  const name=document.getElementById('f_name').value.trim();const empId=document.getElementById('f_id').value.trim();
  if(!name){alert('الرجاء إدخال اسم الموظف');return;}if(!empId){alert('الرجاء إدخال الرقم الوظيفي');return;}
  const emps=DB.emps();if(!edId&&emps.find(e=>e.id===empId)){alert('الرقم الوظيفي مستخدم مسبقاً');return;}
  const emp={id:empId,name,grade:document.getElementById('f_grade').value.trim(),
    title:document.getElementById('f_title').value.trim(),dept:document.getElementById('f_dept').value.trim(),
    branch:document.getElementById('f_branch').value.trim(),hire:document.getElementById('f_hire').value,
    start:document.getElementById('f_start').value,lp:document.getElementById('f_lp').value,
    py:document.getElementById('f_py').value,status:document.getElementById('f_st').value,
    shift:document.getElementById('f_sh').value,salary:document.getElementById('f_sal').value,
    notes:document.getElementById('f_nt').value.trim()};
  if(edId){const i=emps.findIndex(e=>e.id===edId);if(i>=0)emps[i]=emp;}else emps.push(emp);
  DB.saveEmps(emps);co('empModal');openEmp(emp.id);
}

/* ════════════════════════════════════════
   COURSE CRUD
════════════════════════════════════════ */
function openCourseModal(empId){
  document.getElementById('c_ei').value=empId;
  ['c_nm','c_pr','c_lc','c_dt','c_ed','c_dy','c_hr','c_no'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('c_ty').value='onsite';document.getElementById('c_st').value='done';oo('courseModal');
}
function saveCourse(){
  const name=document.getElementById('c_nm').value.trim();if(!name){alert('الرجاء إدخال اسم الدورة');return;}
  const c=DB.courses();
  c.push({id:'c'+Date.now(),empId:document.getElementById('c_ei').value,name,
    provider:document.getElementById('c_pr').value.trim(),lecturer:document.getElementById('c_lc').value.trim(),
    type:document.getElementById('c_ty').value,status:document.getElementById('c_st').value,
    date:document.getElementById('c_dt').value,enddate:document.getElementById('c_ed').value,
    days:document.getElementById('c_dy').value,hours:document.getElementById('c_hr').value,
    notes:document.getElementById('c_no').value.trim()});
  DB.saveCourses(c);co('courseModal');openEmp(cId);
}

/* ════════════════════════════════════════
   OFFICIAL FILE CRUD
════════════════════════════════════════ */
function openFileModal(empId){
  document.getElementById('fi_ei').value=empId;
  ['fi_nm','fi_rf','fi_nt'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('fi_cat').value='official';document.getElementById('fi_dt').value='';
  document.getElementById('fi_ut').textContent='اسحب أو اضغط للاختيار';
  document.getElementById('fi_fl').value='';fiB64=null;fiNm=null;oo('fileModal');
}
function saveOF(){
  const name=document.getElementById('fi_nm').value.trim();if(!name){alert('الرجاء إدخال اسم الوثيقة');return;}
  const f=DB.files();
  f.push({id:'f'+Date.now(),empId:document.getElementById('fi_ei').value,name,
    cat:document.getElementById('fi_cat').value,date:document.getElementById('fi_dt').value,
    ref:document.getElementById('fi_rf').value.trim(),notes:document.getElementById('fi_nt').value.trim(),
    fileData:fiB64||null,fileName:fiNm||null});
  DB.saveFiles(f);co('fileModal');openEmp(cId);
}

/* ════════════════════════════════════════
   PERSONAL FILE CRUD
════════════════════════════════════════ */
function openPFModal2(empId){openPFModalT(empId,'natid');}
function openPFModalT(empId,type){
  document.getElementById('pf_ei').value=empId;document.getElementById('pf_ty').value=type;
  ['pf_no','pf_is','pf_ex'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('pf_ut').textContent='اسحب أو اضغط للاختيار';
  document.getElementById('pf_fl').value='';pfB64=null;pfNm=null;oo('pfModal');
}
function savePF(){
  const empId=document.getElementById('pf_ei').value;const type=document.getElementById('pf_ty').value;
  const pfs=DB.personal();const xi=pfs.findIndex(p=>p.empId===empId&&p.type===type);
  const rec={id:'p'+Date.now(),empId,type,note:document.getElementById('pf_no').value.trim(),
    issued:document.getElementById('pf_is').value,expiry:document.getElementById('pf_ex').value,
    fileData:pfB64||null,fileName:pfNm||null};
  if(xi>=0)pfs[xi]=rec;else pfs.push(rec);
  DB.savePersonal(pfs);co('pfModal');openEmp(cId);
}

/* ════════════════════════════════════════
   FILE UPLOAD
════════════════════════════════════════ */
function hsel(e,p){
  const file=e.target.files[0];if(!file)return;
  if(file.size>5*1024*1024){alert('حجم الملف يتجاوز 5MB');return;}
  if(p==='fi'){fiNm=file.name;document.getElementById('fi_ut').textContent='✅ '+file.name;}
  else{pfNm=file.name;document.getElementById('pf_ut').textContent='✅ '+file.name;}
  const r=new FileReader();r.onload=ev=>{if(p==='fi')fiB64=ev.target.result;else pfB64=ev.target.result;};
  r.readAsDataURL(file);
}
function hdrop(e,p){
  e.preventDefault();const uz=document.getElementById(p==='fi'?'uzOf':'uzPf');uz.classList.remove('drag');
  const file=e.dataTransfer.files[0];if(!file)return;
  if(file.size>5*1024*1024){alert('حجم الملف يتجاوز 5MB');return;}
  if(p==='fi'){fiNm=file.name;document.getElementById('fi_ut').textContent='✅ '+file.name;}
  else{pfNm=file.name;document.getElementById('pf_ut').textContent='✅ '+file.name;}
  const r=new FileReader();r.onload=ev=>{if(p==='fi')fiB64=ev.target.result;else pfB64=ev.target.result;};
  r.readAsDataURL(file);
}

/* ════════════════════════════════════════
   CONFIRM DELETE
════════════════════════════════════════ */
function cDel(type,id){
  const msgs={emp:'سيتم حذف ملف الموظف كاملاً مع جميع دوراته وملفاته.',
    course:'هل تريد حذف هذه الدورة التدريبية؟',file:'هل تريد حذف هذه الوثيقة الرسمية؟',
    personal:'هل تريد حذف هذا الملف الشخصي؟'};
  document.getElementById('confirmTxt').textContent=msgs[type]||'هل أنت متأكد؟';
  document.getElementById('confirmOk').onclick=()=>{
    if(type==='emp'){DB.saveEmps(DB.emps().filter(e=>e.id!==id));DB.saveCourses(DB.courses().filter(c=>c.empId!==id));
      DB.saveFiles(DB.files().filter(f=>f.empId!==id));DB.savePersonal(DB.personal().filter(p=>p.empId!==id));
      co('confirmModal');goWelcome();}
    else if(type==='course'){DB.saveCourses(DB.courses().filter(c=>c.id!==id));co('confirmModal');openEmp(cId);}
    else if(type==='file'){DB.saveFiles(DB.files().filter(f=>f.id!==id));co('confirmModal');openEmp(cId);}
    else if(type==='personal'){DB.savePersonal(DB.personal().filter(p=>p.id!==id));co('confirmModal');openEmp(cId);}
  };oo('confirmModal');
}

/* ════════════════════════════════════════
   OVERLAY
════════════════════════════════════════ */
function oo(id){document.getElementById(id).classList.add('open');}
function co(id){document.getElementById(id).classList.remove('open');}
document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('click',function(e){if(e.target===this)this.classList.remove('open');}));

/* INIT */
rSB();
