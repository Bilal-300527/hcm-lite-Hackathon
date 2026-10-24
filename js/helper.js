document.getElementById('send-chat-btn').addEventListener('click', () => {
    const input = document.getElementById('chat-input');
    const query = input.value.toLowerCase().trim();
    if (!query) return;

    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML += `<div class="chat-message"><i class="fa-solid fa-user"></i><div class="msg-content">${input.value}</div></div>`;

    let reply = "I can answer questions regarding workforce count, leaves, and HR management.";
    const users = Storage.getUsers();
    const hrs = users.filter(u => u.role === 'hr');

    if (query.includes('hr')) reply = `There are currently ${hrs.length} active HR Managers handling departments.`;
    else if (query.includes('employee') || query.includes('workforce')) reply = `Total employees registered: ${users.filter(u => u.role === 'employee').length}.`;

    setTimeout(() => {
        chatBox.innerHTML += `<div class="chat-message bot"><i class="fa-solid fa-robot"></i><div class="msg-content">${reply}</div></div>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 400);

    input.value = '';
});
