#!/bin/bash

# Rust proto generation script
# Usage: ./generate-rust.sh <PROTO_FILES> <OUTPUT_DIR>

set -e

# Check if required arguments are provided
if [ -z "$1" ] || [ -z "$2" ]; then
    echo "❌ Error: Missing required arguments"
    echo "Usage: $0 <PROTO_FILES> <OUTPUT_DIR>"
    echo "Example: $0 './protos/auth/*.proto' '../services/auth/src/types/proto_generated'"
    exit 1
fi


PROTO_FILES="$1"
OUTPUT_DIR="$2"


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

# Rename generated files and add serde derives
# Process common module
if [ -f "$OUTPUT_DIR/venomous_dashboard.common.rs" ]; then
    mv "$OUTPUT_DIR/venomous_dashboard.common.rs" "$OUTPUT_DIR/common.rs"
    sed -i '' 's/#\[derive(Clone, PartialEq, ::prost::Message)\]/#[derive(Clone, PartialEq, ::prost::Message, serde::Serialize, serde::Deserialize)]/g' "$OUTPUT_DIR/common.rs"
fi

# Process auth module
if [ -f "$OUTPUT_DIR/venomous_dashboard.auth.rs" ]; then
    mv "$OUTPUT_DIR/venomous_dashboard.auth.rs" "$OUTPUT_DIR/auth.rs"
    sed -i '' 's/#\[derive(Clone, PartialEq, ::prost::Message)\]/#[derive(Clone, PartialEq, ::prost::Message, serde::Serialize, serde::Deserialize)]/g' "$OUTPUT_DIR/auth.rs"
fi

# Process notes module
if [ -f "$OUTPUT_DIR/venomous_dashboard.notes.rs" ]; then
    mv "$OUTPUT_DIR/venomous_dashboard.notes.rs" "$OUTPUT_DIR/notes.rs"
    sed -i '' 's/#\[derive(Clone, PartialEq, ::prost::Message)\]/#[derive(Clone, PartialEq, ::prost::Message, serde::Serialize, serde::Deserialize)]/g' "$OUTPUT_DIR/notes.rs"
fi

# Create mod.rs for easy importing
MODULES=""
[ -f "$OUTPUT_DIR/common.rs" ] && MODULES="$MODULES\npub mod common;"
[ -f "$OUTPUT_DIR/auth.rs" ] && MODULES="$MODULES\npub mod auth;"
[ -f "$OUTPUT_DIR/notes.rs" ] && MODULES="$MODULES\npub mod notes;"

cat > "$OUTPUT_DIR/mod.rs" << EOF
// Auto-generated protobuf modules
$(echo -e "$MODULES")

// Re-export commonly used types
$([ -f "$OUTPUT_DIR/common.rs" ] && echo "pub use common::*;")
$([ -f "$OUTPUT_DIR/auth.rs" ] && echo "pub use auth::*;")
$([ -f "$OUTPUT_DIR/notes.rs" ] && echo "pub use notes::*;")
EOF
