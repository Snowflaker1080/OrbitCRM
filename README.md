# Orbit CRM – Front-End

![Orbit CRM Logo](./src/assets/orbit-logo.png)

Orbit CRM is a personal CRM web app built with React.  
It helps you organise your cohorts, friend groups, and professional networks, and keep track of personal connections.

---

## 🌐 Live Demo

- **Deployed App**: [Orbit CRM Live](https://your-deployed-app-link.com)  
- **Back-End Repo**: [Orbit CRM API](https://github.com/Snowflaker1080/OrbitCRM/tree/main/CRM-express-api-back-end)  
- **Planning Materials**: [Trello / Figma / ERD links]

---

## ✨ Features

- JWT-based sign up, sign in, sign out  
- Create, update, delete groups (cohorts, networks, friend circles)  
- Add and edit contacts with details (name, location, characteristics)  
- Social links support: Website, LinkedIn, Twitter/X, Instagram, Facebook, GitHub  
- Assign contacts to multiple groups  
- Global contact list with sort options (first/last name)  
- Set connection reminders (weekly, monthly, yearly)  
- Fully responsive UI  

---

## 🛠 Technologies Used

- React (Vite)  
- React Router  
- Zustand (auth + state management)  
- Axios (API requests)  
- CSS Flexbox/Grid  

---

## 🚀 Getting Started

### 1. Clone Repository

bash
git clone https://github.com/your-username/orbit-crm-front-end.git
cd orbit-crm-front-end

### 2. Install Dependencies

bash
npm install

### 3. Environment Variables

Create .env in the project root:

env
VITE_API_URL=http://localhost:3000/api

### 4. Start Development Server

bash
npm run dev

Runs on http://localhost:5173.

Attributions
	•	Icons: Lucide
	•	React & Vite docs

📌 Next Steps
	•	Mobile app version (React Native)
	•	Calendar integration for reminders
	•	Duplicate contact merge

 ---


# Orbit CRM – Back-End API

Orbit CRM API powers the Orbit personal CRM.  
Built with Node.js, Express, and MongoDB, the API provides secure endpoints for authentication and full CRUD operations on users, groups, and contacts.

---

## 🔗 Related

- **Front-End Repo**: [Orbit CRM Client](https://github.com/your-username/orbit-crm-front-end)

---

## ✨ Features

- JWT Authentication (sign up, sign in, sign out)  
- User authorisation (only the creator can update/delete their data)  
- RESTful CRUD routes for:  
  - **Users**  
  - **Groups** (cohorts, networks, friend groups)  
  - **Contacts** (with location, social links, reminders)  
- Password hashing with bcrypt  
- Middleware for verifying JWT tokens  

---

## 🛠 Technologies Used

- Node.js  
- Express.js  
- MongoDB + Mongoose  
- JWT (jsonwebtoken)  
- bcrypt  
- cors, morgan, dotenv  

---

## 🚀 Getting Started

### 1. Clone Repository

bash
git clone https://github.com/your-username/orbit-crm-back-end.git
cd orbit-crm-back-end

2. Install Dependencies

3. Environment Variables

4. Start API Server

📡 Example API Routes

POST /api/auth/sign-up → Create new user
POST /api/auth/sign-in → Authenticate user and return JWT
GET /api/users/me → Get current user profile
POST /api/groups → Create a group
POST /api/contacts → Create a contact

🔒 Authentication & Authorisation
	•	Guests: only sign up / sign in
	•	Signed-in users: can create and manage their own groups and contacts
	•	Users cannot edit or delete data created by others

⚖️ Licence

MIT Licence.

