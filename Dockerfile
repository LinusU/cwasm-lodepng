FROM ubuntu:20.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  apt-get install -y ca-certificates curl git

#########################
# Install WASI SDK 12.0 #
#########################

RUN curl -L https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-12/wasi-sdk-12.0-linux.tar.gz | tar xzk --strip-components=1 -C /

#########################
# Install binaryen v101 #
#########################

RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_101/binaryen-version_101-x86_64-linux.tar.gz | tar xzk --strip-components=1 -C /

#####################
# Build actual code #
#####################

WORKDIR /code

RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout 8c6a9e30576f07bf470ad6f09458a2dcd7a6a84a
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,--strip-all -- lodepng/lodepng.c

# Debug build
# RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--export=malloc,--export=free,--export=lodepng_decode32,             -- lodepng/lodepng.c

RUN wasm-opt -Oz lodepng.wasm -o lodepng.wasm

CMD base64 --wrap=0 lodepng.wasm
