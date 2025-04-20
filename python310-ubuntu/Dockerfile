FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 python3-pip && \
    ln -s /usr/bin/python3 /usr/local/bin/python && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
CMD ["python", "--version"]

