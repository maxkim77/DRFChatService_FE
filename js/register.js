document.getElementById('registerForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    // Send registration data to the backend API using Fetch API
    fetch('http://127.0.0.1:8000/account/user/register/', {
    method: 'POST',
    mode: 'cors', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        password2: confirmPassword // 변경된 부분
      })
    })
    .then(response => {
      if (response.status === 201) {
        // Registration successful, show success message or redirect to login page
        alert('Registration successful!');
        window.location.href = '/login.html'; // Redirect to login page
      } else if (response.status === 409) {
        // Username already exists, show error message
        alert('Username already exists. Please try a different username.');
      } else {
        // Registration failed, show error message
        alert('Registration failed. Please try again.');
      }
    })
    .catch(error => {
      // Registration failed, show error message
      alert('Registration failed. Please try again.');
      console.error('Error:', error);
    });
});