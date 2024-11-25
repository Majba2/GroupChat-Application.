let userName;
let groupName;

const input = $("input[name='txt-msg']");
const messageBody = $(".message-body");
const classUser = $(".user");
const socket = io();

socket.on('connect', addUser);
socket.on('updateusers', updateUserList);

function addUser() {
    while (!userName) {
        userName = prompt("Enter your Name!");
    }
    while (!groupName) {
        groupName = prompt("Enter your group name!");
    }  
    socket.emit('adduser', userName, groupName);
}

input.on('keyup', function (e) {
    if (e.key === 'Enter') {
        sendMessage(e.target.value);
    }
});

function sendMessage(message) {
    const msg = {
        user: userName,
        message: message.trim()
    };
    appendMessage(msg, 'outgoing');
    input.val('');
    scrollToBottom();
    socket.emit('message', msg);
}

function appendMessage(msg, type) {
    const newDiv = $('<div>').addClass(`${type} message`);
    newDiv.html(`<h4>${msg.user}</h4><p>${msg.message}</p>`);
    messageBody.append(newDiv);
}

function scrollToBottom() {
    messageBody.scrollTop(messageBody[0].scrollHeight);
}

socket.on('message', (msg) => {
    appendMessage(msg, 'incoming');
    scrollToBottom();
});

socket.on('greeting', (data) => {
    const msg = {
        user: "Author",
        message: `Welcome ${data}! You have been connected.`
    };
    appendMessage(msg, 'incoming');
    scrollToBottom();
});

function updateUserList(data) {
    classUser.empty();
    $('.group').html(groupName);
    $.each(data, (key, value) => {
        if (key.endsWith(groupName)) {
            const newSpan = $('<span>').html(`<img src="user.png" alt="${value}"><sub class="on_off">${value}</sub>`);
            classUser.append(newSpan);
        }
    });
}

$('#imageInput').on('change', function (e) {
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!file) {
        $('#imageInput').val('');
        return;
    }

    reader.onload = evt => {
        if (file.type.startsWith('image/')) {
            socket.emit('uploadImage', evt.target.result, userName);
            appendImage(evt.target.result, 'outgoing');
        } else {
            socket.emit('uploadFile', evt.target.result, userName, file.name);
            appendFile(file.name, evt.target.result, 'outgoing');
        }
    };

    reader.readAsDataURL(file);
    $('#imageInput').val('');
});

function appendImage(data, type) {
    messageBody.append(`<div class="message ${type}"><h4>${userName}</h4><img src="${data}" class="uploadedImage"/></div>`);
    scrollToBottom();
}

function appendFile(fileName, data, type) {
    messageBody.append(`<div class="message ${type}"><h4>${userName}</h4><a href="${data}" download="${fileName}">${fileName}</a></div>`);
    scrollToBottom();
}

socket.on('publishImage', (data, user) => {
    appendImage(data, 'incoming');
});

socket.on('publishFile', (data, user, fileName) => {
    appendFile(fileName, data, 'incoming');
});
