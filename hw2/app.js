import { Application, Router } from "https://deno.land/x/oak/mod.ts";
import * as render from './render.js'

// 以 user 作為鍵，為每個用戶儲存貼文列表
const posts = [
    { id: 0, title: 'aaa', body: 'aaaaa', created_at:new Date() },
    { id: 1, title: 'bbb', body: 'bbbbb', created_at:new Date() }
];

const router = new Router();

router.get('/', list)
    .get('/post/new', add)
    .get('/post/:id', show)
    .post('/post', create);

const app = new Application();
app.use(router.routes());
app.use(router.allowedMethods());

async function list(ctx) {
    ctx.response.body = await render.list(posts);
}

async function add(ctx) {
    ctx.response.body = await render.newPost();
}

async function show(ctx) {
    const id = ctx.params.id;
    const post = posts[id];
    if (!post) ctx.throw(404, 'invalid post id');
    ctx.response.body = await render.show(post);
}

async function create(ctx) {
    const body = ctx.request.body
    //body 是一個 Body 物件，可能包含不同類型的資料（如 JSON、表單資料等）
    if (body.type() === "form") {
        const pairs = await body.form()
        //	因為 form() 是一個異步方法，所以需要使用 await 來等待解析完成。
        const post = {}
        for (const [key, value] of pairs) {
            post[key] = value
        }
        console.log('post=', post)
        const id = posts.push(post) - 1;
        //將新的貼文物件加入到 posts 陣列的末尾。
        post.created_at = new Date(); // 設定建立時間
        post.id = id;
        ctx.response.redirect('/');
    }
}

console.log('Server run at http://127.0.0.1:8000')
await app.listen({ port: 8000 });
