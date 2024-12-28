以下內容將以整體流程和程式細節的角度，帶你一步一步讀懂這個部屬於 Deno + Oak + SQLite 的簡易 Blog 專案程式碼。程式有兩個檔案：app.js 和 render.js。其大致功能如下：
	1.	app.js
	•	作為整個程式的入口 (main application entry)
	•	負責初始化資料庫 (SQLite)
	•	設定 Oak 路由 (Router)
	•	設定 Session (用於簡易登入狀態管理)
	•	寫出部落格 CRUD (Create/Read) 相應的處理函式
	2.	render.js
	•	負責產生頁面 HTML（相當於簡易的 Server-Side Template）
	•	使用自訂的 layout() 及其他函式，如 loginUi, signupUi, list, show 等，將傳入的資料插入到對應的網頁模板中

app.js

1. 匯入/初始化

import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'
import { DB } from "https://deno.land/x/sqlite/mod.ts";
import { Session } from "https://deno.land/x/oak_sessions/mod.ts";

	•	Application, Router：來自 Oak，分別用於建立 Web 伺服器和路由。
	•	render：引入自家定義的 render.js，用於渲染 HTML 頁面。
	•	DB：來自 sqlite，用於連接 SQLite 資料庫。
	•	Session：來自 oak_sessions，用於管理使用者登入狀態。

接著建立資料庫連線，並建表：

const db = new DB("blog.db");
db.query("CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, title TEXT, body TEXT)");
db.query("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT, email TEXT)");

	•	blog.db：SQLite 檔案。若不存在會自動建立。
	•	建立兩個資料表：
	•	posts：儲存部落格文章 (包含 id, username, title, body)。
	•	users：儲存用戶 (包含 id, username, password, email)。

2. 定義 Router 及路由對應 (router)

const router = new Router();

router
  .get('/', list)           // GET /               -> 列出所有文章
  .get('/signup', signupUi) // GET /signup         -> 註冊頁面
  .post('/signup', signup)  // POST /signup        -> 處理註冊
  .get('/login', loginUi)   // GET /login          -> 登入頁面
  .post('/login', login)    // POST /login         -> 處理登入
  .get('/logout', logout)   // GET /logout         -> 處理登出
  .get('/post/new', add)    // GET /post/new       -> 新增文章頁面
  .get('/post/:id', show)   // GET /post/123       -> 顯示單篇文章
  .post('/post', create)    // POST /post          -> 實際新增文章

每個路由對應到後面會定義的函式 (list、signupUi、signup … 等)。

3. 設定 Oak 應用程式並啟動

const app = new Application()
app.use(Session.initMiddleware())  // 啟動 session 中介層
app.use(router.routes());
app.use(router.allowedMethods());

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });

	•	Session.initMiddleware()：啟用 session 功能，之後就可以在 ctx.state.session 中存取或儲存資料。
	•	router.routes() / router.allowedMethods()：將事先定義的路由掛載到應用程式上。
	•	await app.listen({ port: 8000 })：啟動伺服器在本地 port 8000。

4. 資料庫相關函式

(1) sqlcmd(sql, arg1)

function sqlcmd(sql, arg1) {
  console.log('sql:', sql)
  try {
    var results = db.query(sql, arg1)
    console.log('sqlcmd: results=', results)
    return results
  } catch (error) {
    console.log('sqlcmd error: ', error)
    throw error
  }
}

	•	用來執行 SQL 指令並回傳結果。
	•	db.query(sql, arg1)：SQLite 提供的查詢介面，可以帶預先的參數陣列。
	•	arg1 預期是一個陣列，傳入對應的參數 (如 ['some_username', 'some_password'])。

(2) postQuery(sql)

function postQuery(sql) {
  let list = []
  for (const [id, username, title, body] of sqlcmd(sql)) {
    list.push({id, username, title, body})
  }
  return list
}

	•	封裝了讀取 posts 資料表的結果。
	•	將每一筆資料 (解構成 id, username, title, body) 放到陣列裡回傳。

