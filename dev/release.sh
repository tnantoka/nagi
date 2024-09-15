#!/bin/sh

cd src/front &&\
  npm run build &&\
  cd ../.. &&\
  cargo build --release
