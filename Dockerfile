FROM ubuntu:24.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  DEBIAN_FRONTEND=noninteractive apt-get install -y ca-certificates curl git libxml2

#########################
# Install WASI SDK 15.0 #
#########################

RUN curl -L https://github.com/WebAssembly/wasi-sdk/releases/download/wasi-sdk-15/wasi-sdk-15.0-linux.tar.gz | tar xzk --strip-components=1 -C /

#########################
# Install binaryen v124 #
#########################

RUN curl -L https://github.com/WebAssembly/binaryen/releases/download/version_124/binaryen-version_124-x86_64-linux.tar.gz | tar xzk --strip-components=1 -C /

#####################
# Build actual code #
#####################

WORKDIR /code

# LodePNG version 20260119 + master fixes up to 2026-05-28
RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout ed6fe5825c6a4fbb7f58ab35a4231c7543cd452a
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -mexec-model=reactor -fvisibility=hidden -Wl,--export=malloc,--export=free,--export=lodepng_decode32,--export=lodepng_encode32,--strip-all -- lodepng/lodepng.c

# Debug build
# RUN clang --sysroot=/share/wasi-sysroot --target=wasm32-unknown-wasi -flto -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -mexec-model=reactor -fvisibility=hidden -Wl,--export=malloc,--export=free,--export=lodepng_decode32,--export=lodepng_encode32             -- lodepng/lodepng.c

RUN wasm-opt --signext-lowering -Oz lodepng.wasm -o lodepng.wasm

CMD ["base64", "--wrap=0", "lodepng.wasm"]
