FROM ubuntu:18.04

#########################
# Install prerequisites #
#########################

RUN \
  apt-get update && \
  apt-get install -y build-essential ca-certificates cmake curl git ninja-build software-properties-common ssh wget

####################
# Install LLVM 8.x #
####################

RUN \
  echo "deb http://apt.llvm.org/bionic/ llvm-toolchain-bionic main" >> /etc/apt/sources.list.d/llvm.list && \
  echo "deb-src http://apt.llvm.org/bionic/ llvm-toolchain-bionic main" >> /etc/apt/sources.list.d/llvm.list && \
  wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add - && \
  apt-get update && \
  apt-get install -y clang-8 lldb-8 lld-8 libllvm-8-ocaml-dev libllvm8 llvm-8 llvm-8-dev llvm-8-doc llvm-8-examples llvm-8-runtime clang-8 clang-tools-8 clang-8-doc libclang-common-8-dev libclang-8-dev libclang1-8 clang-format-8 python-clang-8 libc++-8-dev libc++abi-8-dev

ENV PATH="/usr/lib/llvm-8/bin:${PATH}"
ENV LD_LIBRARY_PATH="/usr/lib/llvm-8/lib:${LD_LIBRARY_PATH}"

RUN clang --version

###################
# Build a sysroot #
###################

WORKDIR /src
# FIXME: see https://github.com/jfbastien/musl/pull/51 for progress
# RUN git clone https://github.com/jfbastien/musl.git && cd musl && git checkout edeb5004
# RUN git clone https://github.com/yurydelendik/musl.git && cd musl && git checkout aba5aae0
RUN git clone https://github.com/LinusU/musl.git && cd musl && git checkout 635de63

WORKDIR /build/musl

RUN /src/musl/configure \
  CC=clang \
  CFLAGS="--target=wasm32-unknown-unknown-wasm -O3" \
  --prefix=/sysroot \
  --enable-debug \
  wasm32

RUN make -C /build/musl -j 8 install CROSS_COMPILE=llvm-

RUN cp /src/musl/arch/wasm32/libc.imports /sysroot/lib/

#####################
# Build compiler-rt #
#####################

WORKDIR /src
RUN git clone https://github.com/llvm-mirror/compiler-rt.git && cd compiler-rt && git checkout 920444af7f95afd617861fc44b6f86aa3f317f72

WORKDIR /build/compiler-rt
RUN CC=clang cmake -DCMAKE_SYSROOT=/sysroot -DCOMPILER_RT_DEFAULT_TARGET_TRIPLE=wasm32-unknown-unknown-wasm -DCMAKE_C_COMPILER_WORKS=1 --target /src/compiler-rt/lib/builtins
RUN make
RUN cp lib/*/libclang_rt.builtins-*.a /usr/lib/llvm-8/lib/clang/8.0.0/lib/

#####################
# Build actual code #
#####################

WORKDIR /code

RUN git clone https://github.com/lvandeve/lodepng.git && cd lodepng && git checkout 941de186edfc68bca5ba1043423d0937b4baf3c6
RUN mv lodepng/lodepng.cpp lodepng/lodepng.c

# Relase build
RUN clang --sysroot=/sysroot --target=wasm32-unknown-unknown-wasm -Oz     -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--allow-undefined,--export=malloc,--export=free,--export=lodepng_decode32,--strip-all -- /src/compiler-rt/lib/builtins/*.c lodepng/lodepng.c

# Debug build
# RUN clang --sysroot=/sysroot --target=wasm32-unknown-unknown-wasm -O0 -g3 -o lodepng.wasm -DLODEPNG_NO_COMPILE_DISK -DLODEPNG_NO_COMPILE_CPP -nostartfiles -fvisibility=hidden -Wl,--no-entry,--demangle,--allow-undefined,--export=malloc,--export=free,--export=lodepng_decode32,             -- /src/compiler-rt/lib/builtins/*.c lodepng/lodepng.c

CMD base64 --wrap=0 lodepng.wasm
