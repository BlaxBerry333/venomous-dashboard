#!/bin/bash

# TypeScript proto generation script
# Usage: ./generate-ts.sh [PROTO_FILES] [OUTPUT_DIR]

set -e

DEFAULT_PROTO_FILES="./protos/auth/*.proto"
DEFAULT_OUTPUT_DIR="../dashboard/src/types/proto_generated"
PROTO_FILES="${1:-$DEFAULT_PROTO_FILES}"
OUTPUT_DIR="${2:-$DEFAULT_OUTPUT_DIR}"

PLUGIN="./node_modules/.bin/protoc-gen-ts_proto"
OPTS="onlyTypes=true,useExactTypes=false,exportCommonSymbols=false,typePrefix=T,fileSuffix=.types,outputIndex=false"


echo "Generating TypeScript protobuf types... from $PROTO_FILES to $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR"

protoc \
    --plugin="$PLUGIN" \
    --ts_proto_out="$OUTPUT_DIR" \
    --ts_proto_opt="$OPTS" \
    --proto_path=./protos \
    $PROTO_FILES
