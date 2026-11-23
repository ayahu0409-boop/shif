var SUPA_URL='https://atkrhmahmniiinhuooow.supabase.co';
var SUPA_KEY='sb_publishable_u9j2dH29z8sT_jn48tdrug_4NqysjxK';
var sb=supabase.createClient(SUPA_URL,SUPA_KEY);

var KEY='shifaa_v1';
var S={
  files:[],
  msgs:[
    {k:'سؤال',t:'متى موعد الامتحانات؟',st:'قيد المراجعة'},
    {k:'اقتراح',t:'اقتراح بخصوص المحاضرات',st:'مجيب'}
  ]
};
// الشكاوى تبقى محفوظة بالمتصفح مؤقتاً، والملفات صارت في القاعدة
try{var sv=JSON.parse(localStorage.getItem(KEY)||'null');if(sv&&sv.msgs)S.msgs=sv.msgs}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify({msgs:S.msgs}))}catch(e){}}
function $(id){return document.getElementById(id)}
function toast(t){
  var e=$('toast');e.textContent=t;e.classList.add('on');
  setTimeout(function(){e.classList.remove('on')},2000);
}

/* ===== الحساب والبيانات ===== */
var ME=null, ADMIN=false;
function nameFromEmail(e){return (e||'').split('@')[0]}

async function loadFiles(){
  var r=await sb.from('uploads').select('*').order('created_at',{ascending:false});
  if(r.error){toast('تعذر تحميل الملفات');return}
  S.files=r.data.map(function(x){
    return {id:x.id,name:x.name,from:x.from_name,type:x.type,st:x.status,path:x.file_path,size:x.size};
  });
}
async function setStatus(id,st){
  var r=await sb.from('uploads').update({status:st}).eq('id',id);
  if(r.error){toast('تعذر تنفيذ العملية');return false}
  await loadFiles();return true;
}
async function openFile(path){
  var w=window.open('','_blank');
  var r=await sb.storage.from('pdfs').createSignedUrl(path,3600);
  if(r.error){if(w)w.close();toast('تعذر فتح الملف');return}
  if(w)w.location=r.data.signedUrl;else location.href=r.data.signedUrl;
}
function logout(){sb.auth.signOut().then(function(){location.href='index.html'})}

// كل صفحة تنتظر READY: يرجع المستخدم أو null (وقتها يحوّل لصفحة الدخول)
var READY=(async function(){
  var r=await sb.auth.getSession();
  var s=r.data.session;
  if(!s){if(!window.PUBLIC_PAGE)location.replace('index.html');return null}
  ME=s.user;
  var p=await sb.from('profiles').select('is_admin').eq('id',ME.id).maybeSingle();
  ADMIN=!!(p.data&&p.data.is_admin);
  if(window.NEED_ADMIN&&!ADMIN){location.replace('home.html');return null}
  if(!window.PUBLIC_PAGE)await loadFiles();
  return ME;
})();

/* ===== الأيقونات: كل أيقونة رسم SVG، والخطوط مفصولة بـ | =====
   لإضافة أيقونة جديدة: أضف اسم ومسار هنا، واستعملها بـ ic('الاسم') */
var P={
  home:'M3 11.5L12 4l9 7.5|M5.5 10v10h4.5v-6h4v6h4.5V10',
  grid:'M4 4h6v6H4z|M14 4h6v6h-6z|M4 14h6v6H4z|M14 14h6v6h-6z',
  shield:'M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z|M8.5 12l2.5 2.5 4.5-5',
  chat:'M4 5h16v11H10l-5 4v-4H4z|M8 9.5h8|M8 12.5h5',
  book:'M12 6.5C10 4.8 7 4.3 3.5 4.5v14c3.5-.2 6.5.3 8.5 2 2-1.7 5-2.2 8.5-2v-14c-3.5-.2-6.5.3-8.5 2z|M12 6.5V20.5',
  note:'M6 3h8l5 5v13H6z|M14 3v5h5|M9 13h7|M9 17h5',
  exam:'M6 3h8l5 5v13H6z|M14 3v5h5|M9 14.5l2 2 4-4.5',
  cloud:'M7 18.5a4 4 0 0 1-.7-7.9 5.5 5.5 0 0 1 10.6-1.1 4.5 4.5 0 0 1 .1 9z|M12 17v-6|M9.5 13l2.5-2.5 2.5 2.5',
  mail:'M3 6h18v12H3z|M3.5 7l8.5 6.5L20.5 7',
  lock:'M5.5 11h13v9.5h-13z|M8.5 11V8a3.5 3.5 0 0 1 7 0v3|M12 15v2',
  heart:'M12 20.5C5.5 15 3 11.5 3 8.5 3 6 5 4 7.5 4c1.8 0 3.5 1 4.5 2.6C13 5 14.7 4 16.5 4 19 4 21 6 21 8.5c0 3-2.5 6.5-9 12z',
  tooth:'M7.5 3.5C5 3.5 3.5 5.5 3.5 8c0 2 1 3.5 1.5 5.5c.6 2.4.8 7 2.5 7c1.7 0 1.6-4.5 2.8-4.5h3.4c1.2 0 1.1 4.5 2.8 4.5c1.7 0 1.9-4.6 2.5-7c.5-2 1.5-3.5 1.5-5.5c0-2.5-1.5-4.5-4-4.5c-2 0-3 1-4.5 1s-2.5-1-4.5-1z',
  plus:'M12 4v16|M4 12h16',
  pill:'M10.5 3.8a4.6 4.6 0 0 1 6.5 6.5l-6.7 6.7a4.6 4.6 0 0 1-6.5-6.5z|M7.2 7.2l6.6 6.6',
  clip:'M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14 7',
  back:'M9 5l7 7-7 7',
  down:'M6 9l6 6 6-6'
};
function ic(n,c){
  return '<svg class="ic '+(c||'')+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'
   +P[n].split('|').map(function(d){return '<path d="'+d+'"/>'}).join('')+'</svg>';
}
// أي عنصر فيه data-ic="book" يتحول لأيقونة
function icons(){document.querySelectorAll('[data-ic]').forEach(function(e){e.innerHTML=ic(e.dataset.ic)})}
icons();
// تفاعل: الضغط على القلب أو الدكتور أو الرسوم الصغيرة يحركها
document.addEventListener('click',function(e){
  var m=e.target.closest('.mini,.doc,.heart');
  if(!m)return;
  m.classList.remove('hit');void m.getBoundingClientRect();m.classList.add('hit');
  setTimeout(function(){m.classList.remove('hit')},700);
});
function nav(active){
  var items=[
    ['home.html','home','الرئيسية','home'],
    ['sections.html','grid','الأقسام','sections'],
    ['admin.html','shield','الإدارة','admin'],
    ['complaints.html','chat','الشكاوى','comp']
  ];
  $('nav').innerHTML=items.map(function(i){
    return '<a href="'+i[0]+'" class="'+(i[3]===active?'on':'')+'">'+ic(i[1])+i[2]+'</a>';
  }).join('');
}

