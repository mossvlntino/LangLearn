# Langlearn Mobile App

## Prerequisites

- **Flutter SDK**: Ensure Flutter is installed and configured (`flutter doctor`).
- **Backend Server**: The app requires the backend server to be running.

## 1. Start the Backend Server

Before running the mobile app, you must start the backend server.

1. Open a terminal in the root `langlearn` directory.
2. Run:
   ```bash
   npm start
   ```
   (Server runs at `http://localhost:3000`)

---

## 2. Run on Android Emulator

1.  **Navigate to this directory**:
    ```bash
    cd langlearn_mobile
    ```
2.  **Check available emulators**:
    ```bash
    flutter emulators
    ```
3.  **Launch an emulator** (replace `Pixel_8_android_13` with your emulator ID):
    ```bash
    flutter emulators --launch Pixel_8_android_13
    ```
4.  **Run the app**:
    ```bash
    flutter run
    ```
    _Note: The app is configured to use `http://10.0.2.2:3000` to connect to localhost from the Android emulator._

---

## 3. Run on Physical Device

1.  **Network Setup**: Ensure your phone and computer are on the same Wi-Fi network.
2.  **Get Computer IP**: Find your computer's local IP address (e.g., run `ipconfig` in a terminal).
3.  **Update API URL**:
    - Open `lib/services/api_service.dart`.
    - Change `http://10.0.2.2:3000` to `http://YOUR_IP_ADDRESS:3000`.
4.  **Connect & Run**:
    - Connect your phone via USB (ensure USB Debugging is enabled).
    - Run:
      ```bash
      flutter run
      ```
