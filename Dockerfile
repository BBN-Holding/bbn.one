FROM nginx
COPY dist /usr/share/nginx/html
COPY default /etc/nginx/sites-available/default