# Job Scraper & Auto-Applier: Full-Stack Edition 🚀

This project has evolved into a full-stack application designed to automate the job application process. It combines a powerful Python backend for web scraping and auto-applying with a modern React frontend for an intuitive user interface.

## ✨ Features

*   **Automated Job Search:** Scrapes job listings from Glassdoor (extendable to other platforms).
*   **Auto-Apply Functionality:** Automatically fills out and submits job applications on platforms like Greenhouse and Lever.
*   **User-Friendly Interface:** A React-based web application to control the scraping and application process.
*   **Scheduler:** Program applications to run in batches at set intervals.
*   **Activity Log:** Tracks the progress and status of scraping and application tasks.

## 🏗️ Architecture

The application consists of two main parts:

1.  **Python Backend (Flask):**
    *   Handles the core logic for web scraping (`get_links.py`) and automated job application (`apply.py`) using Selenium.
    *   Exposes a REST API (using Flask) to allow the frontend to trigger these actions and receive results.
    *   Manages browser automation (e.g., logging in, navigating pages, filling forms).

2.  **React Frontend:**
    *   Provides a graphical user interface for users to input job search criteria, monitor application progress, and configure the application scheduler.
    *   Communicates with the Python backend via HTTP requests (`fetch` API).

## 🚀 Getting Started

Follow these steps to set up and run the application on your local machine.

### Prerequisites

*   **Python 3.8+:** [Download Python](https://www.python.org/downloads/)
*   **Node.js & npm:** [Download Node.js](https://nodejs.org/en/download/) (npm is included)
*   **ChromeDriver:** Selenium requires a WebDriver to interact with browsers.
    *   Download the appropriate ChromeDriver version for your Chrome browser: [ChromeDriver Downloads](https://chromedriver.chromium.org/downloads)
    *   Place the `chromedriver` executable in a known location (e.g., `/usr/local/bin/chromedriver` on macOS/Linux, or a specific path on Windows). You might need to update the `driver_path` in `get_links.py` and `apply.py` (or pass it via the API if you extend the frontend).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository_url>
    cd auto-apply-job-scraper # Or your project's root directory
    ```

2.  **Backend Setup (Python):**
    *   **Create a Python Virtual Environment:**
        ```bash
        python -m venv venv
        ```
    *   **Activate the Virtual Environment:**
        *   **Windows:** `.\venv\Scripts\activate`
        *   **macOS/Linux:** `source venv/bin/activate`
    *   **Install Python Dependencies:**
        ```bash
        pip install -r requirements.txt
        ```
        (The `requirements.txt` file should contain `Flask`, `Flask-Cors`, `Selenium`, `beautifulsoup4`).

3.  **Frontend Setup (React):**
    *   **Install Node.js Dependencies:**
        ```bash
        npm install
        ```

### Running the Application

1.  **Start the Python Backend Server:**
    *   Ensure your Python virtual environment is activated.
    *   From the project root directory, run:
        ```bash
        python server.py
        ```
    *   The server will run on `http://localhost:5000`. Keep this terminal window open.

2.  **Start the React Frontend Development Server:**
    *   Open a **new terminal window**.
    *   Navigate to the project root directory.
    *   Run:
        ```bash
        npm start
        ```
    *   This will open the React application in your browser (usually at `http://localhost:3000`).

## ⚙️ Configuration

*   **Resume Path:** In `src/App.tsx`, locate the `runApplicationBatch` function. You **must** update the `resume_path` to the absolute path of your `resume.pdf` file.
*   **Personal Details:** In `src/App.tsx`, within the `runApplicationBatch` function, update the placeholder personal details (e.g., `full_name`, `email`, `linkedin_profile`) with your actual information. Ideally, these would be managed via a user profile in the UI.

## Usage

1.  **Search for Vacancies:**
    *   In the frontend, enter your desired keywords and location.
    *   Click "Buscar Vacantes" (Search Vacancies).
    *   The application will scrape Glassdoor and display the found job links.

2.  **Auto-Apply:**
    *   Once vacancies are listed, configure the "Programador de Aplicaciones" (Application Scheduler) with the desired batch size and interval.
    *   Click "Iniciar" (Start) to begin the automated application process.
    *   The application will open browser windows and attempt to apply to jobs in batches.

## ⚠️ Important Notes

*   **Login to Glassdoor:** When the Selenium browser window opens for scraping, you might need to manually log in to Glassdoor if prompted.
*   **CAPTCHAs/Manual Intervention:** Automated processes can sometimes be interrupted by CAPTCHAs or other security measures. Be prepared for occasional manual intervention.
*   **Development Server:** The Python Flask server is for development purposes only. Do not use it in a production deployment.

## 🙏 Thanks

*   [Selenium](https://selenium-python.readthedocs.io/) - For browser automation.
*   [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/doc) - For parsing HTML content.
*   [Flask](https://flask.palletsprojects.com/) - For the Python web framework.
*   [React](https://react.dev/) - For the frontend UI.

## 📚 Learn More

*   [Original YouTube Tutorial](https://youtu.be/N_7d8vg_TQA) - For background on the initial Python script.

## License

This project is licensed under the MIT License - see the [LICENSE.md](https://github.com/harshibar/5-python-projects/blob/master/LICENSE) file for details.