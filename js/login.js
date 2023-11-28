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
//   .then(response => {
//       if (response.status === 200) {
//           // Successful login, store the token in local storage
//           response.json().then(data => {
//             console.log("Received data:", data); // 서버 응답 로깅
//             localStorage.setItem('token', data.token);
//             console.log("Stored token:", localStorage.getItem('token')); // 저장된 토큰 확인
//             // 토큰 저장을 확인한 후 페이지 전환
//             window.location.href = 'http://127.0.0.1:5500/FE/index.html';
//           });
//       } else if (response.status === 400) {
//           // Bad request, show error message from the server
//           response.json().then(data => {
//               alert(data.error);
//           });
//       } else if (response.status === 401) {
//           // Unauthorized, show error message
//           alert('Invalid credentials. Please try again.');
//       } else {
//           // Handle other error codes here if needed
//           alert('An error occurred. Please try again later.');
//       }
//   })
//   .catch(error => console.error('Error:', error));
// });
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
    // 페이지 전환은 여기에서 수행합니다.
    window.location.href = 'http://127.0.0.1:5500/FE/index.html';
})
.catch(error => {
    console.error('Error:', error);
    // 오류가 발생한 경우 사용자에게 알립니다.
    alert('Login failed. Please try again.');
});
});