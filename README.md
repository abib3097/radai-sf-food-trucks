# SF Food Trucks

A full-stack application for exploring Mobile Food Facility permits in San Francisco, built using the [SF Open Data portal](https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data).
- I chose python + FastAPI + Swagger to encapsulate the backend solution because the API's needed could easily be modeled uising pandas, since the source was a csv file.
- For frontend, I chose to use a React + Typescript solution, along with Material UI as the component library
because I personally like MUI and have used it in the past. Other considerations were Tailwind
- I knew this was going to be a read-heavy system as the main goal is to pull and display data.
---


## Reviewer Setup

Before running the project, there are two things you'll need that aren't included in the repo:
- The dataset — download the CSV from the SF Open Data portal (Export → CSV) and place it at backend/app/data/food_trucks.csv. This is the only required step to get the app fully working.
- A Google Maps API key — this is completely optional. I added two internal functions to handle calculating
distances from a point. These were done using LLM and in no way my own implementations.
- Note: I build this app on Mac so the rest of the setup instructions are according to Mac(commands, directories, etc.). Feel free
to reach out to me for setup questions on Windows if needed.
---

## Getting Started

### Step 1 — Clone the repo
```bash
git clone https://github.com/your-username/sf-food-trucks.git
cd sf-food-trucks
```

### Step 2 — Add the dataset
Download the CSV from the [SF Open Data portal](https://data.sfgov.org/Economy-and-Community/Mobile-Food-Facility-Permit/rqzj-sfat/data) (Export → CSV) and place it at:
```
backend/app/data/food_trucks.csv
```

### Step 3 — Configure environment variables
```bash
cp .env.example .env
# GOOGLE_MAPS_API_KEY is optional — see Reviewer Setup above
```

---

### Option A: Run with Docker
**No Python installation required.** Docker bundles everything.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
docker-compose up --build
```

API available at: `http://localhost:8000`
Swagger docs at: `http://localhost:8000/docs`

---

### Option B: Run locally with Python
**Prerequisites:** Python 3.11+

```bash
cd backend
python3 -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000`
Swagger docs at: `http://localhost:8000/docs`

---

## Running Tests
```bash
cd backend
pytest tests/ -v
```
Note:
I added a `pytest.ini` file inside '/backend' to get the entire test suite to run in my IDE (Pycharm) 
you can also try running them individually in `test_trucks.py`
---

## Technical Tradeoffs

### Dataset: CSV vs Database
The SF permit dataset is ~500KB and relatively static.
Date last updated was 3/20/26 and 2/3/26 before that so I chose to load this dataset per app initialization. I felt using a db like PostgreSQL with PostGIS(lat/long benefits for spacial queries)
would have been overkill. Maybe in a production system and if we were dealing with millions of records or extended
this food truck app to more cities in US or world? 

### No Authentication
This API serves public data and does not require authentication. If extended to support user accounts, saved favorites, or admin actions, OAuth2 or API key auth should be added.

### No rate limiting

Right now anyone could hit this site as many times as they wanted. It would be a good load test to write a script to see
when/how the app might crash since it's setup with only basic API request handling. I would try to include
rate limits to hanlde cases like traffic spikes (For example let's say it's lunch time and people want to search for food trucks in this app at 12PM....Ahhhhhh)

---

## What's Not Included (and Why)

- **Pagination** — I could have added skip, offset, or limit for either frontend components or backend system
to reduce latency but chose not to because focus was on getting the app to run successfully. With more time
I would have thought about edge cases like all the records loading at once-which would have made me think about
implementing the above pagination techniques.
- **Caching** — not needed at this dataset size; would add Redis or an in-memory TTL cache for production
- **Search Optimizations** - Right now there is no rank/relevance in what a user types. I would maybe have included
some sort of better way of handling case sensitivities, relevance, etc.  