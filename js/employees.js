document.addEventListener("DOMContentLoaded", () => {
  loadDirectory();

  // Add Member Form Submit
  document.getElementById("add-user-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const users = Storage.getUsers();
    users.push({
      id: Date.now(),
      name: String(document.getElementById("user-name").value),
      email: document.getElementById("user-email").value,
      pass: document.getElementById("user-pass").value,
      role: document.getElementById("user-role").value,
      dept: document.getElementById("user-dept").value,
      salary: Number(document.getElementById("user-salary").value),
    });
    Storage.setUsers(users);
    alert("Member added successfully!");
    loadDirectory();
    e.target.reset();
  });

  // Live Search Filter
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      loadDirectory(e.target.value);
    });
  }

  // Edit Member Form Submit
  document.getElementById("edit-user-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = Number(document.getElementById("edit-user-id").value);
    let users = Storage.getUsers();
    const idx = users.findIndex((u) => u.id === id);

    if (idx !== -1) {
      users[idx].name = document.getElementById("edit-user-name").value;
      users[idx].email = document.getElementById("edit-user-email").value;
      users[idx].role = document.getElementById("edit-user-role").value;
      users[idx].dept = document.getElementById("edit-user-dept").value;
      users[idx].salary = Number(
        document.getElementById("edit-user-salary").value,
      );

      Storage.setUsers(users);
      alert("Member updated successfully!");
      closeEditModal();
      loadDirectory();
    }
  });
});

function loadDirectory(filter = "") {
  const users = Storage.getUsers();
  const tbody = document.getElementById("user-directory-body");

  if (tbody) {
    const filtered = users.filter(
      (u) =>
        u.name.toLowerCase().includes(filter.toLowerCase()) ||
        u.dept.toLowerCase().includes(filter.toLowerCase()),
    );

    tbody.innerHTML = filtered.length
      ? filtered
          .map(
            (u) => `
            <tr>
                <td><strong>${u.name}</strong><br><small style="color:var(--text-muted);">${u.email}</small></td>
                <td><span class="role-badge">${u.role.toUpperCase()}</span></td>
                <td>${u.dept}</td>
                <td>
                    <div class="action-btns">
                        <button class="btn btn-warning btn-icon" onclick="openEditModal(${u.id})" title="Edit User"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="btn btn-danger btn-icon" onclick="deleteUser(${u.id})" title="Delete User"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `,
          )
          .join("")
      : '<tr><td colspan="4" style="text-align:center;">No matching members found.</td></tr>';
  }
}

function openEditModal(id) {
  const users = Storage.getUsers();
  const user = users.find((u) => u.id === id);

  if (user) {
    document.getElementById("edit-user-id").value = user.id;
    document.getElementById("edit-user-name").value = user.name;
    document.getElementById("edit-user-email").value = user.email;
    document.getElementById("edit-user-role").value = user.role;
    document.getElementById("edit-user-dept").value = user.dept;
    document.getElementById("edit-user-salary").value = user.salary || 0;

    document.getElementById("edit-modal").classList.remove("hidden");
  }
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.add("hidden");
}

function deleteUser(id) {
  if (confirm("Are you sure you want to delete this member?")) {
    let users = Storage.getUsers().filter((u) => u.id !== id);
    Storage.setUsers(users);
    loadDirectory();
  }
}
