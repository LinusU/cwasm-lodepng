FROM ubuntu:18.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  apt-get install -y ca-certificates curl git

########################
# Install WASI SDK 3.0 #
########################

RUN curl -L https://github.com/CraneStation/wasi-sdk/releases/download/wasi-sdk-3/wasi-sdk-3.0-linux.tar.gz | tar xz --strip-components=1 -C /

#####################
# Build actual code #
#####################

WORKDIR /code

RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout 941de186edfc68bca5ba1043423d0937b4baf3c6
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN /opt/wasi-sdk/bin/clang --sysroot=/opt/wasi-sdk/share/sysroot --target=wasm32-unknown-wasi -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,--strip-all -- lodepng/lodepng.c

# Debug build
# RUN /opt/wasi-sdk/bin/clang --sysroot=/opt/wasi-sdk/share/sysroot --target=wasm32-unknown-wasi -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,             -- lodepng/lodepng.c

CMD base64 --wrap=0 lodepng.wasm
