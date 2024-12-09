FROM debian:stable-slim

ENV VOLTA_FEATURE_PNPM=1

# bash will load volta() function via .bashrc 
# using $VOLTA_HOME/load.sh
SHELL ["/bin/bash", "-c"]

# since we're starting non-interactive shell, 
# we wil need to tell bash to load .bashrc manually
ENV BASH_ENV=~/.bashrc
# needed by volta() function
ENV VOLTA_HOME=/home/node/.volta

RUN groupadd --gid 1000 node && \
    useradd --uid 1000 --gid node --shell /bin/bash --create-home node && \
    apt-get update && apt-get install -y bash curl git jq sudo unzip && \
    curl https://get.volta.sh | bash && \
    echo 'node ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers


# make sure packages managed by volta will be in PATH
ENV PATH=$VOLTA_HOME/bin:$PATH
ENV PNPM_HOME="/pnpm-bin"
ENV PATH="$PNPM_HOME:$PATH"

RUN chown -R node:node $VOLTA_HOME 
USER node
WORKDIR /workspace
RUN volta install node@lts && \
    volta install pnpm@latest && \
    volta setup && \
    npm install --global http-server