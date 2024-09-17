#!/bin/sh

cd src/front &&\
  npm run build &&\
  cd ../.. &&\
  cargo bundle --release --target aarch64-apple-darwin
