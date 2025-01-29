document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("user")) {
        const user = JSON.parse(localStorage.getItem("user"));
        showPanel(user.role);
    }
});

function register() {
    const username = document.getElementById("username").value;
    const role = document.getElementById("role").value;

    if (!username) {
        alert("请输入姓名");
        return;
    }

    const user = { username, role };
    localStorage.setItem("user", JSON.stringify(user));

    showPanel(role);
}

function showPanel(role) {
    document.getElementById("auth").classList.add("hidden");
    
    if (role === "student") {
        document.getElementById("studentPanel").classList.remove("hidden");
    } else {
        document.getElementById("teacherPanel").classList.remove("hidden");
    }
}

function logout() {
    localStorage.removeItem("user");
    location.reload();
}

function showSubmitPanel() {
    document.getElementById("submitPanel").classList.toggle("hidden");
}

function submitAssignment() {
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const file = document.getElementById("fileUpload").files[0];

    if (!title || !description || !file) {
        alert("请填写完整信息");
        return;
    }

    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    assignments.push({ title, description, fileName: file.name });
    localStorage.setItem("assignments", JSON.stringify(assignments));

    alert("作业提交成功！");
    document.getElementById("submitPanel").classList.add("hidden");
}

function viewAssignments() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    let html = "<h3>已提交作业</h3>";

    assignments.forEach((a, index) => {
        html += `<p>${index + 1}. ${a.title} - ${a.fileName}</p>`;
    });

    document.getElementById("assignmentsList").innerHTML = html;
}

function viewAllAssignments() {
    const assignments = JSON.parse(localStorage.getItem("assignments")) || [];
    let html = "<h3>收到的作业</h3>";

    assignments.forEach((a, index) => {
        html += `<p>${index + 1}. ${a.title} - ${a.fileName}</p>`;
    });

    document.getElementById("teacherAssignmentsList").innerHTML = html;
}