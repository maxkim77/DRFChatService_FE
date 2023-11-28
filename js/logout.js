
// Function to handle logout button click event
document.getElementById('logoutBtn').addEventListener('click', function() {
    logout();
});

function logout() {
    fetch('http://127.0.0.1:8000/account/logout/', { // '/logout/' URL을 사용하여 로그아웃 요청
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            refresh: localStorage.getItem('refresh_token')
        })
    })
    .then(response => {
        if (response.ok) {
            localStorage.removeItem('access_token'); // 액세스 토큰 삭제
            localStorage.removeItem('refresh_token'); // 리프레시 토큰 삭제
            window.location.href = 'http://127.0.0.1:5500/FE/login.html'; // 로그인 페이지로 리다이렉트
        } else {
            throw new Error('Failed to logout');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('로그아웃에 실패했습니다.');
    });
}

document.getElementById('logoutButton').addEventListener('click', logout);

// const accessToken = localStorage.getItem('access_token');
if (!accessToken) {
    alert('로그인이 필요합니다.');
    window.location.href = 'http://127.0.0.1:5500/FE/login.html'; // 로그인 페이지의 실제 경로로 변경해야 합니다.
} else {
    fetchUserData(accessToken);
}
