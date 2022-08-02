FROM nginx:stable-alpine@sha256:1aeb5626e29b4f463ce25fc4b07c85eb231f50494d2f46d9184153a4e938302e

COPY ./dist/apps/detective-client /usr/share/nginx/html
COPY ./apps/detective-client/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY ./apps/detective-client/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
