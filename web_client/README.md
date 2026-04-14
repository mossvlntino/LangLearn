# Langlearn Web Client

## Prerequisites

- **Node.js**: Required to run the backend server.
- **Backend Server**: The web client requires the backend server to be running to function correctly.

## Setup & Running

1.  **Start the Backend Server**

    - Open a terminal in the root `langlearn` directory.
    - Run the following command:
      ```bash
      npm start
      ```
    - The server will start at `http://localhost:3000`.

2.  **Launch the Web Client**
    - You can open the `web_index.html` file directly in your browser.
    - Alternatively, from this `web_client` directory, run:
      ```bash
      start web_index.html
      ```

## Configuration

- **API URL**: The web client connects to the backend via `web_config.js`. Ensure `API_BASE_URL` is set to:
  ```javascript
  const API_BASE_URL = "http://localhost:3000";
  ```
