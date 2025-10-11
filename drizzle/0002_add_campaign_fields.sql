/*
# Add campaign type and duration

This migration adds new columns to the `campaigns` table to support different campaign types and store their duration.

1.  **New Columns**
    - `type` (varchar): Stores the type of campaign (e.g., 'direct', 'seo').
    - `duration` (integer): Stores the campaign duration in minutes.
*/
ALTER TABLE "campaigns" ADD COLUMN "type" varchar(50) DEFAULT 'direct' NOT NULL;
ALTER TABLE "campaigns" ADD COLUMN "duration" integer;