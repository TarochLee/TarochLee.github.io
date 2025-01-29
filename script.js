/****************************************
 * 全局变量
 ****************************************/
let currentUser = null;

// 页面加载时，检测是否已经登录
document.addEventListener("DOMContentLoaded", () => {
  const storedUser = localStorage.getItem("currentUser");
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    showMainPage(currentUser.role);
    updateNavUser();
  }
});

/****************************************
 * 注册 / 登录 流程
 ****************************************/
// 显示注册表单
function showRegister() {
  document.getElementById("registerForm").classList.remove("hidden");
  document.getElementById("loginForm").classList.add("hidden");
}

// 显示登录表单
function showLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("registerForm").classList.add("hidden");
}

// 注册用户
function registerUser() {
  const name = document.getElementById("regName").value.trim();
  const studentId = document.getElementById("regStudentId").value.trim();
  const major = document.getElementById("regMajor").value.trim();
  const className = document.getElementById("regClass").value.trim();
  const phone = document.getElementById("regPhone").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const role = document.getElementById("regRole").value;

  if (!name || !studentId || !major || !className || !phone || !password) {
    alert("请填写完整的注册信息。");
    return;
  }

  // 从 localStorage 获取已注册的用户列表
  let users = JSON.parse(localStorage.getItem("users")) || [];
  // 检查手机号码是否已经被注册
  const exist = users.find(u => u.phone === phone);
  if (exist) {
    alert("该手机号已被注册。");
    return;
  }

  // 创建新用户对象
  const newUser = { name, studentId, major, className, phone, password, role };
  // 添加到用户列表
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("注册成功！请登录。");
  showLogin();
}

// 用户登录
function loginUser() {
  const phone = document.getElementById("loginPhone").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];
  // 查找匹配用户
  const user = users.find(u => u.phone === phone && u.password === password);
  if (!user) {
    alert("手机号或密码错误！");
    return;
  }

  currentUser = user;
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  // 进入主页面
  showMainPage(currentUser.role);
  updateNavUser();
}

// 退出登录
function logout() {
  currentUser = null;
  localStorage.removeItem("currentUser");
  window.location.reload();
}

/****************************************
 * 主页面显示逻辑
 ****************************************/
function showMainPage(role) {
  // 隐藏登录/注册区
  document.getElementById("authSection").classList.add("hidden");

  if (role === "student") {
    document.getElementById("studentSection").classList.remove("hidden");
    document.getElementById("teacherSection").classList.add("hidden");
    loadStudentAssignments();
  } else {
    document.getElementById("teacherSection").classList.remove("hidden");
    document.getElementById("studentSection").classList.add("hidden");
  }
}

// 更新导航栏的用户信息
function updateNavUser() {
  document.getElementById("navUser").classList.remove("hidden");
  document.getElementById("navUserName").textContent = currentUser.name || "用户";
}

/****************************************
 * 设置(个人信息修改)
 ****************************************/
function openSettings() {
  // 填充原信息
  document.getElementById("setName").value = currentUser.name;
  document.getElementById("setStudentId").value = currentUser.studentId;
  document.getElementById("setMajor").value = currentUser.major;
  document.getElementById("setClass").value = currentUser.className;
  document.getElementById("setPhone").value = currentUser.phone;
  // 显示弹窗
  document.getElementById("settingsModal").classList.remove("hidden");
}

function closeSettings() {
  document.getElementById("settingsModal").classList.add("hidden");
}

function saveSettings() {
  const newName = document.getElementById("setName").value.trim();
  const newMajor = document.getElementById("setMajor").value.trim();
  const newClass = document.getElementById("setClass").value.trim();
  const newPassword = document.getElementById("setPassword").value.trim();

  if (!newName || !newMajor || !newClass) {
    alert("姓名/专业/班级不能为空。");
    return;
  }

  // 更新 currentUser
  currentUser.name = newName;
  currentUser.major = newMajor;
  currentUser.className = newClass;
  if (newPassword) {
    currentUser.password = newPassword;
  }

  // 更新所有用户数组
  let users = JSON.parse(localStorage.getItem("users")) || [];
  const idx = users.findIndex(u => u.phone === currentUser.phone);
  if (idx >= 0) {
    users[idx] = currentUser;
    localStorage.setItem("users", JSON.stringify(users));
  }

  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  alert("信息已更新！");
  closeSettings();
  updateNavUser();
}

/****************************************
 * 学生端：提交作业
 ****************************************/
