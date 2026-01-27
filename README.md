# InkluLearn - Accessible Education Platform

This project is a Next.js web application with a Python FastAPI backend for AI features (Speech-to-Text, etc.).

## 🚀 How to Run Only This Project

Follow these steps to set up and run the project after downloading/unzipping.

### 1. Prerequisites
Ensure you have the following installed on your computer:
- **Node.js**: [Download Here](https://nodejs.org/) (Version 18 or higher recommended)
- **Python**: [Download Here](https://www.python.org/downloads/) (Version 3.8 or higher)

---

### 2. Setup Environment Variables
Create a file named `.env.local` in the root folder (`uhack-app/`) and add the following keys. 
You will need your own API keys for AI features.

```env
# Database (Defaults to local file if not set)
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any_random_secret_string

# AI Keys (Required for Chat & Tutor)
GEMINI_API_KEY=your_google_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
```

> **Note:** If you don't have a MongoDB URL, the app will automatically use a local file (`data/users.json`) to store user accounts.

---

### 3. Install & Run Backend (Python)
This handles Speech-to-Text and other AI tasks.

1. Open a terminal (Command Prompt or PowerShell).
2. Navigate to the backend folder:
   ```bash
   cd uhack-backend
   ```
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Python server:
   ```bash
   python main.py
   ```
   *Keep this terminal window open.*

---

### 4. Install & Run Frontend (Next.js)
This runs the main website.

1. Open a **new** terminal window.
2. Navigate to the main project folder (`uhack-app`):
   ```bash
   # If you are not already there
   cd uhack-app
   ```
3. Install Node dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### 5. Open the App
Open your browser and go to: [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Troubleshooting
- **"Module not found"**: Make sure you ran `npm install` in the `uhack-app` folder.
- **Backend Error**: Make sure the Python server is running in a separate terminal.
- **Login fails**: If using MongoDB, check your connection string. If not, check `data/users.json` permissions.
