// script.js
// 取得元素
const activityListEl = document.getElementById('activityList');
const activitySelect = document.getElementById('activitySelect');
const addSampleBtn = document.getElementById('addSampleBtn');
const signupForm = document.getElementById('signupForm');
const preview = document.getElementById('preview');
const submitBtn = document.getElementById('submitBtn');
const exportBtn = document.getElementById('exportBtn');

let activities = [
  { id: 'a1', title: '英語角活動', date: '2025-11-20', capacity: 30 },
  { id: 'a2', title: '程式設計入門工作坊', date: '2025-11-25', capacity: 40 }
];

let records = JSON.parse(localStorage.getItem('signupRecords') || '[]');

function renderActivities(){
  activityListEl.innerHTML = '';
  activitySelect.innerHTML = '<option value="">請選擇活動</option>';
  activities.forEach(act => {
    // 卡片
    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    const card = document.createElement('article');
    card.className = 'card activity-card h-100';
    card.innerHTML = `
      <div class="card-body d-flex flex-column">
        <h3 class="h6 card-title">${act.title}</h3>
        <p class="card-text mb-2">日期：${act.date}</p>
        <p class="card-text small text-muted">名額：${act.capacity}</p>
        <div class="mt-auto">
          <button class="btn btn-sm btn-outline-primary w-100 joinBtn" data-id="${act.id}">我要報名</button>
        </div>
      </div>
    `;
    col.appendChild(card);
    activityListEl.appendChild(col);

    // select option
    const opt = document.createElement('option');
    opt.value = act.id;
    opt.textContent = `${act.title}（${act.date}）`;
    activitySelect.appendChild(opt);
  });

  // 綁定動態按鈕監聽
  document.querySelectorAll('.joinBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      activitySelect.value = id;
      // 平滑滾動到表單
      document.getElementById('signupForm').scrollIntoView({behavior: 'smooth'});
      activitySelect.focus();
    });
  });
}

function updatePreview(){
  if(records.length === 0){
    preview.textContent = '尚未有報名。';
    return;
  }
  preview.innerHTML = '';
  const ul = document.createElement('ul');
  ul.className = 'list-group';
  records.slice().reverse().forEach(r=>{
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.textContent = `${r.name} 報名 ${r.activityTitle}（${r.people} 人）`;
    ul.appendChild(li);
  });
  preview.appendChild(ul);

  // 統計：報名總人數
  const total = records.reduce((s, r)=> s + Number(r.people), 0);
  const stat = document.createElement('div');
  stat.className = 'mt-2 small text-muted';
  stat.textContent = `總報名人數：${total}`;
  preview.appendChild(stat);
}

function getActivityById(id){
  return activities.find(a=>a.id === id);
}

// 表單驗證（使用 Constraint Validation API + 自訂提示）
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // 標準 HTML 驗證
  if(!signupForm.checkValidity()){
    signupForm.classList.add('was-validated');
    return;
  }

  // 防止重複送出（按鈕禁用）
  submitBtn.disabled = true;
  submitBtn.textContent = '送出中...';

  const formData = new FormData(signupForm);
  const data = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    activityId: formData.get('activity'),
    activityTitle: getActivityById(formData.get('activity'))?.title || '未知活動',
    people: Number(formData.get('people')),
    notes: formData.get('notes') || '',
    timestamp: new Date().toISOString()
  };

  // 儲存到 records（localStorage）
  records.push(data);
  localStorage.setItem('signupRecords', JSON.stringify(records));

  // 顯示成功訊息（簡單動態）
  const alert = document.createElement('div');
  alert.className = 'alert alert-success mt-3';
  alert.textContent = `感謝 ${data.name}，報名已送出！`;
  signupForm.after(alert);

  // 重新啟用按鈕並重置表單（模擬非同步）
  setTimeout(()=>{
    submitBtn.disabled = false;
    submitBtn.textContent = '送出報名';
    signupForm.reset();
    signupForm.classList.remove('was-validated');
    updatePreview();
    // 自動移除提示
    alert.remove();
  }, 800);
});

// 匯出 JSON
exportBtn.addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(records, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'signup_records.json';
  a.click();
  URL.revokeObjectURL(url);
});

// 新增範例活動
addSampleBtn.addEventListener('click', () => {
  const id = 'a' + (activities.length + 1);
  activities.push({ id, title: `新活動 ${activities.length + 1}`, date: '2025-12-01', capacity: 20 });
  renderActivities();
});

// 初始化
renderActivities();
updatePreview();

// optional: dark mode toggle (示意，可擴充)
document.addEventListener('keydown', (e)=>{
  if(e.key === 'd' && e.ctrlKey){
    document.documentElement.classList.toggle('dark');
  }
});