function toggleAssignmentForm() {
  const form = document.getElementById("assignmentForm");
  form.classList.toggle("hidden");
}

// 提交作业
function submitAssignment() {
  const title = document.getElementById("assignTitle").value.trim();
  const desc = document.getElementById("assignDesc").value.trim();
  const fileInput = document.getElementById("assignFile");
  if (!title || !desc || !fileInput.files[0]) {
    alert("请填写完整的作业信息，并选择文件。");
    return;
  }

  // 读取文件名
  const fileName = fileInput.files[0].name;

  // 从 localStorage 获取 assignments
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];

  // 创建作业对象
  const newAssign = {
    title,
    desc,
    fileName,
    studentName: currentUser.name,
    studentId: currentUser.studentId,
    // 可以存储更多信息，如时间戳
    date: new Date().toLocaleString(),
    feedback: "", // 老师反馈
  };

  assignments.push(newAssign);
  localStorage.setItem("assignments", JSON.stringify(assignments));

  alert("作业提交成功！");
  // 清空表单
  document.getElementById("assignTitle").value = "";
  document.getElementById("assignDesc").value = "";
  document.getElementById("assignFile").value = "";
  toggleAssignmentForm();

  // 刷新学生端作业列表
  loadStudentAssignments();
}

// 查看已提交作业（学生端）
function loadStudentAssignments() {
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  assignments = assignments.filter(a => a.studentId === currentUser.studentId);

  const container = document.getElementById("studentAssignments");
  if (assignments.length === 0) {
    container.innerHTML = "<p class='text-gray-600'>尚未提交任何作业</p>";
    return;
  }

  let html = `<h3 class="text-lg font-semibold mb-2">已提交作业</h3>`;
  html += `<ul class="space-y-2">`;
  assignments.forEach((a, idx) => {
    html += `
      <li class="p-2 bg-gray-100 rounded">
        <strong>主题:</strong> ${a.title} <br/>
        <strong>文件:</strong> ${a.fileName} <br/>
        <strong>提交时间:</strong> ${a.date} <br/>
        <strong>反馈:</strong> ${a.feedback || "暂无"}
      </li>
    `;
  });
  html += `</ul>`;
  container.innerHTML = html;
}

// 示例：给老师发送消息（这里简单弹窗，真正逻辑可存到 localStorage 的 "messages" 数组）
function sendMessageToTeacher() {
  const msg = prompt("请输入要发送给老师的消息：");
  if (msg) {
    alert("消息已发送给老师：" + msg);
  }
}

/****************************************
 * 老师端：查看作业 & 下载 & 回复
 ****************************************/
function viewAllAssignments() {
  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  const container = document.getElementById("teacherAssignments");
  if (assignments.length === 0) {
    container.innerHTML = "<p class='text-gray-600'>尚无任何学生提交作业</p>";
    return;
  }

  let html = `<h3 class="text-lg font-semibold mb-2">学生提交的作业</h3>`;
  html += `<ul class="space-y-2">`;
  assignments.forEach((a, idx) => {
    html += `
      <li class="p-2 bg-gray-50 rounded border">
        <strong>学生姓名:</strong> ${a.studentName} (${a.studentId})<br/>
        <strong>主题:</strong> ${a.title}<br/>
        <strong>文件:</strong> ${a.fileName}<br/>
        <strong>提交时间:</strong> ${a.date}<br/>
        <strong>老师反馈:</strong> ${a.feedback || "暂无"}<br/>

        <!-- "下载" 仅作演示，实际上只能模拟 -->
        <button class="bg-blue-500 text-white px-3 py-1 rounded" onclick="downloadAssignment('${idx}')">下载</button>

        <!-- "回复作业" 或者 "批改作业" -->
        <button class="bg-green-500 text-white px-3 py-1 rounded ml-2" onclick="giveFeedback('${idx}')">反馈</button>
      </li>
    `;
  });
  html += `</ul>`;
  container.innerHTML = html;
}

function downloadAssignment(index) {
  // 实际上无法直接下载 localStorage 的文件，这里只是弹窗模拟
  alert("已下载作业：" + index);
}

function giveFeedback(index) {
  const feedback = prompt("请输入对该作业的反馈：");
  if (!feedback) return;

  let assignments = JSON.parse(localStorage.getItem("assignments")) || [];
  assignments[index].feedback = feedback;
  localStorage.setItem("assignments", JSON.stringify(assignments));

  alert("反馈已保存！");
  // 重新渲染
  viewAllAssignments();
}