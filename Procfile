release: python manage.py migrate
web: npm install && npm run build && gunicorn memword.wsgi --log-file -
