# Highest Peak Server

A robust Node.js backend server for a video sharing platform, built with Express.js and MySQL. This server provides comprehensive APIs for user management, video uploads, comments, and authentication.

## 🚀 Features

- **User Management**: User registration, login, profile updates, and admin controls
- **Video Platform**: Video upload, streaming, thumbnail generation, and view counting
- **Comment System**: User comments on videos with authentication
- **Authentication**: JWT-based secure authentication and authorization
- **File Management**: Video file uploads with automatic thumbnail generation
- **Database**: MySQL database with structured operations
- **CORS Support**: Cross-origin resource sharing enabled
- **Admin Controls**: Role-based access control for administrative functions

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Video Processing**: FFmpeg (fluent-ffmpeg)
- **CORS**: cors middleware
- **Environment**: dotenv for configuration

## 📁 Project Structure

```
highest-peak-server/
├── controllers/          # Business logic controllers
│   ├── comment-controller.js
│   ├── user-controller.js
│   └── video-controller.js
├── db/                  # Database operations
│   ├── db-connection.js
│   └── db-operations.js
├── middlewares/         # Custom middleware functions
│   ├── authentication.js
│   ├── upload.js
│   └── thumbnail-generator.js
├── routers/             # API route definitions
│   ├── auth.js
│   ├── comments.js
│   ├── home.js
│   ├── users.js
│   └── videos.js
├── uploads/             # Video file storage
├── utils/               # Utility functions
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- FFmpeg installed on your system

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd highest-peak-server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=password
   DB_NAME=mydb
   JWT_SECRET=your_jwt_secret_here
   ```

4. **Configure MySQL database**
   - Ensure MySQL is running
   - Create a database named `mydb`
   - Update database credentials in `db/db-connection.js` if needed

5. **Install FFmpeg**
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Windows**: Download from [FFmpeg official website](https://ffmpeg.org/download.html)

6. **Start the server**
   ```bash
   node server.js
   ```

The server will start running on port 5000 (or the port specified in your `.env` file).

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login

### Users
- `GET /users` - Get all users or filter by query parameters
- `PATCH /users` - Update user information
- `DELETE /users` - Delete user (admin only)

### Videos
- `GET /videos` - Get all videos or filter by user ID
- `GET /videos/:fileName` - Stream video file
- `GET /videos/data/:fileName` - Get video metadata
- `POST /videos/upload` - Upload new video (authenticated)
- `PATCH /videos/viewupdate/:videoId` - Update view count
- `DELETE /videos/:filename` - Delete video (authenticated)

### Comments
- `POST /comments/upload` - Add comment (authenticated)
- `GET /comments` - Get comments by video ID

### Static Files
- `GET /uploads/*` - Access uploaded video files

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Protected routes require a valid token in the request header:

```
Authorization: Bearer <your_jwt_token>
```

## 🗄️ Database Schema

The server automatically sets up the required database tables on startup. The main tables include:

- **users**: User accounts and profiles
- **videos**: Video metadata and file information
- **comments**: User comments on videos

## 📁 File Uploads

- Videos are stored in the `uploads/` directory
- Automatic thumbnail generation using FFmpeg
- File size and format validation
- Secure file serving with proper MIME types

## 🚧 Middleware

- **Authentication**: JWT token verification
- **Upload**: File upload handling with Multer
- **Thumbnail Generation**: Automatic video thumbnail creation
- **Admin Access**: Role-based access control
- **CORS**: Cross-origin resource sharing

## 🔧 Configuration

Key configuration options can be modified in:

- `.env` file for environment variables
- `db/db-connection.js` for database settings
- `server.js` for server configuration

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set proper production values
2. **Database**: Use production MySQL instance
3. **File Storage**: Consider cloud storage for videos
4. **Security**: Implement rate limiting and input validation
5. **Monitoring**: Add logging and error tracking

### Docker (Optional)

You can containerize the application using Docker:

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions, please open an issue in the repository or contact the development team.

## 🔄 Version History

- **v1.0.0** - Initial release with core video sharing functionality

---

**Note**: This is a backend server application. You'll need a frontend client to interact with the APIs and provide a user interface for the video sharing platform. 