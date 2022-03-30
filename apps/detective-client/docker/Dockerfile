FROM nginx:alpine
RUN apk update && apk upgrade

COPY ./dist/apps/detective-client /usr/share/nginx/html

EXPOSE 80
