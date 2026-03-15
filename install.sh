#!/bin/sh
set -eu

REPO="h-terao/hokura"
INSTALL_DIR="$HOME/.local/bin"
BIN_NAME="hokura"

# Detect OS
OS="$(uname -s)"
case "$OS" in
  Linux) os="linux" ;;
  *)
    echo "Error: unsupported OS: $OS" >&2
    exit 1
    ;;
esac

# Detect architecture
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64)  arch="x86_64" ;;
  aarch64) arch="aarch64" ;;
  *)
    echo "Error: unsupported architecture: $ARCH" >&2
    exit 1
    ;;
esac

ASSET_NAME="${BIN_NAME}-${os}-${arch}"

# Get download URL for latest release
DOWNLOAD_URL="https://github.com/${REPO}/releases/latest/download/${ASSET_NAME}"

echo "Downloading ${ASSET_NAME}..."
mkdir -p "$INSTALL_DIR"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$DOWNLOAD_URL" -o "${INSTALL_DIR}/${BIN_NAME}"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "${INSTALL_DIR}/${BIN_NAME}" "$DOWNLOAD_URL"
else
  echo "Error: curl or wget is required" >&2
  exit 1
fi

chmod +x "${INSTALL_DIR}/${BIN_NAME}"

echo "Installed ${BIN_NAME} to ${INSTALL_DIR}/${BIN_NAME}"

# Check if INSTALL_DIR is in PATH
case ":${PATH}:" in
  *":${INSTALL_DIR}:"*) ;;
  *)
    echo ""
    echo "Warning: ${INSTALL_DIR} is not in your PATH."
    echo "Add the following to your shell profile:"
    echo "  export PATH=\"${INSTALL_DIR}:\$PATH\""
    ;;
esac
