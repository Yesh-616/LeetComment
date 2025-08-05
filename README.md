# LeetComment

LeetComment is a full-stack AI-powered MERN web application that leverages OpenAI's API to generate insightful comments and optimized solutions for LeetCode code submissions. Designed for developers and coding enthusiasts, LeetComment streamlines the process of code review and learning by providing AI-powered feedback and suggestions for improvement.

---

## Key Features

- **AI-Powered Code Commenting:** Automatically generate detailed comments for your LeetCode code submissions using OpenAI's advanced language models.
- **Optimized Solution Suggestions:** Receive alternative or optimized solutions for your code, helping you learn best practices and improve your coding skills.
- **Modern UI:** Clean, responsive, and user-friendly interface built with React and Tailwind CSS.
- **RESTful API:** Robust backend built with Express and MongoDB for scalable data management.

---

## Tech Stack

| Layer      | Technology                |
|------------|---------------------------|
| Frontend   | React, Vite, Tailwind CSS |
| Backend    | Node.js, Express          |
| Database   | MongoDB, Mongoose         |
| AI Service | OpenAI API                |
| Auth       | JWT, bcryptjs             |
| Validation | express-validator         |
| Security   | helmet, express-rate-limit, cors, dotenv |
| Dev Tools  | Nodemon, Jest, ESLint     |

---

## Folder Structure

```
project/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── commentController.js
│   │   └── solutionController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Comment.js
│   │   ├── Solution.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── commentRoutes.js
│   │   └── solutionRoutes.js
│   ├── utils/
│   │   └── aiCommentGenerator.js
│   ├── server.js
│   ├── package.json
│   └── ...
├── src/
│   ├── components/
│   │   ├── AuthModal.jsx
│   │   ├── AuthPrompt.jsx
│   │   ├── CodeEditor.jsx
│   │   └── UserProfile.jsx
│   ├── hooks/
│   │   ├── useAuth.jsx
│   │   └── useSolutions.js
│   ├── services/
│   │   ├── aiCommentingService.js
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   └── ...
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── ...
```

---

## Setup and Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB instance (local or cloud)
- OpenAI API key

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/LeetComment.git
cd LeetComment/project
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create a .env file with the following variables:
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# OPENAI_API_KEY=your_openai_api_key
npm run dev
```

### 3. Frontend Setup
```bash
cd ../
npm install
npm run dev
```

The frontend will typically run on [http://localhost:5173](http://localhost:5173) and the backend on [http://localhost:5000](http://localhost:5000).

---

## Usage Guide

1. **Submit Code:** Paste your LeetCode code submission in the editor.
2. **Generate Comments:** Click the button to generate AI-powered comments and suggestions.
3. **Review:** Review the generated comments and optimized solutions.

---

## Future Enhancements
- Social sharing of solutions and comments
- In-app code execution and testing
- Enhanced AI models for deeper code analysis

---

## Contributing Guidelines

We welcome contributions! To contribute:
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and passes all tests.

---

## License

This project is licensed under the MIT License.

---

## Author

**LeetComment Team**  
GitHub: [https://github.com/yourusername](https://github.com/yourusername) 
