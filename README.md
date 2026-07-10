# AI Study Assistant

AI Study Assistant is a web-based learning platform that allows students to upload study materials and use AI to ask questions, generate summaries, create practice exams, and receive automated feedback.

## Prerequisites

Before running the project, make sure the following are installed:

* Node.js
* npm

An active internet connection is required.

## Environment Variables

The required environment configuration files are included in the submitted ZIP file and contain all credentials needed to run the project. No additional API keys or external service accounts need to be created.

## Installation and Running

After extracting the ZIP file, open two separate terminals.

### Backend

```bash
cd backend
npm install
node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Both terminals must remain open while using the application.

After running the Frontend, open the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

## Notes

The submitted ZIP does not include generated dependencies or build files such as `node_modules`, `dist`, or `build`. All required dependencies are installed using `npm install`.
