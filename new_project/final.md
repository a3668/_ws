#期末作業
遊戲為本人上學期的網頁作業,登錄登出系統由老師上課內容和chatgpt協助完成,
重點增加安全性地方
功能 安全性優勢
httpOnly 防止客戶端 JavaScript 訪問 Cookie 減少 XSS 攻擊風險，保護敏感 Cookie 資料
sameSite: Lax 限制跨站請求攜帶 Cookie，允許部分情況（導航請求） 減少 CSRF 攻擊風險，防止 Cookie 被不當使用

httpOnly: true：防止客戶端腳本訪問此 Cookie，提高安全性。
sameSite: "Lax"：限制跨站請求攜帶此 Cookie
httpOnly: true

功能
• httpOnly 屬性：
• 當設定為 true 時，這個 Cookie 只能通過伺服器端的 HTTP 請求存取，客戶端的 JavaScript 無法讀取或修改這個 Cookie。

目的
• 防止 JavaScript 操作 Cookie，減少潛在的安全風險，例如 跨站腳本攻擊（XSS, Cross-Site Scripting）。

httpOnly：防止 JavaScript 操作 Cookie，確保 Cookie 不會被惡意腳本竊取。
sameSite: "Lax"：限制 Cookie 的跨站使用範圍，減少 CSRF 攻擊的風


