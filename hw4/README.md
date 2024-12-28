db.query 是 Deno 的 SQLite 模組提供的方法，用來執行 SQL 查詢

主鍵（PRIMARY KEY）：唯一標識每一行資料。
自動遞增（AUTOINCREMENT）：每次插入新資料時，自動生成唯一的數值

    •	body.form()：
    •	是一個異步方法，用於解析表單類型的請求主體，返回一個迭代器（Iterator）。
    •	每個表單欄位的數據會作為一對 [key, value] 傳回。
    •	await：
    •	等待 form() 方法完成解析。

Session 是什麼？
Session 是一種伺服器端的狀態管理方式。
它用來在多個請求之間保存用戶的資訊（例如登入狀態）
每個請求的 ctx（上下文）中會新增一個 ctx.state.session 屬性，用於存取和修改會話資料

sql：是一個帶有佔位符（如 ?）的 SQL 語句。
arg1：
是一個陣列，包含 SQL 語句中對應的值。
db.query(sql, arg1) 會將 arg1 中的值安全地插入到 SQL 中的佔位符。
arg1 就是用來安全地傳遞這些動態值的容器。

sqlcmd("INSERT INTO users (username, password, email) VALUES (?, ?, ?)", [user.username, user.password, user.email]);
SQL 語句中的佔位符 ? 由資料庫自動處理，任何特殊字元都會被安全地轉義。
防止 SQL 注入攻擊。

var dbUsers = userQuery 的目的是執行一個 SQL 查詢，根據提供的 user.username 從資料庫的 users 表中查找用戶資訊，並將結果存入變數 dbUsers。
