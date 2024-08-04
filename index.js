const express = require('express');
const app = express();
const port = 3000;
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'sqlite',               // 데이터베이스 방언을 'sqlite'로 설정
    storage: 'database.sqlite'      // SQLite 데이터베이스 파일의 저장 경로
});

const Comments = sequelize.define('Comments', {
    content: {                       // 'content' 컬럼 정의
        type: DataTypes.STRING,      // 데이터 타입을 STRING으로 설정
        allowNull: false             // Null 값을 허용하지 않음
    }
});

(async () => {
    await Comments.sync({ force: true }); // 데이터베이스와 동기화
    console.log("The table for the Comments model was just (re)created!");
})();

let comments = [];  // 댓글을 저장할 배열

app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // JSON 본문 파싱 설정

app.set('view engine', 'ejs');


// app.get('/', async (req, res) => {
//     const comments = await Comments.findAll(); // 데이터베이스에서 댓글을 가져옴
//     res.render('index', { comments: comments.map(c => c.content) });  // 댓글 데이터를 EJS로 전달
// });
app.get('/', async (req, res) => {
    try {
        const comments = await Comments.findAll();  // Fetch comments from the database
        res.render('index', { comments: comments });  // Pass comments to the EJS template
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).send("Error fetching comments");
    }
});


app.post('/create', async (req, res) => {
    try {
        console.log("Request body:", req.body);
        const { content } = req.body;
        if (!content) {
            res.status(400).send("Content is required");
            return;  // Ensure no further code executes
        }
        console.log("Saving content:", content);
        await Comments.create({ content });
        console.log("Redirecting to '/'");
        res.redirect('/');
    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send("An error occurred");
    }
});


// 게시글을 수정하는 라우팅 규칙 추가
// update() 함수를 사용할 때는 async 코드 추가
// 라우팅 경로에서 데이터에 따라 가변 부분을 나타낼 때는 콜론(:) 사용
app.post('/update/:id', async (req, res) => {
    console.log(req.params);
    console.log(req.body);
    const {id} = req.params;    //파라미터에서 아이디값 가져오기
    const {content} = req.body;
    //테이블의 데이터 중 파라미터의 아이디값과 일치하는 것에 content값 덮어쓰기
    await Comments.update({ content: content }, {
        where: {
            id: id
        }
    });
    res.redirect('/');
});



app.post('/delete/:id', async (req, res) =>{
    console.log(req.params);
    const {id} = req.params;    // 데이터 중 파라미터의 아이디값과 일치하는 것 삭제
    await Comments.destroy({
        where: {
            id: id
        }
    });
    res.redirect('/');
});



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`); // 서버 시작 메시지
});
