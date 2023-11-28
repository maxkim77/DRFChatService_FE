document.getElementById('loginForm').addEventListener('submit', function (event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Send login data to the backend API using Fetch API
  fetch('http://127.0.0.1:8000/account/user/login/', {
      method: 'POST',
      mode: 'cors',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          username: username,
          password: password
      })
  })

.then(response => {
    if (response.status === 200) {
        // Successful login
        return response.json();
    } else {
        throw new Error(`Request failed with status ${response.status}`);
    }
})
.then(data => {
    console.log("Received data:", data); // 서버 응답 로깅
    localStorage.setItem('token', data.token);
    console.log("Stored token:", localStorage.getItem('token')); // 저장된 토큰 확인
    // 페이지 전환
    window.location.href = 'https://maxkim77.github.io/DRFChatService_FE/Repo/service/index.html';
})
.catch(error => {
    console.error('Error:', error);
    // 오류
    alert('Login failed. Please try again.');
});
});
