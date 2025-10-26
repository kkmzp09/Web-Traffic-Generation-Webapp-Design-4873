@echo off
REM Setup Discount Codes System
REM Run this to create discount tables and insert testing codes

echo ========================================
echo   Setting Up Discount Codes System
echo ========================================
echo.

echo [1/2] Creating discount tables on database...
echo.

REM Execute SQL on the database
psql %DATABASE_URL% -f create-discount-tables.sql

if %errorlevel% neq 0 (
    echo ERROR: Failed to create discount tables
    echo.
    echo Make sure DATABASE_URL environment variable is set
    echo Example: set DATABASE_URL=postgresql://user:pass@host:5432/dbname
    pause
    exit /b 1
)

echo ✓ Discount tables created successfully!
echo.

echo [2/2] Testing codes created:
echo.
echo   Code: TESTING100
echo   Discount: 100%% off (unlimited uses)
echo   Purpose: Development and testing
echo.
echo   Code: LAUNCH50
echo   Discount: 50%% off (100 uses)
echo.
echo   Code: SAVE20
echo   Discount: 20%% off (unlimited uses)
echo.
echo   Code: EARLYBIRD
echo   Discount: 30%% off (50 uses)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next: Restart your API server to load the discount routes
echo.
pause
