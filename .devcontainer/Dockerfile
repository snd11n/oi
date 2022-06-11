FROM ubuntu:latest

ENV METEOR_ALLOW_SUPERUSER=true

RUN apt update && apt install -y curl git
RUN curl https://install.meteor.com/ | sh

WORKDIR /opt/workspace
