#!/bin/sh
set -eu

: "${API_URL:?API_URL must be set to the public API base URL}"

cat > /usr/share/nginx/html/config.js <<EOF
window.__KR_CONFIG__ = {
    API_URL: "${API_URL}"
};
EOF

exec "$@"
