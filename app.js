const DATA_KEY="viena_rules_v1";
const categories=[
{id:"gerais",code:"01",name:"CÓDIGO DA RUA",short:"Regras Gerais",desc:"A base de convivência de Viena. Tudo começa aqui.",rules:[
["01.01","Respeito e convivência","Todos os jogadores devem manter respeito entre si. Ofensas, preconceito, perseguição ou comportamento tóxico que prejudique a experiência podem resultar em punição.","GERAL"],
["01.02","Valorização da vida","Seu personagem deve agir de forma coerente diante de situações de risco. A vida deve ser tratada como um bem relevante dentro do RP.","ROLEPLAY"],
["01.03","RDM — Random Deathmatch","É proibido matar ou tentar matar outro jogador sem contexto ou motivação de RP que justifique a ação.","COMBATE"],
["01.04","VDM — Vehicle Deathmatch","É proibido utilizar veículos propositalmente para atropelar ou causar dano a jogadores sem contexto válido.","COMBATE"],
["01.05","Metagaming","É proibido utilizar informações obtidas fora do personagem para tomar decisões dentro do RP.","IMERSÃO"],
["01.06","Powergaming","É proibido forçar ações impossíveis ou retirar do outro jogador a possibilidade de reagir ao RP.","IMERSÃO"],
["01.07","Combat Log","Desconectar, sair do jogo ou utilizar meios para evitar uma situação de RP ativa é proibido.","CONDUTA"],
["01.08","Retorno ao combate","Após ser incapacitado, o personagem não deve retornar imediatamente à mesma situação para interferir no confronto.","COMBATE"]
]},
{id:"corridas",code:"02",name:"CÓDIGO VERMELHO",short:"Corridas Ilegais",desc:"As ruas pertencem a quem tem coragem. Corridas clandestinas, apostas e perseguições seguem este código.",rules:[
["02.01","Organização da largada","A corrida deve possuir uma largada clara. Sair antes da contagem ou sinal oficial caracteriza queima de largada e pode gerar desclassificação.","CORRIDA"],
["02.02","Interferência externa","É proibido utilizar jogadores ou veículos externos para bloquear, empurrar ou destruir propositalmente um competidor durante a corrida.","CORRIDA"],
["02.03","Cortar caminho","Cortar trechos do percurso somente é permitido quando a organização da corrida definir previamente que atalhos fazem parte da rota.","CORRIDA"],
["02.04","Sabotagem","Sabotagem pode existir quando houver contexto de RP e for realizada por meios permitidos. Exploits, bugs ou métodos externos são proibidos.","UNDERGROUND"],
["02.05","Aposta e palavra","Ao aceitar uma aposta ou desafio, o jogador deve respeitar o acordo firmado em RP. Golpes e fraudes podem gerar punição conforme o contexto.","UNDERGROUND"],
["02.06","Corrida fantasma","Um piloto eliminado não pode retornar à área para informar posições, bloquear adversários ou interferir na disputa.","CORRIDA"],
["02.07","Polícia e perseguição","Fugir de uma abordagem policial durante uma corrida é permitido quando houver contexto, mas o piloto deve respeitar as regras gerais de perseguição e direção.","HEAT"],
["02.08","Direção irresponsável","Velocidade alta faz parte das corridas, mas não autoriza abuso de mecânicas, colisões intencionais sem contexto ou condução impossível.","DIREÇÃO"],
["02.09","Corrida oficial","Corridas oficiais da cidade podem possuir regras específicas de percurso, classes, largada, premiação e desclassificação. Essas regras prevalecem para aquela competição.","EVENTO"],
["02.10","Duelo de rua","Desafios 1x1 podem ser realizados em locais apropriados, desde que ambos os participantes tenham aceitado o desafio e não haja interferência indevida.","STREET"]
]},
{id:"policia",code:"03",name:"CÓDIGO AZUL",short:"Polícia & Perseguições",desc:"Procedimentos para abordagens, perseguições e operações contra o submundo das corridas.",rules:[
["03.01","Abordagem","A abordagem deve possuir motivo de RP. A autoridade deve, sempre que possível, comunicar a ordem de parada e permitir reação compatível.","POLÍCIA"],
["03.02","Perseguição","Perseguições devem ser conduzidas com coerência e sem transformar qualquer abordagem em combate letal automaticamente.","POLÍCIA"],
["03.03","PIT","O PIT deve ser utilizado de maneira proporcional e em condições que não caracterizem abuso deliberado da mecânica.","POLÍCIA"],
["03.04","Uso da força","O uso de força letal deve ser justificado pelo contexto e pela ameaça apresentada, respeitando a escalada da ocorrência.","POLÍCIA"],
["03.05","Operações contra corridas","Operações podem ser planejadas para interromper eventos clandestinos, realizar cercos, identificar organizadores e apreender veículos conforme o RP.","OPERAÇÃO"]
]},
{id:"faccoes",code:"04",name:"CÓDIGO SOMBRIO",short:"Facções & Crime",desc:"Regras para organizações criminosas, oficinas, contrabando e disputas territoriais.",rules:[
["04.01","Hierarquia","Organizações devem possuir liderança e funções coerentes com sua proposta, mantendo atividade e RP compatíveis.","FACÇÃO"],
["04.02","Conflitos","Conflitos entre organizações devem possuir motivo e escalada de RP. Matar por motivo banal não é justificativa automática.","FACÇÃO"],
["04.03","Oficinas clandestinas","Oficinas podem atuar como pontos de preparação, modificação e manutenção de veículos, desde que respeitem as regras de economia e RP.","CRIME"],
["04.04","Contrabando","Peças, veículos e itens ilegais podem integrar o RP criminoso quando houver sistemas ou autorização específicos para isso.","CRIME"]
]},
{id:"economia",code:"05",name:"CÓDIGO OURO",short:"Economia & Veículos",desc:"Regras para dinheiro, comércio, veículos e o mercado de Viena.",rules:[
["05.01","Fraudes","Golpes que explorem bugs, duplicações ou falhas técnicas são proibidos. Golpes de RP podem existir quando o sistema permitir e houver contexto.","ECONOMIA"],
["05.02","Veículos","Cada veículo deve ser utilizado de acordo com sua finalidade e características. Explorar física ou mecânica de forma impossível pode ser punido.","VEÍCULOS"],
["05.03","Mercado","Comércios e negociações devem respeitar preços, sistemas e limitações estabelecidas pela administração.","ECONOMIA"]
]},
{id:"denuncias",code:"06",name:"TRIBUNAL DA RUA",short:"Denúncias & Punições",desc:"Como reportar situações e como a administração classifica infrações.",rules:[
["06.01","Denúncia objetiva","A denúncia deve informar o que aconteceu, quem está envolvido e qual regra o denunciante entende ter sido violada.","DENÚNCIA"],
["06.02","Provas","Clipes, vídeos, prints e demais provas devem apresentar contexto suficiente para a análise. Edição que esconda o contexto pode prejudicar a denúncia.","DENÚNCIA"],
["06.03","Bandeira Amarela","Advertência formal aplicada em infrações leves ou como registro administrativo.","PUNIÇÃO"],
["06.04","Bandeira Vermelha","Suspensão temporária de determinadas atividades ou acesso, conforme a gravidade da infração.","PUNIÇÃO"],
["06.05","Bandeira Preta","Banimento aplicado em infrações graves, reincidência ou situações previstas pela administração.","PUNIÇÃO"]
]}
];

