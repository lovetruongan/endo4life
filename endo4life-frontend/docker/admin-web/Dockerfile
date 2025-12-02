# ------------------------------
# INSTALLING DEPENDENCIES AND PACKAGING
# ------------------------------
FROM node:18-alpine as builder
# install and cache app dependencies
ARG APP_ENV=dev
ENV APP_ENV=${APP_ENV}

COPY package.json yarn.lock ./
RUN yarn && mkdir /admin-web && mv ./node_modules ./admin-web
WORKDIR /admin-web
COPY . .
RUN rm -rf .nx/cache && export NODE_OPTIONS="--max-old-space-size=8192" && yarn run build:admin:${APP_ENV}

FROM nginx:1.16.0-alpine as runner
COPY --from=builder /admin-web/dist/apps/admin-web /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY ./docker/admin-web/nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
