# build a nodejs image for docker
FROM node:8.1.4-alpine

# set localtime
RUN apk update && apk add python make tzdata \
    && rm -f /etc/localtime \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# set taobao registry
RUN npm config -g set registry https://registry.npm.taobao.org

# copt project
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY . .

# run 
EXPOSE 3001
CMD [ "web" ]
