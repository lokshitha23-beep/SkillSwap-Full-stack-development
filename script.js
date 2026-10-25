/* SkillSwap student project prototype
   Uses HTML, CSS and JavaScript concepts from the FSD lab manual.
   Data is stored in this browser only; this is NOT secure multi-user authentication.
*/
"use strict";

const STORAGE_KEY = "skillswap_demo_v2";
const PROFILE_KEY = "skillswap_demo_profile_v2";
const PRIVACY_KEY = "skillswap_demo_visibility_v2";
const PROFILE_DETAILS_KEY = "skillswap_demo_profile_details_v1";
const AUTH_ACCOUNTS_KEY = "skillswap_demo_email_accounts_v1";
const AUTH_SESSION_KEY = "skillswap_demo_email_session_v1";
const seedSkills = [
  {id:"seed1",name:"HTML & CSS Basics",category:"Programming",level:"Beginner",owner:"Aarav",description:"Learn semantic HTML, page structure, selectors, the box model and responsive layouts.",method:"Notes and resources",duration:"1–2 hours",prereq:"No prior experience needed",topics:"Semantic HTML, forms, CSS selectors, box model and responsive page layout.",symbol:"</>",color:"lavender"},
  {id:"seed2",name:"Python Fundamentals",category:"Programming",level:"Beginner",owner:"Meera",description:"Understand variables, conditions, loops, functions and small practice programs.",method:"Practice tasks",duration:"Several sessions",prereq:"Basic computer usage",topics:"Variables, conditions, loops, functions and beginner-friendly practice problems.",symbol:"Py",color:"peach"},
  {id:"seed3",name:"UI Design Principles",category:"Design",level:"Intermediate",owner:"Ishaan",description:"Explore visual hierarchy, spacing, typography and simple wireframes.",method:"Online session (arranged safely)",duration:"1–2 hours",prereq:"Interest in design",topics:"Visual hierarchy, spacing, typography, colour and low-fidelity wireframes.",symbol:"✧",color:"mint"},
  {id:"seed4",name:"Power BI Introduction",category:"Data & Analytics",level:"Beginner",owner:"Diya",description:"Learn what dashboards are and how to prepare simple charts from sample data.",method:"Notes and resources",duration:"Several sessions",prereq:"Basic spreadsheet knowledge helps",topics:"Importing sample data, simple charts, filters and dashboard layout.",symbol:"▥",color:"blue"},
  {id:"seed5",name:"Public Speaking",category:"Communication",level:"Intermediate",owner:"Kabir",description:"Practise structuring a short talk, speaking clearly and handling questions.",method:"Practice tasks",duration:"30 minutes",prereq:"Willingness to practise",topics:"Speech structure, voice clarity, confidence and question handling.",symbol:"◉",color:"peach"},
  {id:"seed6",name:"Study Planning",category:"Productivity",level:"Beginner",owner:"Ananya",description:"Build a realistic weekly plan, set goals and review your progress.",method:"Text explanation",duration:"30 minutes",prereq:"Bring one learning goal",topics:"Goal setting, weekly planning, prioritisation and progress review.",symbol:"✓",color:"lavender"},
  {id:"seed7",name:"Canva Basics",category:"Design",level:"Beginner",owner:"Student",description:"Explain simple poster design, layouts, colour combinations and presentation slides.",method:"Practice tasks",duration:"1–2 hours",prereq:"No prior experience needed",topics:"Poster layouts, colour combinations, slide design and exporting a project.",symbol:"✧",color:"mint"}
];

