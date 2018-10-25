# build a nodejs image for docker
FROM node:8.1.4-alpine

# set localtime
RUN apk update && apk add python make tzdata \
    && rm -f /etc/localtime \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# copt project
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .

# run 
EXPOSE 3001
EXPOSE 3000
CMD ./web
