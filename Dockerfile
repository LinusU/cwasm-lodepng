FROM ubuntu:22.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git libxml2

#########################
# Install WASI SDK 16.0 #
#########################

RUN curl -L https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-16/wasi-sdk-16.0-linux.tar.gz | tar xzk --strip-components=1 -C /

#########################
# Install binaryen v110 #
#########################

RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_110/binaryen-version_110-x86_64-linux.tar.gz | tar xzk --strip-components=1 -C /

#####################
# Build actual code #
#####################

WORKDIR /code

RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout 18964554bc769255401942e0e6dfd09f2fab2093
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -mexec-model=reactor -fvisibility=hidden -Wl,--export=malloc,--export=free,--export=lodepng_decode32,--export=lodepng_encode32,--strip-all -- lodepng/lodepng.c

# Debug build
# RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -mexec-model=reactor -fvisibility=hidden -Wl,--export=malloc,--export=free,--export=lodepng_decode32,--export=lodepng_encode32             -- lodepng/lodepng.c

RUN wasm-opt -Oz lodepng.wasm -o lodepng.wasm

CMD base64 --wrap=0 lodepng.wasm
