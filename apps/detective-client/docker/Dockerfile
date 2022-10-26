FROM nginx:stable-alpine@sha256:58edf9ad7347729e4a780739ac0225daf025ca699053a598aa28c12152b39a51

COPY ./dist/apps/detective-client /usr/share/nginx/html
COPY ./apps/detective-client/docker/security-headers.conf /etc/nginx/security-headers.conf
COPY ./apps/detective-client/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
