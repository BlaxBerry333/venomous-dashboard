#!/bin/bash

# TypeScript proto generation script
# Usage: ./generate-ts.sh <PROTO_FILES> <OUTPUT_DIR>

set -e

# Check if required arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Error: Missing required arguments"
    echo "Usage: $0 <PROTO_FILES> <OUTPUT_DIR>"
    echo "Example: $0 './protos/**/*.proto' '../dashboard/src/types/proto_generated'"
    exit 1
fi

PROTO_FILES="$1"
OUTPUT_DIR="$2"

echo "Generating TypeScript protobuf types... from $PROTO_FILES to $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR"

# Check if ts-proto plugin exists
PLUGIN="./node_modules/.bin/protoc-gen-ts_proto"
if [ ! -f "$PLUGIN" ]; then
    echo "❌ protoc-gen-ts_proto not found. Please run 'npm install' first."
    exit 1
fi

# Generate protobuf types
protoc \
    --plugin="$PLUGIN" \
    --ts_proto_out="$OUTPUT_DIR" \
    --ts_proto_opt="onlyTypes=true,useExactTypes=false,exportCommonSymbols=false,typePrefix=T,fileSuffix=.types,outputIndex=false" \
    --proto_path=./protos \
    $PROTO_FILES
