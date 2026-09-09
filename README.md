# MediNear

MediNear is a healthcare discovery and delivery platform for finding verified local pharmacies, comparing medicines, ordering essentials and tracking delivery.

## Current build

- React + Vite responsive customer experience
- Django REST Framework API
- JWT authentication endpoint
- Database-driven states, areas, categories, stores and medicines
- Medicine search and filtering API
- Customer order creation and order history API
- MySQL-ready configuration with SQLite development fallback
- Admin registration and demo data command

## Run the backend

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
python manage.py seed_demo
python manage.py runserver
```

Use `DATABASE_ENGINE=mysql` in `.env` with the MySQL credentials when MySQL is ready. Keep secrets out of source control.

## Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

The API health endpoint is available at `http://127.0.0.1:8000/api/health/`.

## Run both services with one command

From the project root:

```powershell
npm install
npm run dev
```

This starts Django at `http://127.0.0.1:8000/` and Vite at `http://127.0.0.1:5173/`. Press `Ctrl+C` once to stop both services.

## API surface

`GET /api/states/`, `GET /api/states/{id}/areas/`, `GET /api/stores/?area=Eluru`, `GET /api/medicines/?q=paracetamol`, `GET /api/categories/`, `POST /api/register/`, JWT login at `POST /api/login/`, and authenticated order endpoints under `/api/orders/`.

## Roadmap

Prescription file approval, cart persistence, payment gateway adapters, store-owner workflows, reviews, notifications, admin reports and GPS-based delivery tracking are the next modules.