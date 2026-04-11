# days

## Tech Stack

Django
Next.js
PostgreSQL

## Why Django AND Next.js?


## Notes

permission denied for schema public

GRANT ALL ON SCHEMA public TO daysuser;
GRANT ALL PRIVILEGES ON DATABASE days TO daysuser;
ALTER DATABASE days OWNER TO daysuser;


### Backend

cd /home/debian/days/backend
source .venv/bin/activate
pip install -r requirements.txt
python3 manage.py migrate
python3 manage.py collectstatic --noinput
sudo systemctl restart django-gunicorn

### Frontend

cd /home/debian/days/frontend
npm install
npm run build
pm2 restart nextjs