const nav=document.getElementById("nav");
const home=document.getElementById("homeCategories");
const updates=document.getElementById("updatesList");

function renderNav(){
  nav.innerHTML=categories.map(c=>`<button data-route="${c.id}"><span>${c.code}</span>${c.short}</button>`).join("");
  home.innerHTML=categories.map(c=>`<article class="cat-card" data-route="${c.id}" data-code="${c.code}"><div class="num">${c.code} / VIENA</div><h3>${c.short}</h3><p>${c.desc}</p></article>`).join("");
}
function allRules(){return categories.flatMap(c=>c.rules.map(r=>({cat:c,...r})))}
function renderUpdates(){
  updates.innerHTML=[
    ["18 AGO 2026","Código Vermelho","Estrutura inicial das regras de corridas ilegais.","CORRIDAS"],
    ["18 AGO 2026","Tribunal da Rua","Sistema de classificação de penalidades.","ADMIN"],
    ["18 AGO 2026","Código da Rua","Publicação da Central de Regras Viena RP.","SITE"]
  ].map(x=>`<div class="update"><time>${x[0]}</time><strong>${x[1]} — ${x[2]}</strong><span>${x[3]}</span></div>`).join("");
}
function getData(){
  try{return JSON.parse(localStorage.getItem(DATA_KEY))||categories}catch(e){return categories}
}
function renderCategory(id){
  const c=getData().find(x=>x.id===id)||categories.find(x=>x.id===id);
  if(!c)return;
  document.getElementById("catCode").textContent=`CÓDIGO ${c.code}`;
  document.getElementById("catTitle").textContent=c.name;
  document.getElementById("catDesc").textContent=c.desc;
  document.getElementById("ruleList").innerHTML=c.rules.map((r,i)=>`<article class="rule" id="rule-${i}"><div class="rule-top"><div class="rule-num">${r[0]}</div><div><h3>${r[1]}</h3><p>${r[2]}</p><span class="tag">${r[3]}</span></div></div></article>`).join("");
  document.getElementById("ruleToc").innerHTML=`<strong>NESTA CATEGORIA</strong>`+c.rules.map((r,i)=>`<button onclick="document.getElementById('rule-${i}').scrollIntoView({behavior:'smooth',block:'center'})">${r[0]} — ${r[1]}</button>`).join("");
}
function route(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  if(id==="inicio"){document.getElementById("inicio").classList.add("active")}
  else if(id==="pesquisa"){document.getElementById("searchPage").classList.add("active");document.getElementById("searchInput").focus()}
  else if(id==="admin"){document.getElementById("adminPage").classList.add("active")}
  else {document.getElementById("categoryPage").classList.add("active");renderCategory(id)}
  document.querySelectorAll(".sidebar nav button").forEach(b=>b.classList.toggle("active",b.dataset.route===id));
  document.getElementById("sidebar").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});
}
document.addEventListener("click",e=>{
  const target=e.target.closest("[data-route]");
  if(target){e.preventDefault();route(target.dataset.route)}
});
function search(q,target){
  q=q.trim().toLowerCase();
  if(!q){target.innerHTML="";return}
  const res=allRules().filter(r=>r.join(" ").toLowerCase().includes(q)).slice(0,30);
  target.innerHTML=res.length?res.map(r=>`<div class="result" data-route="${r.cat.id}"><small>${r.cat.short} · ${r[0]}</small><h3>${r[1]}</h3><p>${r[2]}</p></div>`).join(""):`<div class="result"><h3>Nenhuma regra encontrada.</h3><p>Tente outra palavra.</p></div>`;
}
document.getElementById("searchOpen").onclick=()=>document.getElementById("searchOverlay").classList.add("open");
document.getElementById("searchClose").onclick=()=>document.getElementById("searchOverlay").classList.remove("open");
document.getElementById("overlaySearch").oninput=e=>search(e.target.value,document.getElementById("overlayResults"));
document.getElementById("searchInput").oninput=e=>search(e.target.value,document.getElementById("searchResults"));
document.getElementById("mobileMenu").onclick=()=>document.getElementById("sidebar").classList.toggle("open");
document.getElementById("adminLink").onclick=()=>route("admin");

document.getElementById("adminLogin").onclick=()=>{
  const pass=document.getElementById("adminPassword").value;
  if(pass!=="VIENA2026"){alert("Senha incorreta.");return}
  document.getElementById("adminEditor").hidden=false;
  const sel=document.getElementById("adminCategory");
  sel.innerHTML=getData().map(c=>`<option value="${c.id}">${c.short}</option>`).join("");
};
document.getElementById("adminSave").onclick=()=>{
  const data=getData(), c=data.find(x=>x.id===document.getElementById("adminCategory").value);
  const title=document.getElementById("adminRuleTitle").value.trim(), text=document.getElementById("adminRuleText").value.trim();
  if(!c||!title||!text){alert("Preencha título e texto.");return}
  const n=String(c.rules.length+1).padStart(2,"0");
  c.rules.push([`${c.code}.${n}`,title,text,"NOVA"]);
  localStorage.setItem(DATA_KEY,JSON.stringify(data));
  alert("Regra salva neste navegador.");
  document.getElementById("adminRuleTitle").value="";
  document.getElementById("adminRuleText").value="";
};
renderNav();renderUpdates();