/* ===== رفع الملفات (PDF) ===== */
var PICKED=null;
var LABEL_STYLE='display:flex;align-items:center;justify-content:center;gap:8px;padding:16px;margin:12px 0;'
  +'border:2px dashed var(--rose,#d6336c);border-radius:20px;color:var(--rose,#d6336c);'
  +'background:var(--pink,#fff0f6);cursor:pointer;text-align:center;font-weight:500';

function initUpload(){
  var m=document.createElement('div');m.id='modal';
  m.onclick=function(e){if(e.target===m)m.classList.remove('on')};
  m.innerHTML='<div><h3 style="margin-bottom:12px">رفع ملف</h3>'
   +'<input id="fname" placeholder="اسم الملف (يتعبى تلقائياً من الـ PDF)">'
   +'<select id="ftype"><option>منهج</option><option>ملخص</option><option>أسئلة</option></select>'
   +'<label for="ffile" id="flabel" style="'+LABEL_STYLE+'">'+ic('cloud')+' اختر ملف PDF</label>'
   +'<input type="file" id="ffile" accept="application/pdf,.pdf" hidden>'
   +'<button class="btn" id="upbtn" onclick="upload()">رفع للمراجعة</button></div>';
  $('app').appendChild(m);
  $('ffile').addEventListener('change',pickFile);
}
function resetFile(){
  PICKED=null;
  $('ffile').value='';
  $('flabel').innerHTML=ic('cloud')+' اختر ملف PDF';
}
function pickFile(){
  var f=$('ffile').files[0];
  if(!f)return;
  var isPdf=f.type==='application/pdf'||/\.pdf$/i.test(f.name);
  if(!isPdf){toast('اختر ملف PDF فقط');resetFile();return}
  if(f.size>10*1024*1024){toast('حجم الملف أكبر من 10 ميجا');resetFile();return}
  PICKED=f;
  var l=$('flabel');
  l.innerHTML=ic('clip');
  l.appendChild(document.createTextNode(' '+f.name));
  if(!$('fname').value.trim())$('fname').value=f.name.replace(/\.pdf$/i,'');
}
function openUpload(type){if(type)$('ftype').value=type;$('modal').classList.add('on')}
async function upload(){
  if(!PICKED){toast('اختر ملف PDF أولاً');return}
  if(!ME){toast('سجّل الدخول أولاً');return}
  var n=$('fname').value.trim()||PICKED.name.replace(/\.pdf$/i,'');
  var type=$('ftype').value, btn=$('upbtn');
  btn.disabled=true;toast('جاري الرفع...');
  var path='u/'+ME.id+'/'+Date.now()+'.pdf';
  var up=await sb.storage.from('pdfs').upload(path,PICKED,{contentType:'application/pdf'});
  if(up.error){btn.disabled=false;toast('فشل الرفع، حاول مرة أخرى');return}
  var ins=await sb.from('uploads').insert({name:n,type:type,from_name:nameFromEmail(ME.email),file_path:path,size:PICKED.size});
  btn.disabled=false;
  if(ins.error){await sb.storage.from('pdfs').remove([path]);toast('فشل الحفظ، حاول مرة أخرى');return}
  $('fname').value='';
  resetFile();
  $('modal').classList.remove('on');
  toast('تم الرفع، بانتظار موافقة الإدارة');
  await loadFiles();
  }
