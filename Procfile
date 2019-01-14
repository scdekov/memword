release: python manage.py migrate
web: gunicorn memword.wsgi --log-file -
buildstatic: npm install && npm run build
