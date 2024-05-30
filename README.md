This project uses AI and computer vision to track your exercises. It is based on an original project from https://github.com/Gabbosaur and has been improved with additional features and optimizations.


## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [npm](https://npmjs.com/) (normally comes with Node.js)

## Database Setup

1. **Create the Database and Tables:**
   - Start your PostgreSQL command line client.
   - Run the following SQL commands to create your database and tables:

   ```sql
   CREATE DATABASE calisthenics;

   \c calisthenics

Then run the commands in the database.sql script located in the project folder to create all the nessecary tables for the leaderboard.


Modify Database Connection Settings:
Open the server file where the PostgreSQL pool is configured.
Adjust the user, password, host, database, and port fields to match your PostgreSQL setup.
Running the Server
Install Dependencies:

Navigate to the directory containing your server file.
Run the following command to install the necessary npm packages:
Copy code
npm install
Start the Server:

In the same directory, start the server using:
sql
Copy code
npm start
Accessing the Application:

Open index.html in your web browser to interact with the application.
The server runs on http://localhost:3000 by default, and API endpoints can be accessed through this URL.
