#!/bin/bash
cd /root/relay
psql "$DATABASE_URL" < add-page-scans.sql
echo "Migration complete"