let state = loadState();
let accounts = loadAccounts();
let activeEmail = localStorage.getItem(AUTH_SESSION_KEY) || "";
let activeAccount = activeEmail && accounts[activeEmail] ? accounts[activeEmail] : null;
let currentProfile = activeAccount?.displayName || "Student";
let profileDetails = activeAccount?.profileDetails || loadProfileDetails();
let pendingEmail = "";
function loadAccounts() {
  try {
    const saved = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || "{}");
    return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  } catch (error) { return {}; }
}
function saveAccounts() {
  try { localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts)); return true; }
  catch (error) { showToast("Could not save account in this browser."); return false; }
}
function loadProfileDetails() {
  const defaults = {department:"", year:"", interests:"", bio:""};
  try { return {...defaults, ...(JSON.parse(localStorage.getItem(PROFILE_DETAILS_KEY)) || {})}; }
  catch (error) { return defaults; }
}
let toastTimer;

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Array.isArray(saved.skills) && Array.isArray(saved.requests)) return saved;
  } catch (error) { console.warn("Could not read demo data", error); }
  return {skills: structuredCloneSafe(seedSkills), saved:[], requests:[{id:"demo-incoming-1",skillId:"seed7",requester:"Nisha",goal:"I want to learn how to make a clean event poster.",preferred:"Weekend afternoon",status:"Pending",createdAt:new Date().toISOString()}], reports:[], blocked:[]};
}
function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value)); }
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { showToast("Browser storage is unavailable. Changes may not persist."); }
}
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function getVisibleSkills() {
  const showOwnProfile = activeAccount ? activeAccount.visible !== false : true;
  return state.skills.filter(skill => !state.blocked.includes(skill.owner) && (skill.owner !== currentProfile || showOwnProfile));
}
function getSkill(id) { return state.skills.find(skill => skill.id === id); }
function getPublicProfile(displayName) {
  const account = Object.values(accounts).find(item => item && item.displayName === displayName && item.visible !== false);
  if (!account) return null;
  return account.profileDetails || null;
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message; toast.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}
function setView(name) {
  document.querySelectorAll(".view").forEach(view => view.classList.remove("active-view"));
  const target = document.getElementById(`view-${name}`);
  if (target) target.classList.add("active-view");
  document.querySelectorAll("[data-view]").forEach(button => {
    if (button.classList.contains("nav-link")) button.classList.toggle("active", button.dataset.view === name);
  });
  document.getElementById("mainNav").classList.remove("open");
  document.getElementById("mobileMenuBtn").setAttribute("aria-expanded", "false");
  if (name === "dashboard") renderDashboard();
  if (name === "explore") renderExplore();
  window.scrollTo({top:0,behavior:"smooth"});
}
function skillCard(skill) {
  const saved = state.saved.includes(skill.id);
  const own = skill.owner === currentProfile;
  const symbol = escapeHTML(skill.symbol || skill.name.slice(0,2).toUpperCase());
  const publicProfile = getPublicProfile(skill.owner);
  const profileLine = publicProfile ? [publicProfile.department, publicProfile.year].filter(Boolean).join(" · ") : "";
  const profileSummary = publicProfile ? [profileLine, publicProfile.interests ? `Interests: ${publicProfile.interests}` : "", publicProfile.bio || ""].filter(Boolean).map(escapeHTML).join(" · ") : "";
  return `<article class="skill-card">
    <div class="skill-card-top"><div class="skill-symbol ${escapeHTML(skill.color || "lavender")}">${symbol}</div>
      <button class="save-btn ${saved ? "saved" : ""}" data-action="save" data-id="${escapeHTML(skill.id)}" aria-label="${saved ? "Unsave" : "Save"} ${escapeHTML(skill.name)}" title="${saved ? "Unsave skill" : "Save skill"}">${saved ? "♥" : "♡"}</button></div>
    <h3>${escapeHTML(skill.name)}</h3><p class="skill-byline">Shared by <strong>${escapeHTML(skill.owner)}</strong></p>
    ${profileSummary ? `<p class="public-profile-summary">${profileSummary}</p>` : ""}
    <p class="skill-description">${escapeHTML(skill.description)}</p>
    <div class="tag-row"><span class="tag">${escapeHTML(skill.category)}</span><span class="tag level">${escapeHTML(skill.level)}</span></div>
    <div class="skill-card-footer"><span class="skill-method">${escapeHTML(skill.method)}</span>
      ${own ? `<button class="btn btn-secondary" data-action="delete-skill" data-id="${escapeHTML(skill.id)}">Remove</button>` : `<button class="btn btn-primary" data-action="request" data-id="${escapeHTML(skill.id)}">Request to learn →</button>`}
    </div>
    ${own ? "" : `<div class="skill-safety-actions"><button data-action="report" data-target="${escapeHTML(skill.owner)}">Report profile</button><button data-action="block" data-target="${escapeHTML(skill.owner)}">Block profile</button></div>`}
    </article>`;
}
function renderHome() {
  const container = document.getElementById("homeSkills");
  container.innerHTML = getVisibleSkills().slice(0,3).map(skillCard).join("");
}
function renderExplore() {
  const query = document.getElementById("searchInput").value.trim().toLowerCase();
  const category = document.getElementById("categoryFilter").value;
  const level = document.getElementById("levelFilter").value;
  const skills = getVisibleSkills().filter(skill => {
    const haystack = `${skill.name} ${skill.description} ${skill.topics} ${skill.owner} ${skill.category}`.toLowerCase();
    return haystack.includes(query) && (category === "all" || skill.category === category) && (level === "all" || skill.level === level);
  });
  document.getElementById("exploreSkills").innerHTML = skills.map(skillCard).join("");
  document.getElementById("resultCount").textContent = `Showing ${skills.length} skill${skills.length === 1 ? "" : "s"}`;
  document.getElementById("emptySkills").classList.toggle("hidden", skills.length > 0);
}
function emptyMessage(text) { return `<p class="empty-mini">${escapeHTML(text)}</p>`; }
function renderDashboard() {
  document.getElementById("welcomeName").textContent = `Welcome, ${currentProfile}!`;
  document.getElementById("dashboardAvatar").textContent = currentProfile.slice(0,1).toUpperCase();
  const mine = state.skills.filter(skill => skill.owner === currentProfile);
  const sent = state.requests.filter(request => request.requester === currentProfile);
  const incoming = state.requests.filter(request => {
    const skill = getSkill(request.skillId); return skill && skill.owner === currentProfile;
  });
  const plans = state.requests.filter(request => request.requester === currentProfile && request.status === "Accepted");
  document.getElementById("statSkills").textContent = mine.length;
  document.getElementById("statSent").textContent = sent.length;
  document.getElementById("statIncoming").textContent = incoming.filter(request => request.status === "Pending").length;
  document.getElementById("statPlans").textContent = plans.length;
  document.getElementById("profileVisible").checked = activeAccount ? activeAccount.visible !== false : true;
  populateProfileForm();

  document.getElementById("mySkillsList").innerHTML = mine.length ? mine.map(skill => `<div class="compact-item"><span class="compact-symbol">${escapeHTML(skill.symbol || "✦")}</span><div class="compact-main"><strong>${escapeHTML(skill.name)}</strong><small>${escapeHTML(skill.category)} · ${escapeHTML(skill.level)}</small></div><button class="mini-btn danger" data-action="delete-skill" data-id="${escapeHTML(skill.id)}">Remove</button></div>`).join("") : emptyMessage("You have not shared a skill yet.");
  document.getElementById("incomingRequests").innerHTML = incoming.length ? incoming.map(request => {
    const skill = getSkill(request.skillId);
    return `<div class="compact-item"><span class="compact-symbol">✉</span><div class="compact-main"><strong>${escapeHTML(request.requester)} wants to learn ${escapeHTML(skill?.name || "a skill")}</strong><small>${escapeHTML(request.goal || "No learning goal added")}</small><small>${escapeHTML(request.preferred || "Flexible timing")}</small></div><div class="compact-actions">${request.status === "Pending" ? `<button class="mini-btn accept" data-action="accept" data-id="${escapeHTML(request.id)}">Accept</button><button class="mini-btn" data-action="reject" data-id="${escapeHTML(request.id)}">Decline</button>` : `<span class="status ${request.status.toLowerCase()}">${escapeHTML(request.status)}</span>`}<button class="mini-btn danger" data-action="report" data-target="${escapeHTML(request.requester)}">Report</button></div></div>`;
  }).join("") : emptyMessage("No incoming requests yet.");
  document.getElementById("sentRequests").innerHTML = sent.length ? sent.map(request => {
    const skill = getSkill(request.skillId);
    return `<div class="compact-item"><span class="compact-symbol">↗</span><div class="compact-main"><strong>${escapeHTML(skill?.name || "Skill unavailable")}</strong><small>Provider: ${escapeHTML(skill?.owner || "Unknown")} · ${escapeHTML(request.goal || "Learning request")}</small></div><div class="compact-actions"><span class="status ${request.status.toLowerCase()}">${escapeHTML(request.status)}</span>${request.status === "Pending" ? `<button class="mini-btn" data-action="cancel-request" data-id="${escapeHTML(request.id)}">Cancel</button>` : ""}</div></div>`;
  }).join("") : emptyMessage("You have not sent any requests.");
  const savedSkills = state.saved.map(getSkill).filter(Boolean);
  document.getElementById("savedSkillsList").innerHTML = savedSkills.length ? savedSkills.map(skill => `<div class="compact-item"><span class="compact-symbol">${escapeHTML(skill.symbol || "♡")}</span><div class="compact-main"><strong>${escapeHTML(skill.name)}</strong><small>Shared by ${escapeHTML(skill.owner)}</small></div><button class="mini-btn" data-action="save" data-id="${escapeHTML(skill.id)}">Unsave</button></div>`).join("") : emptyMessage("Saved skills will appear here.");
  renderRecommendations();
  renderLearningPlan();
}
function renderRecommendations() {
  const container = document.getElementById("recommendedSkills");
  if (!container) return;
  const ownInterests = String(profileDetails?.interests || "").toLowerCase().split(/[,;]+/).map(item => item.trim()).filter(Boolean);
  const candidates = getVisibleSkills().filter(skill => skill.owner !== currentProfile);
  const ranked = candidates.map(skill => {
    const haystack = `${skill.name} ${skill.category} ${skill.description} ${skill.topics}`.toLowerCase();
    const score = ownInterests.reduce((total, interest) => {
      const words = interest.split(/\s+/).filter(word => word.length > 2);
      return total + (haystack.includes(interest) ? 3 : 0) + words.filter(word => haystack.includes(word)).length;
    }, 0);
    return {skill, score};
  }).sort((a, b) => b.score - a.score).slice(0, 3);
  if (!ranked.length) {
    container.innerHTML = emptyMessage("No skills to recommend yet. Add a skill or check back later.");
    return;
  }
  container.innerHTML = ranked.map(({skill, score}) => `<div class="recommendation-item"><span class="compact-symbol">${escapeHTML(skill.symbol || "✦")}</span><div class="recommendation-copy"><strong>${escapeHTML(skill.name)}</strong><small>${escapeHTML(skill.category)} · ${escapeHTML(skill.level)} · Shared by ${escapeHTML(skill.owner)}${ownInterests.length && score > 0 ? " · Matches your interests" : ""}</small></div><button class="mini-btn" data-action="request" data-id="${escapeHTML(skill.id)}">Learn</button></div>`).join("");
}
function renderLearningPlan() {
  const list = document.getElementById("learningTasksList");
  if (!list) return;
  if (!activeAccount) { list.innerHTML = emptyMessage("Sign in to create a personal learning plan."); return; }
  if (!Array.isArray(activeAccount.learningTasks)) activeAccount.learningTasks = [];
  const tasks = activeAccount.learningTasks;
  const done = tasks.filter(task => task.done).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  document.getElementById("learningProgressText").textContent = `${done} of ${tasks.length} tasks complete`;
  document.getElementById("learningProgressPercent").textContent = `${percent}%`;
  document.getElementById("learningProgressBar").style.width = `${percent}%`;
  list.innerHTML = tasks.length ? tasks.map(task => `<div class="learning-task-item ${task.done ? "done" : ""}"><input type="checkbox" aria-label="Mark ${escapeHTML(task.title)} complete" data-action="toggle-task" data-id="${escapeHTML(task.id)}" ${task.done ? "checked" : ""}><div class="learning-task-copy"><strong>${escapeHTML(task.title)}</strong><small>${task.due ? `Target: ${escapeHTML(task.due)} · ` : ""}${escapeHTML(task.priority || "Normal")} priority</small></div><button class="mini-btn danger" data-action="delete-task" data-id="${escapeHTML(task.id)}" aria-label="Delete task">Delete</button></div>`).join("") : emptyMessage("No tasks yet. Add one small goal to get started.");
}
function addLearningTask(event) {
  event.preventDefault();
  if (!activeAccount) return;
  const title = document.getElementById("learningTaskInput").value.trim();
  if (title.length < 3) { showToast("Please enter a clear learning task."); return; }
  if (/(https?:\/\/|www\.|\b\S+@\S+\.\S+\b|\b\+?\d[\d\s()-]{8,}\d\b)/i.test(title)) {
    showToast("Please do not add contact details or links to learning tasks."); return;
  }
  if (!Array.isArray(activeAccount.learningTasks)) activeAccount.learningTasks = [];
  activeAccount.learningTasks.unshift({id:`task_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,title,due:document.getElementById("learningTaskDue").value,priority:document.getElementById("learningTaskPriority").value,done:false});
  accounts[activeEmail] = activeAccount;
  if (saveAccounts()) {
    document.getElementById("learningTaskForm").reset();
    renderLearningPlan();
    showToast("Learning task added to your plan.");
  }
}
function toggleLearningTask(id, done) {
  if (!activeAccount || !Array.isArray(activeAccount.learningTasks)) return;
  const task = activeAccount.learningTasks.find(item => item.id === id);
  if (!task) return;
  task.done = done;
  accounts[activeEmail] = activeAccount;
  saveAccounts();
  renderLearningPlan();
}
function deleteLearningTask(id) {
  if (!activeAccount || !Array.isArray(activeAccount.learningTasks)) return;
  activeAccount.learningTasks = activeAccount.learningTasks.filter(item => item.id !== id);
  accounts[activeEmail] = activeAccount;
  saveAccounts();
  renderLearningPlan();
  showToast("Learning task deleted.");
}
function openModal() {
  document.getElementById("skillForm").reset();
  document.getElementById("modalBackdrop").classList.remove("hidden");
  document.getElementById("skillName").focus();
}
function closeModal() { document.getElementById("modalBackdrop").classList.add("hidden"); }
function addSkill(event) {
  event.preventDefault();
  const name = document.getElementById("skillName").value.trim();
  const topics = document.getElementById("skillTopics").value.trim();
  if (name.length < 3 || topics.length < 10) { showToast("Please add a skill name and a useful topic explanation."); return; }
  const combined = `${name} ${topics} ${document.getElementById("skillPrereq").value}`;
  if (/\b\d{10}\b|@|https?:\/\/|www\.|(?:street|road|apartment|flat no)\b/i.test(combined)) {
    showToast("Please remove contact details, links or address-like information from the skill description."); return;
  }
  const colors = ["lavender","peach","mint","blue"];
  const symbols = {"Programming":"</>","Design":"✧","Data & Analytics":"▥","Communication":"◉","Productivity":"✓"};
  state.skills.unshift({
    id:`skill_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,
    name, category:document.getElementById("skillCategory").value, level:document.getElementById("skillLevel").value,
    owner:currentProfile, description:topics, topics, method:document.getElementById("skillMethod").value,
    duration:document.getElementById("skillDuration").value, prereq:document.getElementById("skillPrereq").value.trim(),
    symbol:symbols[document.getElementById("skillCategory").value] || "✦", color:colors[state.skills.length % colors.length]
  });
  saveState(); closeModal(); renderAll(); setView("dashboard"); showToast("Skill added to your local demo profile.");
}
function requestSkill(id) {
  const skill = getSkill(id);
  if (!skill || skill.owner === currentProfile) return;
  const existing = state.requests.find(request => request.skillId === id && request.requester === currentProfile && request.status !== "Cancelled");
  if (existing) { showToast("You already have a request for this skill."); return; }
  const goal = prompt(`What would you like to learn from "${skill.name}"? Keep it short and do not include personal contact details.`);
  if (goal === null) return;
  const cleanGoal = goal.trim();
  if (cleanGoal.length < 8) { showToast("Please add a short learning goal (at least 8 characters)."); return; }
  if (/\b\d{10}\b|@|https?:\/\/|www\.|(?:address|home location|phone number)\b/i.test(cleanGoal)) { showToast("Please do not include personal contact details in the request."); return; }
  const preferred = prompt("Preferred learning time? (e.g. Weekend afternoon or Flexible)", "Flexible");
  if (preferred === null) return;
  state.requests.unshift({id:`req_${Date.now()}`,skillId:id,requester:currentProfile,goal:cleanGoal,preferred:preferred.trim().slice(0,80) || "Flexible",status:"Pending",createdAt:new Date().toISOString()});
  saveState(); renderAll(); showToast("Learning request sent in this browser demo.");
}
function toggleSave(id) {
  if (!getSkill(id)) return;
  if (state.saved.includes(id)) { state.saved = state.saved.filter(savedId => savedId !== id); showToast("Skill removed from saved list."); }
  else { state.saved.push(id); showToast("Skill saved."); }
  saveState(); renderAll();
}
function deleteSkill(id) {
  const skill = getSkill(id);
  if (!skill || skill.owner !== currentProfile) return;
  if (!confirm(`Remove "${skill.name}" from your demo skills? Related requests will also be removed.`)) return;
  state.skills = state.skills.filter(item => item.id !== id);
  state.saved = state.saved.filter(savedId => savedId !== id);
  state.requests = state.requests.filter(request => request.skillId !== id);
  saveState(); renderAll(); showToast("Skill removed.");
}
function updateRequest(id, status) {
  const request = state.requests.find(item => item.id === id);
  if (!request) return;
  const skill = getSkill(request.skillId);
  if (!skill || skill.owner !== currentProfile) return;
  request.status = status; saveState(); renderAll();
  showToast(status === "Accepted" ? "Request accepted. Agree on safe learning boundaries." : "Request declined.");
}
function cancelRequest(id) {
  const request = state.requests.find(item => item.id === id && item.requester === currentProfile);
  if (!request) return;
  request.status = "Cancelled"; saveState(); renderAll(); showToast("Request cancelled.");
}
function reportUser(target) {
  const name = String(target || "").trim();
  if (!name) return;
  document.getElementById("reportTarget").value = name;
  setView("safety");
  document.getElementById("reportTarget").focus();
  showToast("Choose a reason and submit the demo report.");
}
function blockUser(target) {
  if (!target || target === currentProfile) return;
  if (!confirm(`Block "${target}" in this browser demo? Their skill cards will be hidden here.`)) return;
  if (!state.blocked.includes(target)) state.blocked.push(target);
  saveState(); renderAll(); showToast("Profile hidden in this local demo.");
}
function renderAll() { renderHome(); renderExplore(); renderDashboard(); }
function populateProfileForm() {
  const nameField = document.getElementById("profileName");
  if (!nameField) return;
  nameField.value = currentProfile;
  document.getElementById("profileDepartment").value = profileDetails.department || "";
  document.getElementById("profileYear").value = profileDetails.year || "";
  document.getElementById("profileInterests").value = profileDetails.interests || "";
  document.getElementById("profileBio").value = profileDetails.bio || "";
}
function setProfile() {
  setView("dashboard");
  document.getElementById("profileEditorPanel").scrollIntoView({behavior:"smooth", block:"start"});
  document.getElementById("profileName").focus({preventScroll:true});
}
function safeProfileText(value, maxLength) {
  const clean = String(value || "").trim();
  if (clean.length > maxLength) return null;
  if (/(https?:\/\/|www\.|\b\S+@\S+\.\S+\b|\b\+?\d[\d\s()-]{8,}\d\b)/i.test(clean)) return null;
  return clean;
}
document.getElementById("profileForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("profileName").value.trim();
  if (name.length < 2 || name.length > 24 || /[@\d]|https?:\/\//i.test(name)) {
    showToast("Use a display name of 2–24 letters, without contact details."); return;
  }
  const department = safeProfileText(document.getElementById("profileDepartment").value, 60);
  const interests = safeProfileText(document.getElementById("profileInterests").value, 120);
  const bio = safeProfileText(document.getElementById("profileBio").value, 240);
  if (department === null || interests === null || bio === null) {
    showToast("Please remove phone numbers, email addresses or links from profile details."); return;
  }
  const previousName = currentProfile;
  currentProfile = name;
  profileDetails = {department, year:document.getElementById("profileYear").value, interests, bio};
  if (previousName !== currentProfile) {
    state.skills.forEach(skill => { if (skill.owner === previousName) skill.owner = currentProfile; });
    state.requests.forEach(request => { if (request.requester === previousName) request.requester = currentProfile; });
  }
  localStorage.setItem(PROFILE_KEY, currentProfile);
  try { localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(profileDetails)); }
  catch (error) { showToast("Could not save profile details in browser storage."); return; }
  if (activeEmail && activeAccount) {
    activeAccount.displayName = currentProfile;
    activeAccount.profileDetails = {...profileDetails};
    accounts[activeEmail] = activeAccount;
    if (!saveAccounts()) return;
  }
  saveState(); renderAll();
  document.getElementById("profileFeedback").textContent = "Profile changes saved in this browser.";
  showToast("Profile updated successfully.");
});
document.getElementById("resetProfileForm").addEventListener("click", () => {
  populateProfileForm();
  document.getElementById("profileFeedback").textContent = "Unsaved edits cleared.";
});

