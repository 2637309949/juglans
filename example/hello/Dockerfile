# build a nodejs image for docker
FROM node:8.1.4-alpine
# set localtime
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
# install pm2
RUN npm config -g set registry https://registry.npm.taobao.org
RUN npm i -g pm2