# 🔒 VPS Backup System Guide

## ✅ What's Configured

### Automated Daily Backups
- **Schedule:** Every day at 2:00 AM (server time)
- **Retention:** Last 7 days
- **Location:** `/root/backups/`

### What Gets Backed Up
1. **Server Files** - All `.js` files
2. **Environment Variables** - `.env` file
3. **PM2 Configuration** - Process manager settings
4. **PostgreSQL Database** - Complete database dump
5. **Nginx Configuration** - Web server settings

---

## 📋 Common Commands

### View Available Backups
```bash
ssh root@67.217.60.57 'ls -lh /root/backups/'
```

### Run Manual Backup
```bash
ssh root@67.217.60.57 '/root/backup-script.sh'
```

### View Backup Logs
```bash
ssh root@67.217.60.57 'tail -50 /root/backup.log'
```

### Download Backup to Local Machine
```bash
.\download-backup.bat
```
Then enter the backup filename when prompted.

---

## 🔄 Restore from Backup

### On VPS Server:
```bash
ssh root@67.217.60.57
cd /root
./restore-backup.sh relay_backup_YYYYMMDD_HHMMSS.tar.gz
```

### From Local Backup:
1. Upload backup to VPS:
```bash
scp backups/relay_backup_*.tar.gz root@67.217.60.57:/root/backups/
```

2. SSH into VPS and restore:
```bash
ssh root@67.217.60.57
./restore-backup.sh relay_backup_YYYYMMDD_HHMMSS.tar.gz
```

---

## 📊 Backup Details

### Backup File Format
`relay_backup_YYYYMMDD_HHMMSS.tar.gz`

Example: `relay_backup_20241026_083020.tar.gz`

### Typical Backup Size
~50-100 KB (compressed)

### Contents Structure
```
relay_backup_YYYYMMDD_HHMMSS/
├── *.js                    # All server files
├── .env                    # Environment variables
├── package.json            # Dependencies
├── dump.pm2                # PM2 configuration
├── database_backup.sql     # PostgreSQL dump
└── nginx/                  # Nginx configs
    ├── sites-available/
    └── nginx.conf
```

---

## ⚙️ Cron Job Details

### View Current Cron Jobs
```bash
ssh root@67.217.60.57 'crontab -l'
```

### Edit Cron Schedule
```bash
ssh root@67.217.60.57 'crontab -e'
```

Current schedule:
```
0 2 * * * /root/backup-script.sh >> /root/backup.log 2>&1
```

**Format:** `minute hour day month weekday command`
- `0 2 * * *` = Every day at 2:00 AM

### Change Backup Time
To run at different time, edit the cron job:
- `0 3 * * *` = 3:00 AM
- `0 1 * * *` = 1:00 AM
- `0 */6 * * *` = Every 6 hours

---

## 🚨 Emergency Recovery

### If Server Crashes:

1. **Check if backup exists:**
```bash
ssh root@67.217.60.57 'ls -lh /root/backups/'
```

2. **Download latest backup:**
```bash
.\download-backup.bat
```

3. **Restore from backup:**
```bash
ssh root@67.217.60.57
./restore-backup.sh <backup_filename>
```

4. **Verify services:**
```bash
pm2 status
pm2 logs relay-api --lines 20
```

---

## 📝 Best Practices

### Regular Checks
- ✅ Check backup logs weekly
- ✅ Download important backups locally
- ✅ Test restore process monthly

### Before Major Changes
Always run manual backup:
```bash
ssh root@67.217.60.57 '/root/backup-script.sh'
```

### Keep Local Copies
Download backups before:
- Major updates
- Configuration changes
- Database migrations

---

## 🔧 Troubleshooting

### Backup Not Running
Check cron service:
```bash
ssh root@67.217.60.57 'systemctl status cron'
```

### Disk Space Issues
Check available space:
```bash
ssh root@67.217.60.57 'df -h'
```

Clean old backups manually:
```bash
ssh root@67.217.60.57 'rm /root/backups/relay_backup_OLD*.tar.gz'
```

### Database Backup Fails
Check PostgreSQL version compatibility in logs.

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| List backups | `ssh root@67.217.60.57 'ls -lh /root/backups/'` |
| Manual backup | `ssh root@67.217.60.57 '/root/backup-script.sh'` |
| Download backup | `.\download-backup.bat` |
| View logs | `ssh root@67.217.60.57 'tail -50 /root/backup.log'` |
| Restore | `ssh root@67.217.60.57 './restore-backup.sh <file>'` |

---

## ✅ System Status

**Backup System:** ✅ Active
**Schedule:** Daily at 2:00 AM
**Retention:** 7 days
**First Backup:** 2024-10-26 08:30:20
**Location:** `/root/backups/`

---

**Your server is now protected with automated daily backups!** 🎉
