ctx.response.body = await render.userList(Object.keys(posts))
ctx：表示請求的上下文對象（Context），由 Oak 框架自動生成，包含了請求和回應的相關信息。

response：是上下文對象中的一個屬性，表示要發送給客戶端的 HTTP 回應。

body：是回應對象中的一個屬性，用來存放回應的內容。

Object.keys(posts) 的作用：
取出 posts 中的所有鍵，並返回一個陣列。
['test', 'test2']

ctx.params.user：
從 ctx.params 物件中取出名為 user 的參數值。

render.js
join('\n') 的作用
• join(separator) 是 JavaScript 陣列的方法，用於將陣列中的所有元素連接成一個字串，元素之間用指定的分隔符號連接。
• 在這裡，'\n' 是分隔符，表示每個元素之間用換行符號分隔。

action="/${user}/post"
• action 屬性：
• 指定表單提交時的目標 URL，也就是資料會發送到伺服器的哪個路徑。
• ${user} 是模板字串中的動態內容，用於插入特定的用戶名稱。

method="post"
• method 屬性：
• 指定 HTTP 方法，用於告訴伺服器該如何處理提交的資料。
• 在這裡，method="post" 表示使用 HTTP POST 方法。
