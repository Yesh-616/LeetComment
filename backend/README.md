# LeetComment Backend API

A robust Node.js/Express backend API for the LeetComment platform, featuring AI-powered code analysis, user authentication, and community features.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **AI Code Analysis**: OpenAI-powered code analysis and comment generation
- **Solution Management**: CRUD operations for code solutions with AI insights
- **Comment System**: Nested comments with voting and replies
- **MongoDB Integration**: Mongoose ODM with optimized schemas
- **Security**: Helmet, CORS, rate limiting, and input validation
- **RESTful API**: Clean, documented REST endpoints

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- OpenAI API key

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/leetcomment
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # OpenAI Configuration
   OPENAI_API_KEY=your-openai-api-key-here
   OPENAI_MODEL=gpt-4
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get User Profile (Private)
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Solution Endpoints

#### Create Solution with AI Analysis (Private)
```http
POST /api/solutions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Meeting Rooms II Solution",
  "problemId": "253",
  "language": "java",
  "originalCode": "class Solution { ... }",
  "tags": ["greedy", "sorting"]
}
```

#### Get All Solutions
```http
GET /api/solutions?page=1&limit=10&language=java&search=meeting
```

#### Get Single Solution
```http
GET /api/solutions/:id
```

#### Real-time Code Analysis
```http
POST /api/solutions/analyze
Content-Type: application/json

{
  "code": "function solution() { ... }",
  "language": "javascript"
}
```

### Comment Endpoints

#### Create Comment (Private)
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "solutionId": "solution_id_here",
  "content": "Great solution! The approach is very clear.",
  "parentCommentId": "optional_parent_comment_id"
}
```

#### Get Comments for Solution
```http
GET /api/comments/solution/:solutionId?page=1&limit=20
```

#### Vote on Comment (Private)
```http
POST /api/comments/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "voteType": "up"
}
```

## 🗄️ Database Models

### User Model
- Authentication fields (name, email, password)
- User statistics (codeSubmissions, commentsPosted, upvotesReceived)
- Timestamps and soft delete support

### Solution Model
- Code content (original, commented, optimized)
- AI analysis results (algorithm type, complexity, insights)
- User relationships and metadata
- Pagination and search support

### Comment Model
- Nested comment structure with replies
- Voting system with user tracking
- Soft delete functionality
- Rich metadata and statistics

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/leetcomment` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `OPENAI_API_KEY` | OpenAI API key | Required |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4` |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

### Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Message**: Custom error response

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🔒 Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: DDoS protection
- **Input Validation**: Express-validator
- **Password Hashing**: bcryptjs
- **JWT Authentication**: Secure tokens
- **MongoDB Injection Protection**: Mongoose

## 📊 Monitoring

### Health Check
```http
GET /health
```

### API Documentation
```http
GET /api
```

## 🧪 Testing

```bash
npm test
```

## 📝 Error Handling

The API includes comprehensive error handling for:
- Validation errors
- Authentication failures
- Database errors
- Rate limiting
- JWT token issues

## 🔄 API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... } // Optional
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // Optional validation errors
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For support, please open an issue in the repository or contact the development team. 