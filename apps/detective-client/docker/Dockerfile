FROM nginx:stable-alpine@sha256:43cd1aa2a26fbe7e6a4f9ba6cc289ea885731fbafe078b62983325a60c8c2c56

COPY ./dist/apps/detective-client /usr/share/nginx/html
COPY ./apps/detective-client/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY ./apps/detective-client/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
