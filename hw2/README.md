1. ctx 是什麼？
   • ctx（context） 是 Oak 框架提供的上下文物件，包含有關 HTTP 請求和回應的所有資訊。
   • 它的結構通常包括：
   • ctx.request：包含請求的詳細資料，例如 URL、HTTP 方法、標頭和主體。
   • ctx.response：用來設定回應的內容和狀態碼。
   • ctx.params：包含路徑中的動態參數。

GET 用於讀取資料 POST 用於提交資料

router.routes() 返回一個中介函式，負責處理路由的邏輯。
• 當用戶發送請求時： 1. 這個中介函式會檢查請求的路徑和方法（如 GET /, POST /post）。 2. 如果匹配到某個路由，執行對應的處理函式。
沒有這行程式碼，路由不會被應用程式處理，用戶的請求將無法匹配到任何路由

app.use(router.allowedMethods())
router.allowedMethods() 返回另一個中介函式，用於處理路徑存在但方法不正確的情況。
HTTP 方法（如 GET、POST、PUT、DELETE） 是用來指示伺服器應如何處理請求的動作：
• GET：用於讀取資料，例如顯示貼文列表。
• POST：用於新增資料，例如創建新貼文。
• PUT：用於更新現有資料。
• DELETE：用於刪除資料。

如果伺服器只定義了特定的 HTTP 方法，但用戶發送了不支持的方法，這就是方法不匹配的情況。
router.allowedMethods() 自動回應 405 Method Not Allowed，並在回應標頭中加上允許的方法（如 Allow: GET, POST）。

ctx.response.body：
用於設定 HTTP 回應的主體內容，也就是用戶端會收到的資料。
ctx.response.body = await render.list(posts);
使用 await 確保 render.list(posts) 的結果在完成後才賦值給 ctx.response.body。

render.list(posts) 是什麼？
這是一個匯入的函式，用於生成 HTML 頁面。它接收 posts 作為參數，通常是一個貼文列表。
具體來說，它會將 posts 的資料轉換為 HTML，讓用戶可以在瀏覽器中查看。
render.list(posts) 是一個可能包含非同步邏輯的函式，例如從檔案中讀取模板、從資料庫中查詢數據等

使用 await 等待這個函式完成，確保生成的頁面內容正確地被傳遞給用戶。

ctx.params 是 Oak 框架提供的 路徑參數（Path Parameters）。
如果用戶訪問 /post/3，ctx.params.id 的值是 '3'。

body.form()：
• 解析表單資料，返回一個 FormData 對象，其中包含了所有的鍵值對。
• pairs 是一個可迭代的結構，每個元素是一個 [key, value] 陣列。
• key 是表單欄位的 name。
• value 是用戶在該欄位中輸入的內容

---

render.js
export 關鍵字：
表示這個函式是模組的一部分，可以被其他檔案匯入
例如，另一個檔案可以使用 import { list } from './render.js'; 匯入這個函式

posts 是函式的輸入參數
