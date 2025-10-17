# ------------------------------
# INSTALLING DEPENDENCIES AND PACKAGING
# ------------------------------
FROM node:18-alpine as builder
# install and cache app dependencies
ARG APP_ENV=dev
ENV APP_ENV=${APP_ENV}

COPY package.json yarn.lock ./
RUN yarn && mkdir /student-web && mv ./node_modules ./student-web
WORKDIR /student-web
COPY . .
RUN export NODE_OPTIONS="--max-old-space-size=8192" && yarn run build:student:${APP_ENV}

FROM nginx:1.16.0-alpine as runner
COPY --from=builder /student-web/dist/apps/student-web /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./docker/student-web/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
