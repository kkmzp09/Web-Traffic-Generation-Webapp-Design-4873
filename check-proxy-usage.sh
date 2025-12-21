#!/bin/bash
echo "🔍 Checking for proxy usage in SEO project..."

cd /root/relay

# Check .env for proxy configs
echo ""
echo "=== Checking .env file ==="
if grep -i "PROXY" .env 2>/dev/null; then
  echo "⚠️ Proxy configs found in .env"
else
  echo "✅ No proxy configs in .env"
fi

# Check if Cheerio scanner uses proxy
echo ""
echo "=== Checking Cheerio scanner ==="
if grep -i "proxy" cheerio-page-scanner.js 2>/dev/null; then
  echo "⚠️ Proxy usage found in Cheerio scanner"
else
  echo "✅ Cheerio scanner does NOT use proxy"
fi

# Check if DataForSEO service uses proxy
echo ""
echo "=== Checking DataForSEO services ==="
if grep -i "proxy" dataforseo-*.js 2>/dev/null; then
  echo "⚠️ Proxy usage found in DataForSEO"
else
  echo "✅ DataForSEO does NOT use proxy"
fi

# Check comprehensive audit
echo ""
echo "=== Checking comprehensive audit ==="
if grep -i "proxy" comprehensive-seo-audit.js 2>/dev/null; then
  echo "⚠️ Proxy usage found in audit"
else
  echo "✅ Audit does NOT use proxy"
fi

echo ""
echo "✅ Proxy check complete"
