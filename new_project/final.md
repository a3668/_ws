# 期末作業
小鳥遊戲為本人上學期的網頁作業,登錄登出系統由老師上課內容和chatgpt協助完成,
### 重點增加安全性地方
功能 安全性優勢
httpOnly 防止客戶端 JavaScript 訪問 Cookie 減少 XSS 攻擊風險，保護敏感 Cookie 資料
sameSite: Lax 限制跨站請求攜帶 Cookie，允許部分情況（導航請求） 減少 CSRF 攻擊風險，防止 Cookie 被不當使用

httpOnly: true：防止客戶端腳本訪問此 Cookie，提高安全性。
sameSite: "Lax"：限制跨站請求攜帶此 Cookie
maxAge: 3600,設定會話過期時間

參數化查詢使用佔位符（如 ?）並將查詢參數作為單獨的輸入傳遞給資料庫引擎，而不是直接將參數拼接到 SQL 字串中。這樣可以避免攻擊者將惡意 SQL 語句注入到查詢中。
1. createUser 函數 db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, password]);
這裡的 username 和 password 是作為參數傳遞的，而不是直接拼接到 SQL 查詢字串中。

3. findUser 函數 db.query("SELECT * FROM users WHERE username = ? AND password = ?", [username, password]);
username 和 password 使用了參數化查詢，有效防止攻擊者通過提交惡意輸入來操控 SQL 查詢。

4. saveScore 函數： db.query("INSERT INTO scores (username, score) VALUES (?, ?)", [username, score]);
參數化查詢保護了 username 和 score，避免了惡意注入

5. getTopScores 函數：db.query("SELECT username, score, timestamp FROM scores ORDER BY score DESC, timestamp ASC LIMIT ?", [limit]);
這裡的 limit 參數化處理可以避免數字型參數被注入惡意字串。




