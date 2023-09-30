FROM nginx
COPY dist /usr/share/nginx/html
COPY default.conf /etc/nginx/sites-available