# HouseGenie

## A Household Services Management App

HouseGenie is a Python Flask application designed for managing household services. Developed as a project for IIT M MAD-I, this app enables users to manage profiles, services, and appointments within a clean, RESTful API.

### Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)
- [Contributing](#contributing)

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rishi-the-programmer/HomeGenie.git
   cd HouseGenie
   ```

2. **Set Up a Virtual Environment**:
   Create a virtual environment to manage dependencies:
   ```bash
   python3 -m venv .
   source bin/activate  # On Windows use: Scripts\activate
   ```

3. **Install Dependencies**:
   Install all the required packages using pip:
   ```bash
   pip install -r requirements.txt
   ```

### Configuration

1. **Environment Variables**:
   Configure the environment by creating a `.env` file in the `Code` directory to specify environment-specific variables, such as database URI and JWT secret. Use [`example.env`](Code/example.env) in the `Code` folder as a template for setting up environment variables.

   Copy `example.env` to `.env`:
   ```bash
   cp Code/example.env Code/.env
   ```

   Update the `.env` file with your actual configurations:
   ```plaintext
   DATABASE_URI="your-database-uri"  # if its in cloud or present in any other location or place a database.sqlite3 file in `Code` directory

   JWT_SECRET_KEY="your-jwt-secret-key"
   ```

2. **Configure Database URI**:
   Ensure that the `DATABASE_URL` in `.env` points to your chosen database. For development, SQLite (`sqlite:///housegenie.sqlite3`) is easy to set up, but for deployment, consider a production-grade database (e.g., PostgreSQL, MySQL).

3. **Run the Application**:
   Start the Flask development server:
   ```bash
   python main.py
   ```

   Your app should now be running locally at `http://127.0.0.1:5000` or as specified in the terminal output.

### Usage

1. **Register as a Professional or Customer**:
   HouseGenie allows both customers and professionals to register and create profiles, each with specific endpoints.

2. **Login**:
   Obtain an access token by logging in, which will be used to authenticate further API requests.

3. **Manage Services**:
   Professionals can create and update services they provide, and customers can browse and book these services.

4. **Profile Visibility**:
   - Professional profiles are public.
   - Customer profiles are private and viewable only by the customer.

### API Endpoints

Here are some key API endpoints and actions:

| Endpoint               | Method | Description                                 |
|------------------------|--------|---------------------------------------------|
| `/api/register`        | POST   | Register a new customer or professional     |
| `/api/login`           | POST   | Login to obtain a JWT token                 |
| `/api/service_category` | POST  | Create new service categories (admin only)  |
| `/api/services`        | GET    | List all available services                 |
| `/api/services`        | POST   | Add a new service (admin only)              |

### Dependencies

- **Flask**: Micro web framework for building the application.
- **Flask-RESTful**: Adds support for quickly building REST APIs.
- **Flask-SQLAlchemy**: SQL toolkit and ORM for managing the database.
- **bcrypt**: For securely hashing and verifying passwords.
- **python-dotenv**: For managing environment variables in a `.env` file.
- **pyjwt**: JSON Web Token library for handling JWT-based authentication.

### Contributing

Feel free to open issues or submit pull requests to enhance the project. Contributions to improve features or documentation are welcome!