#!/bin/bash

# Rust proto generation script
# Usage: ./generate-rust.sh [PROTO_FILES] [OUTPUT_DIR]

set -e

DEFAULT_PROTO_FILES="./protos/auth/*.proto"
DEFAULT_OUTPUT_DIR="../services/auth/src/proto_generated"
PROTO_FILES="${1:-$DEFAULT_PROTO_FILES}"
OUTPUT_DIR="${2:-$DEFAULT_OUTPUT_DIR}"


echo "Generating Rust protobuf types... from $PROTO_FILES to $OUTPUT_DIR"

mkdir -p "$OUTPUT_DIR"

# Check if protoc-gen-prost is available
if ! command -v protoc-gen-prost &> /dev/null; then
    echo "protoc-gen-prost not found. Installing..."
    if command -v cargo &> /dev/null; then
        cargo install protoc-gen-prost
    else
        echo "❌ cargo not found. Please install Rust toolchain first."
        exit 1
    fi
fi

# Add protoc-gen-prost to PATH if needed
export PATH="$PATH:$HOME/.asdf/installs/rust/1.84.0/bin:$HOME/.cargo/bin"

# Generate protobuf types
protoc \
    --prost_out="$OUTPUT_DIR" \
    --proto_path=./protos \
    $PROTO_FILES

# Rename the generated file to a better name and create module structure
if [ -f "$OUTPUT_DIR/venomous_dashboard.auth.rs" ]; then
    mv "$OUTPUT_DIR/venomous_dashboard.auth.rs" "$OUTPUT_DIR/auth.rs"

    # Add serde derives to the generated file
    sed -i '' 's/#\[derive(Clone, PartialEq, ::prost::Message)\]/#[derive(Clone, PartialEq, ::prost::Message, serde::Serialize, serde::Deserialize)]/g' "$OUTPUT_DIR/auth.rs"
fi

# Create mod.rs for easy importing
cat > "$OUTPUT_DIR/mod.rs" << EOF
// Auto-generated protobuf modules
pub mod auth;

// Re-export commonly used types
pub use auth::*;
EOF
