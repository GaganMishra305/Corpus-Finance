# Corpus-Finance

Corpus Finance is an innovative project that transforms complex financial data into actionable insights through both interactive visualizations and engaging narrative storytelling. By leveraging corpus-based analysis, the project not only processes and analyzes financial documents using Jupyter Notebooks and Python but also converts the results into easy-to-understand, compelling stories using a custom script. These stories, alongside dynamic charts and dashboards, help investors and analysts quickly grasp a company’s performance, challenges, and future outlook.

## Features

- **Financial Data Analysis:**  
  Analyze financial documents, news articles, reports, and more using corpus-based techniques. The backend processes and organizes data from balance sheets, cash flows, financial statements, and key statistics.

- **Compelling Story Generation:**  
  Generate engaging company stories that explain a company’s journey—from its early success and rapid growth to its challenges and future outlook. The integrated `story.py` script leverages a detailed storytelling prompt and a Groq API call to convert complex financial data into a clear, narrative format.

- **Interactive Visualizations:**  
  The frontend provides dynamic charts and dashboards to help you explore and interpret the analysis results.

## Project Structure

While the backend provides the core functionality, the frontend (currently minimal) is planned to evolve into a full-featured user interface for interacting with the processed data.

## Features

- **Backend:**
  - Organized data and analysis directories (Data, Notebook, Prompts, analysis, src)
  - A main application file (`App.py`) to launch the backend server
  - Environment variable management via a `.env` file
  - Dependency management through `requirements.txt`
- **Frontend:**
  - Starter setup with initial configuration files
  - Ready for future integration of interactive visualization and user interaction components

## Project Structure

```
Corpus-Finance/
├── backend/
│   ├── Data/             # Contains raw and processed datasets
│   ├── Notebook/         # Jupyter notebooks for exploratory data analysis
│   ├── Prompts/          # Prompts for NLP or query-related tasks
│   ├── analysis/         # Analysis scripts and utilities
│   ├── src/              # Core source code for backend functionalities
│   ├── App.py            # Main application entry point
│   ├── requirements.txt  # Python dependencies list
│   ├── .env              # Environment configuration (ensure to create or update as needed)
│   └── .gitignore        # Files to ignore in Git
└── frontend/
    └── .gitignore        # Frontend Git ignore file (more files to be added as development progresses)
```

## Installation

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/GaganMishra305/Corpus-Finance.git
   cd Corpus-Finance/backend
   ```

2. **Create and activate a virtual environment:**

   - On macOS/Linux:

     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

   - On Windows:

     ```bash
     python -m venv venv
     venv\Scripts\activate
     ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables:**

   - Create a `.env` file in the backend folder (if not already present) and add necessary configuration variables (e.g., API keys, database URIs). You may refer to a sample `.env.example` if available.

5. **Run the Application:**

   ```bash
   python App.py
   ```

### Frontend Setup

- Currently, the frontend is in an early stage of development. As more files and features are added:
  1. Navigate to the `frontend` folder.
  2. Follow the setup instructions (to be updated) when a build process or package management (such as npm or yarn) is integrated.

## License

This project is licensed under the [MIT License](LICENSE) – feel free to use and modify it according to your needs.


