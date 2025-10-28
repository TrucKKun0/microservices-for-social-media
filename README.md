# Microservices Architecture

A microservices-based application with API Gateway and Identity Service.

## Services

### 1. API Gateway
- Entry point for all client requests
- Routes requests to appropriate microservices
- Rate limiting and security features
- Port: 3000

### 2. Identity Service
- User authentication and authorization
- User registration and login
- JWT token generation
- Refresh token management
- Port: 3001

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Redis** - Caching and rate limiting
- **Mongoose** - MongoDB ODM
- **Argon2** - Password hashing
- **JWT** - Token-based authentication
- **Winston** - Logging
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd microservices
```

2. Install dependencies for each service:
```bash
# Install API Gateway dependencies
cd api-gateway
npm install

# Install Identity Service dependencies
cd ../identity-services
npm install
```

3. Set up environment variables:

Create `.env` file in each service directory:

**api-gateway/.env:**
```
PORT=3000
REDIS_URL=redis://localhost:6379
IDENTITY_SERVICE_URL=http://localhost:3001
```

**identity-services/.env:**
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/your-database
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

## Running the Services

### Development Mode

Start each service in separate terminals:

```bash
# Terminal 1 - API Gateway
cd api-gateway
npm run dev

# Terminal 2 - Identity Service
cd identity-services
npm run dev
```

## API Endpoints

### Authentication

**Register User**
```
POST /v1/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

## Project Structure

```
microservices/
├── api-gateway/
│   ├── src/
│   │   └── server.js
│   ├── utils/
│   └── package.json
├── identity-services/
│   ├── src/
│   │   └── server.js
│   ├── controllers/
│   │   └── identity-controller.js
│   ├── models/
│   │   ├── users.js
│   │   └── refreshToken.js
│   ├── routes/
│   │   └── identity-service.js
│   ├── middlewares/
│   │   └── errorHandlers.js
│   ├── utils/
│   │   ├── validation.js
│   │   ├── generateToken.js
│   │   └── loggers.js
│   └── package.json
└── README.md
```

## Security Features

- Rate limiting (DDOS protection)
- Helmet.js for security headers
- Password hashing with Argon2
- JWT-based authentication
- Input validation with Joi
- CORS enabled

## License

MIT

