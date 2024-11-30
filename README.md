# HouseGenie

## A Household Services Management App

HouseGenie is a Python Flask application designed for managing household services. Developed as a project for IIT M MAD-I, this app enables users to manage profiles, services, and appointments within a clean, RESTful API.

### Table of Contents
- [Installation](#installation)
- [Configuration](#configuration)
- [ER Diagram](#er-diagram)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Dependencies](#dependencies)

---

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/rishi-the-programmer/HouseGenie.git
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

### ER Diagram
![Database ER Diagram](https://res.cloudinary.com/dnxfq38fr/image/upload/v1732920343/HouseGenie_IITM_MADI_Project/mxicfy6fllurad5ganhx.png)

### Usage

1. **Register as a Professional or Customer**:
   HouseGenie allows both customers and professionals to register and create profiles, each with specific endpoints.

2. **Login**:
   Obtain an access token by logging in, which will be used to authenticate further API requests.

3. **Manage Services**:
   Professionals can create and update services they provide, and customers can browse and book these services.

4. **Profile Visibility**:
   - Professional profiles are visible to admin and themselves but not by customer.
   - Customer profiles are are visible to admin and themselves but not by any professional.

### API Endpoints

| Endpoint                                                      | Method | Description                            |
|---------------------------------------------------------------|--------|----------------------------------------|
| `/api/signin`                                                 | POST   | User login                             |
| `/api/register`                                               | POST   | User registration                      |
| `/api/signout`                                                | POST   | User logout                            |
| `/api/services`                                               | GET    | List all services                      |
| `/api/services/<category>`                                    | GET    | List services by category              |
| `/api/service/<int:id>`                                       | GET    | Get service details                    |
| `/api/service_category`                                       | GET    | List service categories                |
| `/api/service_category/<int:id>`                              | GET    | Get category details                   |
| `/api/category/<int:id>`                                      | GET    | Get specific category details          |
| `/api/service_request`                                        | GET    | View service requests                  |
| `/api/service_request/<int:id>`                               | GET    | View specific service request          |
| `/api/service/<int:id>/book`                                  | POST   | Book a service                         |
| `/api/service_request/<int:id>/edit`                          | POST   | Edit a service request                 |
| `/api/service_request/<int:service_request_id>/assign/<int:professional_id>` | POST   | Assign service request to a professional |
| `/api/service_request/<int:id>/accept`                        | POST   | Accept a service request               |
| `/api/service_request/<int:id>/reject`                        | POST   | Reject a service request               |
| `/api/service_request/<int:id>/close`                         | POST   | Close a service request                |
| `/api/service_request/<int:id>/rate`                          | POST   | Rate a service request                 |
| `/api/professional/<int:id>/approve`                          | POST   | Approve professional profile           |
| `/api/service/<int:service_id>/professionals/<professionalType>` | GET    | List professionals for a service type  |
| `/api/edit_profile`                                           | POST   | Edit user profile                      |
| `/api/<user_type>/<int:id>/service_requests`                   | GET    | View user's service requests           |
| `/api/search`                                                 | GET    | Search for services or users           |
| `/api/summary`                                                | GET    | Get platform summary                   |
| `/api/<request_type>/<user_type>/<int:id>`                     | POST   | Ban or unban a user                    |
| `/api/service/<int:id>/reactivate`                            | POST   | Reactivate a service                   |

### Dependencies

- **Flask**: Micro web framework for building the application.
- **Flask-RESTful**: Adds support for quickly building REST APIs.
- **Flask-SQLAlchemy**: SQL toolkit and ORM for managing the database.
- **bcrypt**: For securely hashing and verifying passwords.
- **python-dotenv**: For managing environment variables in a `.env` file.
- **pyjwt**: JSON Web Token library for handling JWT-based authentication.