const $ = (id) => document.getElementById(id);
const form = $("taskForm"), titleInput = $("taskTitle");
let tasks = JSON.parse(localStorage.getItem("daylistTasks") || "[]");
let activeFilter = "All", activeCategory = "All", editingId = null;
$("todayLabel").textContent = new Date().toLocaleDateString(undefined, {weekday:"short", month:"short", day:"numeric"});

function persist(){ localStorage.setItem("daylistTasks", JSON.stringify(tasks)); render(); }
function safeDateTime(task){
  if(!task.date && !task.time) return "";
  const date = task.date ? new Date(task.date + "T00:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"}) : "";
  return [date, task.time].filter(Boolean).join(" · ");
}
function render(){
  const completed = tasks.filter(t=>t.completed).length;
  $("totalCount").textContent = tasks.length; $("openCount").textContent = tasks.length-completed; $("doneCount").textContent = completed;
  const pct = tasks.length ? Math.round(completed/tasks.length*100) : 0;
  $("progressText").textContent = pct+"%"; $("progressBar").style.width = pct+"%";
  const visible = tasks.filter(t => activeFilter==="All" || (activeFilter==="Active"?!t.completed:t.completed))
    .filter(t => activeCategory==="All" || t.list===activeCategory)
    .sort((a,b)=> Number(a.completed)-Number(b.completed) || ((a.date||"9999")+(a.time||"")).localeCompare((b.date||"9999")+(b.time||"")));
  $("headingCount").textContent = visible.length;
  $("taskList").replaceChildren(); $("emptyState").classList.toggle("show", visible.length===0);
  visible.forEach(task=>{
    const row=document.createElement("article"); row.className="task-item"+(task.completed?" completed":"");
    const check=document.createElement("button"); check.className="check"; check.setAttribute("aria-label",task.completed?"Mark as not completed":"Mark as completed"); check.textContent=task.completed?"✓":"";
    check.addEventListener("click",()=>{task.completed=!task.completed;persist();});
    const content=document.createElement("div"); const name=document.createElement("div"); name.className="task-title"; name.textContent=task.title; content.appendChild(name);
    const meta=document.createElement("div"); meta.className="task-meta";
    const category=document.createElement("span"); category.className="pill list-"+task.list; category.textContent=task.list; meta.appendChild(category);
    const due=safeDateTime(task); if(due){const dueEl=document.createElement("span");dueEl.className="pill due";dueEl.textContent="◷ "+due;meta.appendChild(dueEl);}
    content.appendChild(meta);
    const actions=document.createElement("div");actions.className="task-actions";
    const edit=document.createElement("button");edit.className="icon-btn";edit.textContent="✎";edit.title="Edit task";edit.setAttribute("aria-label","Edit task");edit.addEventListener("click",()=>openEdit(task.id));
    const del=document.createElement("button");del.className="icon-btn";del.textContent="×";del.title="Delete task";del.setAttribute("aria-label","Delete task");del.addEventListener("click",()=>{tasks=tasks.filter(t=>t.id!==task.id);persist();});
    actions.append(edit,del);row.append(check,content,actions);$("taskList").appendChild(row);
  });
}
form.addEventListener("submit",e=>{e.preventDefault();const title=titleInput.value.trim();if(!title){titleInput.focus();return;}tasks.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),title,date:$("taskDate").value,time:$("taskTime").value,list:$("taskList").value,completed:false});form.reset();persist();titleInput.focus();});
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{activeFilter=btn.dataset.filter;document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===btn));render();}));
document.querySelectorAll(".category").forEach(btn=>btn.addEventListener("click",()=>{activeCategory=btn.dataset.category;document.querySelectorAll(".category").forEach(b=>b.classList.toggle("active",b===btn));render();}));
function openEdit(id){const task=tasks.find(t=>t.id===id);if(!task)return;editingId=id;$("editTitle").value=task.title;$("editDate").value=task.date;$("editTime").value=task.time;$("editList").value=task.list;$("editModal").classList.add("open");$("editModal").setAttribute("aria-hidden","false");$("editTitle").focus();}
function closeEdit(){$("editModal").classList.remove("open");$("editModal").setAttribute("aria-hidden","true");editingId=null;}
$("editForm").addEventListener("submit",e=>{e.preventDefault();const task=tasks.find(t=>t.id===editingId);if(!task)return;const title=$("editTitle").value.trim();if(!title)return;Object.assign(task,{title,date:$("editDate").value,time:$("editTime").value,list:$("editList").value});closeEdit();persist();});
$("closeModal").addEventListener("click",closeEdit);$("editModal").addEventListener("click",e=>{if(e.target===$("editModal"))closeEdit();});document.addEventListener("keydown",e=>{if(e.key==="Escape")closeEdit();});
render();
