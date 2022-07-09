FROM nginx:stable-alpine@sha256:c90af9c78715f71ade64037ca54d3a0c0b6814362594b13643d03c5110085375

COPY ./dist/apps/detective-client /usr/share/nginx/html
COPY ./apps/detective-client/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY ./apps/detective-client/docker/nginx.conf /etc/nginx/nginx.conf
