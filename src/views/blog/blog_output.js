const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware để phân tích dữ liệu form
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Đường dẫn tới file chứa các bài viết
const postsFilePath = path.join(__dirname, 'posts.json');

// Đọc các bài viết từ file (nếu có)
function readPosts() {
  try {
    const data = fs.readFileSync(postsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return []; // Nếu không có file hoặc file trống, trả về mảng rỗng
  }
}

// Ghi bài viết vào file
function savePost(post) {
  const posts = readPosts();
  posts.push(post);
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf8');
}

// Trang chủ - Hiển thị các bài viết
app.get('/', (req, res) => {
  const posts = readPosts();
  res.render('index', { posts });
});

// Trang tạo bài viết mới
app.get('/blog/create', (req, res) => {
  res.render('create');
});

// Xử lý form tạo bài viết mới
app.post('/blog/create', (req, res) => {
  const { title, content, author } = req.body;
  const newPost = {
    title,
    content,
    author,
    date: new Date(),
  };

  // Lưu bài viết vào file
  savePost(newPost);

  // Sau khi lưu xong, chuyển hướng về trang chủ để hiển thị các bài viết
  res.redirect('/');
});

// Cấu hình view engine (ví dụ dùng EJS)
app.set('view engine', 'ejs');

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
