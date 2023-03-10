# pinterest-clonePinterest Clone
This project is a Pinterest clone built in  (MySQl, Express, Node.js) 

Features
- User authentication and authorization using JWT tokens
- Board and pin creation, editing, and deletion
## Getting Started
To get started with the app, you'll need to have Node.js and MySQL installed on your machine.

## Installation
1. Clone the repo to your local machine: git clone https://github.com/omarsabra1/pinterest-clone.git

2. Install the dependencies using NPM:` cd pinterest-clone && npm install`

3. Create a .env file in the root directory and add the following environment variables:

```bash
DATABASE_URL=<mongo_db_uri>
JWT_SECRET=<jwt_secret>
EMAIL_PASS=<EMAIL_CONFIG>
```
4. Start the development server: `npm run` 

## Usage
Once the server is running, you can access the app by visiting `http://localhost:3000` in your browser. You can create a new account or use the following credentials to log in:

License
This project is licensed under the MIT License. See the LICENSE file for more information.