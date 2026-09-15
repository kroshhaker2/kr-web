#!/bin/sh

cat > /usr/share/nginx/html/config.js <<EOF
window.__KR_CONFIG__ = {
    API_URL: "${API_URL}"
};
EOF

exec "$@"