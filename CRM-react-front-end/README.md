# Orbit CRM – Front-End
<img width="1024" height="1024" alt="Orbit CRM Logo" src="https://github.com/user-attachments/assets/dc956bb5-0492-4a34-a3fa-e61b72495b0c" />

Orbit CRM is a personal CRM web app built with React.  
It helps you organise your cohorts, friend groups, and professional networks, and keep track of personal connections.
<img width="1038" height="610" alt="Screenshot 2025-09-09 at 22 51 02" src="https://github.com/user-attachments/assets/553a9c41-f682-4dc5-a11b-60cac259d72d" />

## Live Demo

- **Deployed App**: [Orbit CRM Live](https://your-deployed-app-link.com)  
- **Back-End Repo**: [Orbit CRM API](https://github.com/Snowflaker1080/OrbitCRM/tree/main/CRM-express-api-back-end)
- **Planning Materials**: [Project Planning & Set Up, Entity Relationship Diagram](https://www.icloud.com/freeform/0ebUKyiuoFa1LGwG5bNxzgkJQ#Personal_CRM_Project)

## Features

- JWT-based sign up, sign in, sign out  
- Create, update, delete groups (cohorts, networks, friend circles)  
- Add and edit contacts with details (name, location, characteristics)  
- Social links support: Website, LinkedIn, Twitter/X, Instagram, Facebook, GitHub  
- Assign contacts to multiple groups  
- Global contact list with sort options (first/last name)  
- Set connection reminders (weekly, monthly, yearly)  
- Fully responsive UI  

## Technologies Used

- React (Vite)  
- React Router  
- Zustand (auth + state management)  
- Axios (API requests)  
- CSS Flexbox/Grid  

## Getting Started

### 1. Clone Repository

	git clone https://github.com/Snowflaker1080/OrbitCRM.git
	cd CRM-react-front-end

### 2. Install Dependencies

	npm install

### 3. Environment Variables

Create .env in the project root:

	env
	VITE_API_URL=http://localhost:3000/api

### 4. Start Development Server

	npm run dev

Runs on http://localhost:5173.

Attributions
	•	Icons: Lucide
	•	React & Vite docs

Next Steps
	•	Mobile app version (React Native)
	•	Calendar integration for reminders
	•	Duplicate contact merge
