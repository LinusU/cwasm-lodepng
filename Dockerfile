FROM ubuntu:18.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  apt-get install -y ca-certificates curl git

########################
# Install WASI SDK 8.0 #
########################

RUN curl -L https://github.com/CraneStation/wasi-sdk/releases/download/wasi-sdk-8/wasi-sdk-8.0-linux.tar.gz | tar xz --strip-components=1 -C /

###########################
# Install binaryen 1.39.1 #
###########################

RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/1.39.1/binaryen-1.39.1-x86_64-linux.tar.gz | tar xz --strip-components=1 -C /usr/bin/

#####################
# Build actual code #
#####################

WORKDIR /code

RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout e34ac04553e51a6982ae234d98ce6b76dd57a6a1
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,--strip-all -- lodepng/lodepng.c

# Debug build
# RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,             -- lodepng/lodepng.c

RUN wasm-opt -Oz lodepng.wasm -o lodepng.wasm

CMD base64 --wrap=0 lodepng.wasm
