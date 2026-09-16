#!/bin/bash

cd "$(dirname "$0")" || exit 1

url="http://127.0.0.1:8766"

if curl --silent --fail --max-time 2 "$url/api/health" | grep -q '"status": "ok"'; then
  echo "Website Builder is already running at $url"
  open "$url"
  exit 0
fi

port_pid="$(lsof -nP -iTCP:8766 -sTCP:LISTEN -t 2>/dev/null)"
if [ -n "$port_pid" ]; then
  echo "Port 8766 is being used by another process (PID $port_pid)."
  echo "Stop that process or change the Website Builder port."
  exit 1
fi

exec python3 server.py
