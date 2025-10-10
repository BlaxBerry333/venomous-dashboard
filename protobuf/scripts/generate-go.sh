#!/bin/bash

# Go proto generation script
# Usage: ./generate-go.sh <PROTO_FILES> <OUTPUT_DIR>

set -e

# Check if required arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Error: Missing required arguments"
    echo "Usage: $0 <PROTO_FILES> <OUTPUT_DIR>"
    echo "Example: $0 './protos/auth/*.proto' '../services/api-gateway/internal/proto_generated'"
    exit 1
fi


PROTO_FILES="$1"
OUTPUT_DIR="$2"

echo "Generating Go protobuf types... from $PROTO_FILES to $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR"

# Add Go bin directory to PATH first
GOPATH=$(go env GOPATH 2>/dev/null || echo "$HOME/go")
export PATH="$PATH:$GOPATH/bin"

# Check if protoc-gen-go is available
if ! command -v protoc-gen-go &> /dev/null; then
    echo "protoc-gen-go not found. Installing..."
    if command -v go &> /dev/null; then
        go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
        echo "✅ protoc-gen-go installed to $GOPATH/bin"
    else
        echo "❌ go not found. Please install Go toolchain first."
        exit 1
    fi
fi

# Generate protobuf types
protoc \
    --go_out="$OUTPUT_DIR" \
    --go_opt=paths=source_relative \
    --proto_path=./protos \
    $PROTO_FILES
