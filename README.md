
# Social Media App | Chattr

This project aims to create a basic social media platform where users can connect, follow each other, and share posts. It is a work in progress with ongoing development to add more features and enhance functionality.

## Tech Stack

**Client:**
- React:  JavaScript library for building user interfaces. 
- Vite: Fast build tool that supports modern JavaScript and TypeScript features.

**Server:** 
- Java: Programming language used for backend development.
- Spring Boot: Framework for creating Java applications.
- MongoDB: NoSQL database for data storage.


## Setup

To run this project locally, follow these steps:

### Back-end Setup

- Ensure you have Java 17 and Maven installed.
- Clone this repository:
   ```bash
   git clone https://github.com/samueldervishi1/social-media-app.git
   cd social-media-app
   cd server
   ```
### Build the project using Maven:
  ```bash
  mvn clean install
  ```

### Run the backend server:
  ```bash
  mvn spring-boot:run
  ```

### Frontend Setup
- Ensure you have Node.js and npm installed.
- Navigate to the frontend directory:
```bash
cd social-media-app
cd client
```

## Install dependencies:

```bash
npm install
```
Start the frontend development server:

```bash
npm run dev
```
- The frontend server will start on http://localhost:5173.

## Database Setup
- Configure MongoDB or your preferred database connection in the backend application properties.
 
    application.properties:
    - spring.data.mongodb.uri=mongodb+srv://<username>:<password>@<cluster-address>/<dbname>?retryWrites=true&w=majority&appName=<appName>
    - spring.data.mongodb.database=database name

## Usage
- Register as a new user or log in with existing credentials.
- Explore the app, interact with posts.
- Create new posts and share updates.
- Ask Questions: Enter your questions or queries into the chat interface.
- Get Responses: Receive responses from the chatbot based on the input provided.
- Engage in Conversation: Engage in conversations with the chatbot on various topics.

**Note:** Answers might not always be as expected as the chatbot is still under development and training.

## Contributing
Contributions are welcome! If you'd like to contribute to the project, please follow these steps:

- Fork the repository.
- Create a new branch (`git checkout -b feature/my-feature`).
- Make your changes and commit them (`git commit -am 'Add new feature'`).
- Push to the branch (`git push origin feature/my-feature`).
- Create a new Pull Request.

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

For inquiries or support, please contact [samueldervishi02@gmail.com](mailto:samueldervishi02@gmail.com).
