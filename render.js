export function layout(title, content, username = null) {
  const navLinks = username
    ? `<a href="/logout" class="nav-link"><i class="fas fa-sign-out-alt"></i> 登出</a>`
    : `<a href="/register" class="nav-link"><i class="fas fa-user-plus"></i> 註冊</a> | <a href="/" class="nav-link"><i class="fas fa-sign-in-alt"></i> 登入</a>`;

  return `
    <html>
    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <link rel="stylesheet" href="/static/style.css"> <!-- 確保正確引入 -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-pZw1PqkXjb6V7FepkGqKjH/6PWj5L5yD8D5w1s8hE5b8JX3ygFVU6sFLyJxprN/V4szD1CUPzLpYrP4TfK9gHg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    </head>
    <body>
        <div id="particles-js"></div> <!-- 粒子背景容器 -->
        <nav>
            ${navLinks}
            ${username ? '<button id="theme-toggle" class="theme-toggle"><i class="fas fa-moon"></i></button>' : ''}
        </nav>
        <div class="container">
            <h1 class="title">${title}</h1>
            ${content}
        </div>
        <script src="/static/particles.min.js"></script>
        <script>
            particlesJS.load('particles-js', '/static/particles.json', function() {
              console.log('particles.js loaded - callback');
            });

            // 暗黑模式切換
            const themeToggle = document.getElementById('theme-toggle');
            if (themeToggle) {
              themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-mode');
                themeToggle.innerHTML = document.body.classList.contains('dark-mode') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
              });
            }
        </script>
    </body>
    </html>
  `;
}

export function loginForm(error = null) {
  const errorMessage = error ? `<p class="error">${error}</p>` : "";
  return layout(
    "登入",
    `
    ${errorMessage}
    <form action="/login" method="post">
        <input type="text" name="username" placeholder="用戶名" required />
        <input type="password" name="password" placeholder="密碼" required />
        <button type="submit"><i class="fas fa-sign-in-alt"></i> 登入</button>
    </form>
    `
  );
}

export function registerForm(error = null) {
  const errorMessage = error ? `<p class="error">${error}</p>` : "";
  return layout(
    "註冊",
    `
    ${errorMessage}
    <form action="/register" method="post">
        <input type="text" name="username" placeholder="用戶名" required />
        <input type="password" name="password" placeholder="密碼" required />
        <button type="submit"><i class="fas fa-user-plus"></i> 註冊</button>
    </form>
    `
  );
}

export function dashboard(username) {
  return layout(
    "主頁",
    `
    <h2 class="welcome"><i class="fas fa-smile"></i> 歡迎, ${username}！</h2>
    <p>好玩的小鳥鳥遊戲。</p>
    <a href="/game" class="custom-button"><i class="fas fa-gamepad"></i> 開始遊戲</a>
    `,
    username
  );
}

export function gamePage(username) {
  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <title>遊戲頁面</title>
        <link rel="stylesheet" href="/static/style.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-pZw1PqkXjb6V7FepkGqKjH/6PWj5L5yD8D5w1s8hE5b8JX3ygFVU6sFLyJxprN/V4szD1CUPzLpYrP4TfK9gHg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    </head>
    <body>
        <div id="particles-js"></div> <!-- 粒子背景容器 -->
        <div class="container">
            <h1 class="title">小鳥鳥遊戲</h1>
            <canvas id="board"></canvas>
            <script src="/static/particles.min.js"></script>
            <script>
                particlesJS.load('particles-js', '/static/particles.json', function() {
                  console.log('particles.js loaded - callback');
                });
            </script>
            <script src="/static/game.js"></script>
        </div>
    </body>
    </html>
  `;
}