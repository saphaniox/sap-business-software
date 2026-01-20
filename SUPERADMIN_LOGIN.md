# 🔐 Super Admin Login Guide

## **Quick Login**

**URL:** https://sap-business-software.vercel.app

**Credentials:**
```
Email:    superadmin@saptech.com
Password: SuperAdmin@2025!
```

---

## **How to Login**

1. **Go to the login page**: https://sap-business-software.vercel.app
2. **Enter the super admin email** in the username/email field
3. **Enter the password**: `SuperAdmin@2025!`
4. **Click Login**

The system automatically detects super admin emails and redirects you to the super admin dashboard.

---

## **If Super Admin Doesn't Exist in Database**

Run this command on your **Koyeb server** or **locally** to create the super admin account:

```bash
cd server
node scripts/seed-superadmin-pg.js
```

This will create the super admin account in your Supabase PostgreSQL database.

---

## **Verify Super Admin in Database**

You can check if the super admin exists by running this SQL query in Supabase:

```sql
SELECT * FROM superadmins WHERE email = 'superadmin@saptech.com';
```

If you see a result, the account exists. If not, run the seed script above.

---

## **Troubleshooting**

### ❌ "Invalid credentials"
- **Solution**: The super admin account doesn't exist yet. Run the seed script.

### ❌ "Account is disabled"
- **Solution**: Run this SQL in Supabase:
  ```sql
  UPDATE superadmins SET is_active = TRUE WHERE email = 'superadmin@saptech.com';
  ```

### ❌ Login works but shows regular dashboard
- **Solution**: Make sure you're using the exact email: `superadmin@saptech.com`
- The system detects super admin by the email address

---

## **Super Admin Features**

Once logged in as super admin, you can:

- ✅ View all companies in the system
- ✅ Approve/reject company registrations
- ✅ Suspend or activate companies
- ✅ View system-wide analytics
- ✅ Manage announcements
- ✅ Handle support tickets
- ✅ View audit logs
- ✅ Manage other super admins

---

## **Security Best Practices**

⚠️ **IMPORTANT:**

1. **Change the default password** immediately after first login
2. Store credentials securely (password manager)
3. Never share super admin credentials
4. Enable two-factor authentication if available
5. Regularly review audit logs

---

## **Default Super Admin Details**

```
Name:     superadmin
Email:    superadmin@saptech.com
Password: SuperAdmin@2025!
Phone:    +256706564628
Role:     superadmin
```

**Permissions:**
- Can manage companies: ✅
- Can suspend companies: ✅
- Can delete companies: ✅
- Can view all data: ✅
- Can manage admins: ✅

---

## **Quick Access**

- **Production Login**: https://sap-business-software.vercel.app
- **Backend API**: https://sap-business-management-software.koyeb.app
- **Database**: Supabase (PostgreSQL)

---

**Need help?** Check the Koyeb logs if login fails:
- Go to: https://app.koyeb.com
- Open: sap-business-management-software
- Click: Logs tab
- Look for "Super admin login error" messages
