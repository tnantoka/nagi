#!/bin/sh

set -eu

REPO="tnantoka/nagi"

TAG_NAME=$(curl -s https://api.github.com/repos/$REPO/releases/latest | jq -r .tag_name)

FILE_NAME="Nagi-aarch64-apple-darwin.tar.gz"
curl -L -o "$FILE_NAME" "https://github.com/$REPO/releases/download/$TAG_NAME/$FILE_NAME"

tar -xzf "$FILE_NAME"
rm "$FILE_NAME"

xattr -c Nagi.app
