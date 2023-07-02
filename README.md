# Pinterest-clone Overview
This project is a Pinterest clone you can share your photos and create favorite friends 

## Technologies Used
- `JavaScript`
- `Express`: Fast, unopinionated, minimalist web framework for Node.js
- `MySQL`: a relational database management system.
- `Prisma`: an open-source database ORM (Object-relational mapping).

## Getting Started
To get started with the app, you'll need to have Node.js and MySQL installed on your machine.

## Installation
1. Clone the repo to your local machine: `git clone https://github.com/omarsabra1/pinterest-clone.git`.

2. Install the dependencies using NPM: ` cd pinterest-clone `

3. Install the necessary dependencies: `npm install`.

## Running the Application

- To run the app in development mode, use: `npm run dev`.
- To run the app in production mode, use: `npm run start`.

## Code Structure

The application code is organized as follows:
- `app.js`: The entry point of the application.
- `prisma/db.js`: he makes a Prisma Client to connect to the Database.
- `controller/comments.js`: Manages the creation of comments and operations.
- `controller/user.js`: Manages user authentication and creation.
- `controller/pin.js`: Mange pin(posts/photos) and creation.
- `middleware/isAuth.js`: Verifies JWT tokens.

## License
Pinterest-clone is [MIT licensed](LICENSE.txt).

## Contact Information
Feel free to reach out on LinkedIn or via email.