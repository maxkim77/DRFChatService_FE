
// refresh token 가져오기
function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');

    return fetch('http://127.0.0.1:8000/account/token/refresh/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            refresh: refreshToken
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Token refresh failed');
        }
    })
    .then(data => {
        localStorage.setItem('access_token', data.access);
        return data.access;
    });
}

// Load chat history and check user authentication status when the page loads
window.addEventListener('load', function() {
    const accessToken = localStorage.getItem('access_token');
    checkAuthenticationStatus(accessToken);
    loadChatHistory(accessToken);
});
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = 'none';
}


// Function to check user authentication status and display the appropriate buttons
function checkAuthenticationStatus() {
    const accessToken = localStorage.getItem('access_token');
    const authMessage = document.getElementById('authMessage');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const registerBtn = document.getElementById('registerBtn');
    const messageInput = document.getElementById("messageInput")
    const sttBtn = document.getElementById("startSpeechBtn")
    const sendBtn = document.getElementById("sendMessageBtn")

    if (accessToken) {
        // User is authenticated, show the "Logout" button and hide "Login" and "Register" buttons
        authMessage.style.display = 'none';
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        registerBtn.style.display = 'none';
        messageInput.placeholder = "Put the message.";
        messageInput.disabled = false;
        sttBtn.disabled = false;
        sendBtn.disabled = false;
    } else {
        // User is not authenticated, show the "Login" and "Register" buttons and display login message
        authMessage.style.display = 'block';
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        registerBtn.style.display = 'block';
        messageInput.disabled = true;
        sttBtn.disabled = true;
        sendBtn.disabled = true;
    }
}


    // 사용자 데이터 가져오기 함수
    function fetchUserData(accessToken) {
        fetch('http://127.0.0.1:8000/account/mypage/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401) {
                // 401 오류시 토큰 갱신 시도
                return refreshToken().then(newAccessToken => {
                    return fetchUserData(newAccessToken);
                });
            } else {
                throw new Error('Failed to fetch user data');
            }
        })
        .then(data => {
            // 사용자 데이터 처리 로직
        })
        .catch(error => {
            console.error('Error:', error);
            alert('사용자 정보를 불러오는데 실패했습니다.');
        });
    }



function sendMessage() {
    var messageInput = document.getElementById("messageInput");
    var message = messageInput.value.trim();

    if (message !== "") {
        messageInput.value = "";
        addMessageToChat("user", message);
        showLoading();

        // Get the token from local storage
        const accessToken = localStorage.getItem('access_token');

        // Send the message to the backend API with the token in the headers
        fetch('http://127.0.0.1:8000/api/chat/gpt/', {
                method: 'POST',
                mode: 'cors', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    user_input: message
                })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else if (response.status === 401) {
                    // 401 오류시 토큰 갱신 시도
                    return refreshToken().then(newAccessToken => {
                        return sendMessage(); // 새 토큰으로 다시 시도
                    });
                } else {
                    throw new Error('Failed to send message');
                }
            })
            .then(data => {
                hideLoading(); // AI 응답을 받으면 로딩 창 숨기기
                // Add AI response to the chat
                addMessageToChat("assistant", data.response);
                playTextToSpeech(data.audio_url);
            })
            .catch(error => console.error('Error:', error));
    }
}

// Function to add a message to the chat box
function addMessageToChat(sender, message) {
    var chatBox = document.getElementById("chatBox");
    var newMessage = document.createElement("div");
    newMessage.textContent = message;

    // Add CSS classes based on the sender's role
    if (sender === "user") {
        newMessage.classList.add("user-message");
    } else if (sender === "assistant") {
        newMessage.classList.add("assistant-message");
    }

    chatBox.appendChild(newMessage);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function loadChatHistory() {
    const accessToken = localStorage.getItem('access_token');
    checkChatRequestCount()
    if (accessToken) {
        fetch('http://127.0.0.1:8000/api/chat/gpt/', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })
            .then(response => {
                if (response.status === 401) {
                    // User is not authenticated, display a message or redirect to login page
                    console.log('User is not authenticated.');
                    return [];
                } else {
                    return response.json();
                }
            })
            .then(data => {
                // Display chat history in the chat box
                if (data.conversations.length > 0) {
                    for (let i = 1; i < data.conversations.length; i++) {
                        const conversation = data.conversations[i];
                        addMessageToChat(conversation.role, conversation.content);
                    }
                    document.getElementById("startInterviewBox").style.display = "none";
                } else {
                    document.getElementById("startInterviewBox").style.display = "block";
                }
            })
            .catch(error => console.error('Error:', error));
    } else {
        // User is not authenticated, display a message or redirect to login page
        console.log('User is not authenticated.');
    }
}

function startInterview() {
    const interviewTopicInput = document.getElementById("interviewTopicInput");
    const interviewTopic = interviewTopicInput.value.trim();

    const accessToken = localStorage.getItem('access_token');
    // Check if the interview topic is not empty
    if (interviewTopic !== "") {
        showLoading();
        fetch('http://127.0.0.1:8000/api/chat/gpt/', {
              method: 'POST',
    mode: 'cors', 
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}` // Include the token in the headers
                },
                body: JSON.stringify({
                    interview_topic: interviewTopic 
                })
            })
            .then(response => response.json())
            .then(data => {
                hideLoading(); // AI 응답을 받으면 로딩 창 숨기기
                // Add AI response to the chat
                addMessageToChat("assistant", data.response);
                playTextToSpeech(data.audio_url);
            })
            .catch(error => console.error('Error:', error));
        document.getElementById("startInterviewBox").style.display = "none";
        document.getElementById("messageInput").focus();
    }
}

function startSpeechToText() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.lang = 'en'; // Set the language to Korean (you can change it to another supported language)

        recognition.onresult = function(event) {
            const speechText = event.results[0][0].transcript;
            document.getElementById('messageInput').value = speechText;
        };

        recognition.onerror = function(event) {
            if (event.error === 'no-speech') {
                console.log('No speech detected. Please try again.');
            } else {
                console.error('Speech recognition error:', event.error);
            }
        };

        recognition.onend = function() {
            console.log('Speech recognition ended.');
        };

        recognition.start();
    } else {
        alert('Speech-to-text not supported in your browser.');
    }
}

// 이 부분은 음성 파일 재생 로직을 따로 빼놓은 것입니다.
function playTextToSpeech(audioUrl) {
    var ttsAudio = document.getElementById("ttsAudio");
    ttsAudio.src = audioUrl;
    ttsAudio.play();
}

// Handle Enter key press event
var messageInput = document.getElementById("messageInput");
messageInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

function checkChatRequestCount() {
    const accessToken = localStorage.getItem('access_token');
    fetch('http://127.0.0.1:8000/api/chat/gpt/', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
    }
    })
    .then(response => response.json())
    .then(data => {
    if (data.count >= data.limit) {
        // Disable chat input if chat request count is 5 or more
        document.getElementById('messageInput').disabled = true;
        document.getElementById('messageInput').placeholder = 'Exceeded the number of daily chat requests.';
        document.getElementById('messageInput').style.backgroundColor = '#ddd';
        document.getElementById('sendMessageBtn').disabled = true;
    }
    })
    .catch(error => console.error('Error:', error));
}

const accessToken = localStorage.getItem('access_token');
if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = '/FE/login.html'; // 로그인 페이지의 실제 경로로 변경해야 합니다.
} else {
    fetchUserData(accessToken);
}

// refreshToken 함수와 fetchUserData 함수는 그대로 유지
