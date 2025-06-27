
# DSK Kalmunai Backend API

This is the PHP backend for the DSK Kalmunai Divisional Secretariat management system.

## Setup Instructions

### 1. Database Configuration
1. Update the database credentials in `config/database.php`:
   - `$host` - Your cPanel database host (usually 'localhost')
   - `$db_name` - Your database name
   - `$username` - Your database username
   - `$password` - Your database password

### 2. cPanel Deployment
1. Upload the entire `backend` folder to your cPanel public_html directory
2. Ensure the database is created and populated with the provided SQL schema
3. Test the API endpoints

### 3. Frontend Configuration
Update your React frontend to point to your backend URL:
- Change API base URL to: `https://yourdomain.com/backend/api/`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Public Management
- `POST /api/public/create` - Create new public user
- `POST /api/public/scan` - Get user data by scanning QR code

### Registry Management
- `POST /api/registry/create` - Create registry entry and generate token

### System Data
- `GET /api/departments/list` - Get all active departments
- `GET /api/divisions/list` - Get divisions (optionally filtered by department)
- `GET /api/tokens/display` - Get current token queue for display

## Security Features
- CORS enabled for frontend communication
- Input validation and sanitization
- Prepared statements to prevent SQL injection
- Password hashing for user authentication

## File Structure
```
backend/
├── config/
│   ├── database.php     # Database connection
│   └── cors.php         # CORS configuration
├── api/
│   ├── auth/
│   │   └── login.php
│   ├── public/
│   │   ├── create.php
│   │   └── scan.php
│   ├── registry/
│   │   └── create.php
│   ├── departments/
│   │   └── list.php
│   ├── divisions/
│   │   └── list.php
│   └── tokens/
│       └── display.php
├── .htaccess           # URL rewriting and security
└── README.md
```

## Testing
Test each endpoint using tools like Postman or curl to ensure proper functionality before connecting the frontend.