document.addEventListener("click", event => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { event.preventDefault(); setView(viewButton.dataset.view); return; }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const {action,id,target} = actionButton.dataset;
  if (action === "add-skill") openModal();
  if (action === "save") toggleSave(id);
  if (action === "request") requestSkill(id);
  if (action === "delete-skill") deleteSkill(id);
  if (action === "accept") updateRequest(id,"Accepted");
  if (action === "reject") updateRequest(id,"Rejected");
  if (action === "cancel-request") cancelRequest(id);
  if (action === "report") reportUser(target);
  if (action === "block") blockUser(target);
  if (action === "delete-task") deleteLearningTask(id);
  if (action === "toggle-task") toggleLearningTask(id, actionButton.checked);
});
document.getElementById("skillForm").addEventListener("submit", addSkill);
document.getElementById("learningTaskForm").addEventListener("submit", addLearningTask);
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelModal").addEventListener("click", closeModal);
document.getElementById("modalBackdrop").addEventListener("click", event => { if (event.target.id === "modalBackdrop") closeModal(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });
document.getElementById("searchInput").addEventListener("input", renderExplore);
document.getElementById("categoryFilter").addEventListener("change", renderExplore);
document.getElementById("levelFilter").addEventListener("change", renderExplore);
document.getElementById("profileButton").addEventListener("click", setProfile);
document.getElementById("mobileMenuBtn").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const open = nav.classList.toggle("open");
  document.getElementById("mobileMenuBtn").setAttribute("aria-expanded", String(open));
});
document.getElementById("profileVisible").addEventListener("change", event => {
  if (activeAccount && activeEmail) {
    activeAccount.visible = event.target.checked;
    accounts[activeEmail] = activeAccount;
    saveAccounts();
  }
  renderAll();
  showToast(event.target.checked ? "Your demo skill listings are visible." : "Your demo skill listings are hidden.");
});
document.getElementById("reportForm").addEventListener("submit", event => {
  event.preventDefault();
  const target = document.getElementById("reportTarget").value.trim();
  const reason = document.getElementById("reportReason").value;
  const details = document.getElementById("reportDetails").value.trim();
  if (!target || !reason) return;
  state.reports.push({id:`report_${Date.now()}`,target,reason,details,createdAt:new Date().toISOString()});
  saveState();
  document.getElementById("reportFeedback").textContent = "Demo report saved in this browser only. No moderator is notified.";
  event.target.reset();
  showToast("Demo report saved locally.");
});


