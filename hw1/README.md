    •	Application 是 Oak 框架的一部分，用於構建伺服器應用程式。
    •	它負責：
    •	監聽端口以接收用戶的 HTTP 請求。
    •	執行一系列中介函式（middleware），處理請求並生成回應。
    •	管理路由和錯誤處理。

1. 什麼是 ctx.request.url.pathname？
   • ctx.request.url 是 Oak 提供的物件，用於存取請求的完整 URL。
   • .pathname 是 URL 的路徑部分，指的是從域名後開始直到查詢參數或哈希標籤之前的部分。例如：
   • http://127.0.0.1:8000 的 pathname 是 /。
2. 為什麼 pathname 是 /？

當用戶在瀏覽器中輸入 http://127.0.0.1:8000 並按下回車時： 1. 瀏覽器向伺服器發送一個 GET 請求。 2. 該請求的目標路徑是根路徑 /，因為沒有指定具體的子路徑。 3. 在伺服器中，ctx.request.url.pathname 自動解析出這個請求的路徑，結果為 /。

    	{ port: 8000 } 表示伺服器將在埠口 8000 上監聽。
    •	任何發送到 http://127.0.0.1:8000 的 HTTP 請求都會被這個伺服器處理。