(3) userQuery(sql)

function userQuery(sql) {
  let list = []
  for (const [id, username, password, email] of sqlcmd(sql)) {
    list.push({id, username, password, email})
  }
  return list
}

	•	封裝了讀取 users 資料表的結果。
	•	參考 postQuery 做法，依序將欄位解構出來存到物件，再放進一個陣列並回傳。

5. 工具函式

async function parseFormBody(body) {
  const pairs = await body.form()
  const obj = {}
  for (const [key, value] of pairs) {
    obj[key] = value
  }
  return obj
}

	•	用於解析前端傳來的表單內容 (FormData)。
	•	例如：假設使用者填寫 username = alice，password = 1234，最後會轉成 { username: "alice", password: "1234" }。

6. 路由對應的處理函式

以下函式都是配合上面設定的 router。

(1) signupUi(ctx)

async function signupUi(ctx) {
  ctx.response.body = await render.signupUi();
}

	•	回應一個註冊頁面的表單 (由 render.signupUi() 產生 HTML)。

(2) signup(ctx)

async function signup(ctx) {
  const body = ctx.request.body
  if (body.type() === "form") {
    var user = await parseFormBody(body)
    // user = { username, password, email }

    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`)
    if (dbUsers.length === 0) {
      sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]);
      ctx.response.body = render.success()
    } else {
      ctx.response.body = render.fail()
    }
  }
}

	•	先解析表單內容 (username, password, email)。
	•	查詢資料庫是否已存在該帳號 (以 username='${user.username}' 查詢)。
	•	若無則INSERT新增該用戶，回傳 success 畫面；若已有重複的 username 就回傳 fail 畫面。

	安全性注意：
這裡直接使用 username='${user.username}' 串接字串，可能有 SQL 注入風險，
建議可改成「prepared statement」的方式，例如：	才能確保安全。

(3) loginUi(ctx)

async function loginUi(ctx) {
  ctx.response.body = await render.loginUi();
}

	•	回應一個登入頁面。

(4) login(ctx)

async function login(ctx) {
  const body = ctx.request.body
  if (body.type() === "form") {
    var user = await parseFormBody(body)
    var dbUsers = userQuery(`SELECT id, username, password, email FROM users WHERE username='${user.username}'`)
    var dbUser = dbUsers[0]
    if (dbUser.password === user.password) {
      // 登入成功就把使用者資料存在 session 裡
      ctx.state.session.set('user', user)
      ctx.response.redirect('/');
    } else {
      ctx.response.body = render.fail()
    }
  }
}

	•	解析使用者輸入的 username、password。
	•	到資料庫找到該 user，再比對 password。
	•	若密碼正確，就將整個 user 物件存進 session，並導回首頁。
	•	若錯誤，就顯示失敗 (fail) 頁面。

(5) logout(ctx)

async function logout(ctx) {
   ctx.state.session.set('user', null)
   ctx.response.redirect('/')
}

	•	將 session 中的 user 清空 (登出)。
	•	重新導回首頁。

(6) list(ctx)

async function list(ctx) {
  let posts = postQuery("SELECT id, username, title, body FROM posts")
  ctx.response.body = await render.list(posts, await ctx.state.session.get('user'));
}

	•	從資料庫取得所有文章 (posts)。
	•	呼叫 render.list(posts, user)，並將結果放到 ctx.response.body 回給前端。
	•	同時也檢查 session 中的 user 來決定是否要顯示「登入/登出」或「新增文章」等超連結。

(7) add(ctx)

async function add(ctx) {
  var user = await ctx.state.session.get('user')
  if (user != null) {
    ctx.response.body = await render.newPost();
  } else {
    ctx.response.body = render.fail()
  }
}

	•	用於顯示「新增文章」的表單，只允許已登入的使用者才能看。
	•	若使用者尚未登入 (user == null)，就回傳 fail 畫面。

(8) show(ctx)

async function show(ctx) {
  const pid = ctx.params.id;
  let posts = postQuery(`SELECT id, username, title, body FROM posts WHERE id=${pid}`)
  let post = posts[0]
  if (!post) ctx.throw(404, 'invalid post id');
  ctx.response.body = await render.show(post);
}

	•	顯示某篇文章的內文。
	•	從路由參數 :id 取得文章 id，查詢資料庫。
	•	若找不到文章，就拋 404 (找不到該篇文章)。
	•	找到了就渲染 render.show(post)。

(9) create(ctx)

async function create(ctx) {
  const body = ctx.request.body
  if (body.type() === "form") {
    var post = await parseFormBody(body)
    var user = await ctx.state.session.get('user')
    if (user != null) {
      sqlcmd("INSERT INTO posts (username, title, body) VALUES (?, ?, ?)", [user.username, post.title, post.body]);
    } else {
      ctx.throw(404, 'not login yet!');
    }
    ctx.response.redirect('/');
  }
}

	•	解析表單 (title, body)。
	•	取得 session 中的 user (username)。
	•	若已登入，就插入新文章 INSERT INTO posts。否則拋出 404 錯誤 (尚未登入)。
	•	最後導回首頁。

render.js

這個檔案主要是用 JSX 語法 (透過 Deno 解析) 來產生 HTML 字串。
每個函式基本上都會呼叫 layout(title, content) 來包住主要內容。

1. layout(title, content)

export function layout(title, content) {
  return `
  <html>
  <head>
    <title>${title}</title>
    <style>
      body {
        padding: 80px;
        font: 16px Helvetica, Arial;
      }
      h1 {
        font-size: 2em;
      }
      h2 {
        font-size: 1.2em;
      }
      #posts {
        margin: 0;
        padding: 0;
      }
      #posts li {
        margin: 40px 0;
        padding-bottom: 20px;
        border-bottom: 1px solid #eee;
        list-style: none;
      }
      #posts li:last-child {
        border-bottom: none;
      }
      textarea {
        width: 500px;
        height: 300px;
      }
      input[type=text],input[type=password],
      textarea {
        border: 1px solid #eee;
        border-top-color: #ddd;
        border-left-color: #ddd;
        border-radius: 2px;
        padding: 15px;
        font-size: .8em;
      }
      input[type=text],input[type=password] {
        width: 500px;
      }
    </style>
  </head>
  <body>
    <section id="content">
      ${content}
    </section>
  </body>
  </html>
  `
}

	•	提供統一的 HTML 結構 (包含 <head> 裡的 <style>、標籤等)。
	•	title 和 content 會被動態插入到模板中。

2. loginUi()

export function loginUi() {
  return layout('Login', `
    <h1>Login</h1>
    <form action="/login" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="submit" value="Login"></p>
      <p>New user? <a href="/signup">Create an account</a></p>
    </form>
  `)
}

	•	顯示登入表單，支援輸入 username/password，並指向 POST /login。

3. signupUi()

export function signupUi() {
  return layout('Signup', `
    <h1>Signup</h1>
    <form action="/signup" method="post">
      <p><input type="text" placeholder="username" name="username"></p>
      <p><input type="password" placeholder="password" name="password"></p>
      <p><input type="text" placeholder="email" name="email"></p>
      <p><input type="submit" value="Signup"></p>
    </form>
  `)
}

	•	顯示註冊表單，包含 username/password/email，對應到 POST /signup。

4. success() / fail()

export function success() {
  return layout('Success', `
    <h1>Success!</h1>
    You may <a href="/">read all Post</a> / <a href="/login">login</a> again !
  `)
}

export function fail() {
  return layout('Fail', `
    <h1>Fail!</h1>
    You may <a href="/">read all Post</a> or <a href="JavaScript:window.history.back()">go back</a> !
  `)
}

	•	註冊或登入結果用的兩個簡單提示頁面：「成功」或「失敗」。

5. list(posts, user)

export function list(posts, user) {
  let list = []
  for (let post of posts) {
    list.push(`
      <li>
        <h2>${post.title} -- by ${post.username}</h2>
        <p><a href="/post/${post.id}">Read post</a></p>
      </li>
    `)
  }

  let content = `
    <h1>Posts</h1>
    <p>${(user==null) ? 
        '<a href="/login">Login</a> to Create a Post!' 
        : 'Welcome ' + user.username + ', You may <a href="/post/new">Create a Post</a> or <a href="/logout">Logout</a> !' }
    </p>
    <p>There are <strong>${posts.length}</strong> posts!</p>
    <ul id="posts">
      ${list.join('\n')}
    </ul>
  `
  return layout('Posts', content)
}

	•	負責顯示首頁 (所有文章列表)。
	•	若使用者沒登入，就顯示「Login to Create a Post!」。若有登入，則顯示「Welcome XXX…」以及新增文章或登出連結。

6. newPost()

export function newPost() {
  return layout('New Post', `
    <h1>New Post</h1>
    <p>Create a new post.</p>
    <form action="/post" method="post">
      <p><input type="text" placeholder="Title" name="title"></p>
      <p><textarea placeholder="Contents" name="body"></textarea></p>
      <p><input type="submit" value="Create"></p>
    </form>
  `)
}

	•	新增文章的表單介面。

7. show(post)

export function show(post) {
  return layout(post.title, `
    <h1>${post.title} -- by ${post.username}</h1>
    <p>${post.body}</p>
  `)
}

	•	顯示單篇文章的標題、作者、內文。

整體流程簡述
	1.	啟動程式：deno run --allow-net --allow-read --allow-write app.js（或類似指令）
	•	會自動建立 SQLite 資料庫檔 blog.db (若不存在)。
	•	建立 users 和 posts 兩張表。
	2.	瀏覽器上開啟 http://127.0.0.1:8000
	•	看到首頁 (list 函式)，顯示所有文章列表 (一開始應該是空的)。
	•	如果尚未登入，會看到「Login to Create a Post!」提示。
	•	可以先去 Signup 註冊，再 Login 登入。
	3.	註冊 (signup)
	•	GET /signup -> 顯示註冊介面。
	•	輸入資料，送出 POST /signup。
	•	伺服器端驗證是否已有相同 username；若沒有則插入到 users 表裡，回傳成功 (success)；否則失敗 (fail)。
	4.	登入 (login)
	•	GET /login -> 顯示登入介面。
	•	POST /login -> 驗證帳密。若正確就把使用者存到 session，並 redirect('/') 回首頁。
	5.	發表文章
	•	登入後，可以進到 /post/new -> 顯示新增文章表單。
	•	送出 POST /post -> 伺服器將資料 INSERT 進 posts 表裡，最後導回 / 看看新文章。
	6.	查看單篇文章
	•	GET /post/:id -> 依據文章 ID 抓資料庫內容後渲染 show()。
	7.	登出
	•	GET /logout -> session 清空 user，即完成登出。

總結來說，這個簡易 Blog 專案示範了：
	•	如何在 Deno + Oak 環境下使用 Router 來指定不同 URL 對應的邏輯。
	•	如何使用 SQLite 實現最基礎的資料存取 (像是 CRUD)。
	•	如何使用 Session 管理登入狀態。
	•	如何用一個簡單的 render.js 來產生 HTML 頁面 (相當於一個超簡易版本的 server-side template engine)。

這就是整個程式的大致原理與流程。若要擴充功能，可以做的方向包括：
	•	更安全的 Query (Prepared Statements)。
	•	進一步的密碼雜湊/加鹽 (hash/salt)。
	•	加上更新/刪除文章功能、留言功能等。
	•	前後端分離後改用 API/JSON 形式傳輸，前端再做渲染。

希望以上說明能幫助你更全面地理解這個 Blog 程式的結構與運作方式。祝學習順利！
