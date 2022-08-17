FROM nginx:stable-alpine@sha256:5bc90c961f2ef45c7ed6057e5c55e09d5f6b700a9d2e7e824c5e3709f329a61d

COPY ./dist/apps/detective-client /usr/share/nginx/html
COPY ./apps/detective-client/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY ./apps/detective-client/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
