# Authentication Implementation

This document describes the authentication system implemented in the ChatGPT application.

## Overview

The application uses JWT (JSON Web Token) based authentication with proper user separation and security measures.

## Backend (Python/FastAPI)

### Authentication Flow

1. **Login**: Users authenticate with username/password
2. **Token Generation**: Server validates credentials and returns JWT token
3. **Token Validation**: All protected endpoints validate JWT tokens
4. **User Separation**: Each user can only access their own data

### Key Components

#### AuthService (`auth/auth_service.py`)
- Password hashing using bcrypt
- JWT token creation and validation
- User authentication logic

#### Dependencies (`auth/dependencies.py`)
- `get_current_user()` function for protected endpoints
- Automatic token validation and user extraction

#### Rate Limiting (`middleware/rate_limiter.py`)
- Prevents API abuse
- Configurable requests per minute limit
- User-based rate limiting

### Security Features

1. **Password Hashing**: bcrypt with salt
2. **JWT Tokens**: Secure token-based authentication
3. **Rate Limiting**: Prevents brute force attacks
4. **Security Headers**: XSS protection, content type options
5. **User Separation**: Database-level user isolation
6. **CORS Configuration**: Restricted to Angular frontend

### API Endpoints

- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - User logout
- `GET /api/chat-history` - Get user's chat history
- `GET /api/chat/{chat_id}` - Get specific chat
- `POST /api/chat` - Create new chat
- `POST /api/chat/{chat_id}/message` - Add message to chat

## Frontend (Angular)

### Authentication Flow

1. **Login**: User enters credentials
2. **Token Storage**: JWT token stored in localStorage
3. **Automatic Token Addition**: HTTP interceptor adds token to all requests
4. **Route Protection**: Auth guard protects routes
5. **Token Validation**: Automatic token expiration checking

### Key Components

#### AuthService (`services/auth.service.ts`)
- Login/logout functionality
- Token management
- User state management
- Token expiration checking

#### AuthInterceptor (`interceptors/auth.interceptor.ts`)
- Automatically adds JWT token to all HTTP requests
- Handles 401 errors by logging out user
- Centralized authentication logic

#### AuthGuard (`guards/auth.guard.ts`)
- Protects routes requiring authentication
- Checks token validity and expiration
- Redirects to login if unauthorized

### Security Features

1. **Automatic Token Addition**: No manual token handling needed
2. **Token Expiration**: Automatic logout on expired tokens
3. **Route Protection**: Guards prevent unauthorized access
4. **Error Handling**: Graceful handling of auth errors
5. **State Management**: Centralized user state

## Database Security

### User Separation

- All chats and messages are tied to specific users
- Database queries filter by `user_id`
- Foreign key constraints ensure data integrity
- Cascade deletes maintain consistency

### Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chats table with user ownership
CREATE TABLE chats (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table with chat ownership
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Testing

### User Separation Test

Run the test script to verify user isolation:

```bash
cd chatgpt-backend
python scripts/test_user_separation.py
```

This test verifies:
- Users can only access their own chats
- Users cannot access other users' data
- Proper authentication is required
- Rate limiting works correctly

## Environment Variables

### Backend (.env)

```env
SECRET_KEY=your-secret-key-here-change-in-production
DATABASE_URL=postgresql://username:password@localhost/dbname
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Security Best Practices

1. **Change Default Secret Key**: Always use a strong, unique secret key
2. **HTTPS in Production**: Use HTTPS for all API communications
3. **Token Expiration**: Set reasonable token expiration times
4. **Rate Limiting**: Configure appropriate rate limits
5. **Input Validation**: Validate all user inputs
6. **Error Handling**: Don't expose sensitive information in errors
7. **Regular Updates**: Keep dependencies updated
8. **Monitoring**: Monitor for suspicious activity

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS is configured for your frontend URL
2. **Token Expiration**: Check token expiration settings
3. **Database Connection**: Verify database connection string
4. **Rate Limiting**: Adjust rate limits if needed

### Debug Mode

Enable debug logging by setting environment variables:

```env
DEBUG=true
LOG_LEVEL=DEBUG
``` 