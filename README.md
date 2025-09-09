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

	git clone CRM-react-front-end
	cd orbit-crm-front-end

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


---
# Orbit CRM – Back-End API
---

Orbit CRM API powers the Orbit personal CRM.  
Built with Node.js, Express, and MongoDB, the API provides secure endpoints for authentication and full CRUD operations on users, groups, and contacts.

## Related

- **Front-End Repo**: [Orbit CRM Client](CRM-react-front-end)

## Features

- JWT Authentication (sign up, sign in, sign out)  
- User authorisation (only the creator can update/delete their data)  
- RESTful CRUD routes for:  
  - **Users**  
  - **Groups** (cohorts, networks, friend groups)  
  - **Contacts** (with location, social links, reminders)  
- Password hashing with bcrypt  
- Middleware for verifying JWT tokens  

## Technologies Used

- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT (jsonwebtoken)  
- bcrypt  
- cors, morgan, dotenv  

## Next Steps

- Mobile app version (React Native)  
- Calendar integration for reminders  
- Duplicate contact merge  

## Getting Started

### 1. Clone Repository

bash
git clone CRM-express-api-back-end
cd orbit-crm-back-end

2. Install Dependencies
   
	```bash
	npm install
	
4. Environment Variables
   Create .env in the project root:

 	```bash
   	PORT=3000
	MONGODB_URI=mongodb://localhost:27017/OrbitCRMDatabase
	JWT_SECRET=your-super-secret-key

6. Start API Server

 	```bash
   	npm run dev   # development (nodemon)
	npm start     # production

  Runs on http://localhost:3000.

## Example API Routes

- POST /api/auth/sign-up → Create new user
- POST /api/auth/sign-in → Authenticate user and return JWT
- GET /api/users/me → Get current user profile
- POST /api/groups → Create a group
- POST /api/contacts → Create a contact

## Authentication & Authorisation

  Guests: only sign up / sign in
  Signed-in users: can create and manage their own groups and contacts
  Users cannot edit or delete data created by others

## Licence

MIT Licence