function showAuthScreen() {
  document.getElementById("authScreen").classList.remove("hidden");
  document.getElementById("emailLoginForm").classList.remove("hidden");
  document.getElementById("firstProfileForm").classList.add("hidden");
  document.getElementById("authError").textContent = "";
  document.getElementById("loginEmail").value = "";
  document.getElementById("loginEmail").focus();
}
function enterAccount(email, account) {
  activeEmail = email;
  activeAccount = account;
  if (!Array.isArray(activeAccount.learningTasks)) activeAccount.learningTasks = [];
  currentProfile = account.displayName;
  profileDetails = {...{department:"", year:"", interests:"", bio:""}, ...(account.profileDetails || {})};
  localStorage.setItem(AUTH_SESSION_KEY, email);
  localStorage.setItem(PROFILE_KEY, currentProfile);
  localStorage.setItem(PROFILE_DETAILS_KEY, JSON.stringify(profileDetails));
  document.getElementById("authScreen").classList.add("hidden");
  document.getElementById("authError").textContent = "";
  renderAll();
  showToast(`Welcome to SkillSwap, ${currentProfile}!`);
}
document.getElementById("emailLoginForm").addEventListener("submit", event => {
  event.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const error = document.getElementById("authError");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
    error.textContent = "Enter a valid email address to continue."; return;
  }
  pendingEmail = email;
  if (accounts[email]) {
    enterAccount(email, accounts[email]);
    return;
  }
  document.getElementById("emailLoginForm").classList.add("hidden");
  document.getElementById("firstProfileForm").classList.remove("hidden");
  document.getElementById("privateEmailPreview").textContent = email;
  document.getElementById("authStepLabel").textContent = "FIRST TIME HERE? SET UP YOUR PROFILE";
  document.getElementById("authTitle").textContent = "Create your student profile";
  document.getElementById("authIntro").textContent = "Choose what other students can see. Your email is only for this demo sign-in; it is not part of your public profile.";
  error.textContent = "";
  document.getElementById("firstName").focus();
});
document.getElementById("firstProfileForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("firstName").value.trim();
  if (name.length < 2 || name.length > 24 || /[@\d]|https?:\/\//i.test(name)) {
    document.getElementById("authError").textContent = "Use a display name with 2–24 characters, without contact details."; return;
  }
  const department = safeProfileText(document.getElementById("firstDepartment").value, 60);
  const interests = safeProfileText(document.getElementById("firstInterests").value, 120);
  const bio = safeProfileText(document.getElementById("firstBio").value, 240);
  if (department === null || interests === null || bio === null) {
    document.getElementById("authError").textContent = "Remove phone numbers, email addresses or links from public profile details."; return;
  }
  const account = {
    displayName:name,
    profileDetails:{department, year:document.getElementById("firstYear").value, interests, bio},
    visible:true,
    learningTasks:[],
    createdAt:new Date().toISOString()
  };
  accounts[pendingEmail] = account;
  if (!saveAccounts()) { delete accounts[pendingEmail]; return; }
  enterAccount(pendingEmail, account);
});
document.getElementById("backToEmail").addEventListener("click", () => {
  document.getElementById("firstProfileForm").classList.add("hidden");
  document.getElementById("emailLoginForm").classList.remove("hidden");
  document.getElementById("authStepLabel").textContent = "WELCOME TO YOUR LEARNING SPACE";
  document.getElementById("authTitle").textContent = "Sign in with your email";
  document.getElementById("authIntro").textContent = "Use your email to continue. Your email is used for this local demo sign-in and is never displayed on your public profile.";
  document.getElementById("authError").textContent = "";
  document.getElementById("loginEmail").focus();
});
document.getElementById("logoutButton").addEventListener("click", () => {
  if (!confirm("Switch account? Your saved demo data will remain in this browser.")) return;
  localStorage.removeItem(AUTH_SESSION_KEY);
  activeEmail = ""; activeAccount = null; pendingEmail = "";
  showAuthScreen();
});

renderAll();
if (!activeEmail || !activeAccount) {
  localStorage.removeItem(AUTH_SESSION_KEY);
  showAuthScreen();
} else {
  document.getElementById("authScreen").classList.add("hidden");
}
