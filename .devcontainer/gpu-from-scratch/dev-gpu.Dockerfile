# use nvidia cuda/cudnn image with miniconda on top
FROM gpuci/miniconda-cuda:11.4-devel-ubuntu20.04

# update GPG key and install linux development CLI tools
RUN apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2004/x86_64/3bf863cc.pub \
    && apt update \
    && apt install -y \
    git \
    make \
    sed \
    tmux \
    vim \
    wget

# Install the latest Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# allow history search in terminal
RUN echo "\"\e[A\": history-search-backward" > $HOME/.inputrc && echo "\"\e[B\": history-search-forward" $HOME/.inputrc

# move into the root user's home directory
WORKDIR /root

## FRONTEND
# install core React environment and core requirements, then remove build files
COPY ./frontend/package.json /root/frontend/
WORKDIR /root/frontend
RUN npm install && rm -rf /root/frontend/package.json

## BACKEND

# install core Python environment and system packages
COPY ./backend/Makefile /root/backend/
COPY ./backend/environment.yml /root/backend/
WORKDIR /root/backend
RUN make env

# switch to a login shell after cleaning up config:
#   removing error-causing line in /root/.profile, see https://www.educative.io/answers/error-mesg-ttyname-failed-inappropriate-ioctl-for-device
#   removing environment-setting in /root/.bashrc
RUN sed -i "s/mesg n || true/tty -s \&\& mesg n/" $HOME/.profile
RUN sed -i "s/conda activate base//" $HOME/.bashrc
SHELL ["conda", "run", "--no-capture-output", "-n", "dilemma", "/bin/bash", "-c"]

# install the core requirements, then remove build files
COPY ./backend/requirements /root/backend/requirements
RUN make install && rm -rf ./root/backend/Makefile /root/backend/requirements /root/backend/environment.yml

# add backend dir to PYTHONPATH so libraries are importable
ENV PYTHONPATH=/root/backend:$PYTHONPATH

# run all commands inside the conda environment
ENTRYPOINT ["conda", "run", "--no-capture-output", "-n", "dilemma", "/bin/bash"]