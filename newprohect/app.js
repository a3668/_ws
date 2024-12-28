import { Application, Router, send } from "https://deno.land/x/oak@v12.6.0/mod.ts";
import * as render from "./render.js";
import { createUser, findUser, saveScore } from "./database.js";

const router = new Router();
const sessions = new Map(); // Session 儲存

// 路由定義
router
  .get("/", showLogin) // 首頁設為登入頁
  .post("/login", login)
  .get("/register", showRegister)
  .post("/register", register)
  .get("/dashboard", dashboard) // 登入後的專屬頁面
  .get("/logout", logout)
  .get("/game", showGame) // 遊戲頁面
  .post("/api/save-score", saveUserScore); // 保存分數

const app = new Application();

// 靜態文件處理
app.use(async (ctx, next) => {
  const filePath = ctx.request.url.pathname;

  if (filePath.startsWith("/static")) {
    const staticFiles = `${Deno.cwd()}/static`;
    const relativePath = filePath.replace("/static/", ""); // 移除 '/static/' 前綴
    try {
      await send(ctx, relativePath, {
        root: staticFiles,
      });
    } catch {
      await next();
    }
  } else {
    await next();
  }
});

// 使用路由
app.use(router.routes());
app.use(router.allowedMethods());

// 顯示登入頁面
async function showLogin(ctx) {
  const sessionId = await ctx.cookies.get("sessionId");
  const username = sessions.get(sessionId);

  ctx.response.body = render.loginForm(
    username ? null : null // 無需顯示歡迎訊息在登入頁面
  );
}

// 處理登入請求
async function login(ctx) {
  const body = await ctx.request.body({ type: "form" }).value;
  const username = body.get("username");
  const password = body.get("password");

  const user = findUser(username, password);

  if (user) {
    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, username);

    ctx.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      sameSite: "Lax",
      maxAge: 3600,
    });
    ctx.response.redirect("/dashboard");
  } else {
    ctx.response.body = render.loginForm("用戶名或密碼錯誤！");
  }
}

// 顯示註冊頁面
async function showRegister(ctx) {
  ctx.response.body = render.registerForm(null);
}

// 處理註冊請求
async function register(ctx) {
  const body = await ctx.request.body({ type: "form" }).value;
  const username = body.get("username");
  const password = body.get("password");

  try {
    createUser(username, password);
    ctx.response.redirect("/");
  } catch (e) {
    ctx.response.body = render.registerForm(`註冊失敗: ${e.message}`);
  }
}

// 顯示專屬主頁
async function dashboard(ctx) {
  const sessionId = await ctx.cookies.get("sessionId");
  const username = sessions.get(sessionId);

  if (!username) {
    ctx.response.redirect("/");
    return;
  }

  ctx.response.body = render.dashboard(username);
}

// 處理登出
async function logout(ctx) {
  const sessionId = await ctx.cookies.get("sessionId");
  sessions.delete(sessionId);
  ctx.cookies.delete("sessionId");
  ctx.response.redirect("/");
}

// 顯示遊戲頁面
async function showGame(ctx) {
  const sessionId = await ctx.cookies.get("sessionId");
  const username = sessions.get(sessionId);

  if (!username) {
    ctx.response.redirect("/");
    return;
  }

  ctx.response.body = render.gamePage(username);
}

// 處理保存分數的 API
async function saveUserScore(ctx) {
  if (ctx.request.hasBody) {
    const body = await ctx.request.body({ type: "json" }).value;
    const { score } = body;
    const sessionId = await ctx.cookies.get("sessionId");
    const username = sessions.get(sessionId);

    if (username && typeof score === "number") {
      try {
        saveScore(username, score);
        ctx.response.status = 200;
        ctx.response.body = { message: "分數保存成功" };
      } catch (e) {
        ctx.response.status = 500;
        ctx.response.body = { message: "保存分數失敗" };
      }
    } else {
      ctx.response.status = 400;
      ctx.response.body = { message: "無效的請求" };
    }
  } else {
    ctx.response.status = 400;
    ctx.response.body = { message: "無效的請求" };
  }
}

console.log("伺服器啟動於 http://127.0.0.1:8000");
await app.listen({ port: 8000 });
