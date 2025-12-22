#!/bin/bash
echo "Checking page limit on VPS..."
grep "pageLimit = " /root/relay/seo-automation-api.js | head -1
