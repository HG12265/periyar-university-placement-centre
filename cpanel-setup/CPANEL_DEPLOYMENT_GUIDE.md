# Periyar University Placement Portal - cPanel Hosting Guide 🏛️
## Path: `https://periyaruniversity.ac.in/placement_centre`

இந்த வழிகாட்டியில், பல்கலைக்கழகத்தின் முதன்மை இணையதளமான **`periyaruniversity.ac.in`**-க்கு **எந்த ஒரு பாதிப்பும் அல்லது மாற்றமும் ஏற்படாமல்**, முற்றிலும் பாதுகாப்பாக Sub-directory முறையில் **`periyaruniversity.ac.in/placement_centre`** என்ற முகவரியில் புதிய பிளேஸ்மென்ட் போர்ட்டலை எவ்வாறு cPanel-ல் Deploy செய்வது என்பதை எளிய தமிழில் படிப்படியாகக் காண்போம்.

---

## 🛡️ முக்கிய பாதுகாப்பு உத்தரவாதம் (Zero Impact on Main Website)
* `public_html`-ல் ஏற்கனவே உள்ள முதன்மை பல்கலைக்கழக இணையதளக் கோப்புகள் (WordPress / PHP / HTML) எதுவும் **அழிக்கப்படவோ அல்லது மாற்றப்படவோ மாட்டாது**.
* நாம் `public_html`-க்குள் **`placement_centre`** என்ற புதிய தனி ஃபோல்டரை (Subfolder) மட்டுமே உருவாக்குவோம்.
* நமது போர்ட்டலின் `.htaccess` கோப்பு **`public_html/placement_centre/`** ஃபோல்டருக்குள் மட்டுமே இருக்கும். எனவே இது முதன்மை இணையதளத்தின் இயக்கத்தில் எந்தவிதத் தலையீடும் செய்யாது.

---

## 🔑 University Placement Admin லாகின் விவரங்கள்:
* **போர்டல் முகவரி**: `https://periyaruniversity.ac.in/placement_centre/login`
* **Role**: `UNIVERSITY_ADMIN`
* **Email Address**: `placement@periyaruniversity.ac.in`
* **Password**: `admin@123`

---

## 📋 cPanel-ல் Deploy செய்யும் 4 படிநிலைகள்:

```
[ படி 1: MySQL Database & SQL Import ]
                 ⬇
[ படி 2: Backend Setup (Setup Node.js App) ]
                 ⬇
[ படி 3: Frontend Upload (public_html/placement_centre) ]
                 ⬇
[ படி 4: Verification & Login ]
```

---

### படி 1: cPanel-ல் MySQL Database அமைத்தல்

1. உங்கள் **cPanel**-ல் உள்நுழைந்து **MySQL Databases** கருவிக்குச் செல்லவும்.
2. புதிய டேட்டாபேஸை உருவாக்கவும்:
   * **Database Name**: `placement` (முழுப் பெயர்: `cpaneluser_placement`).
3. புதிய பயனரை (MySQL User) உருவாக்கவும்:
   * **Username**: `pu_admin` (முழுப் பெயர்: `cpaneluser_pu_admin`).
   * **Password**: வலிமையான கடவுச்சொல் ஒன்றை உருவாக்கி குறித்து வைத்துக் கொள்ளவும் (எ.கா: `Periyar@Place2026`).
4. **Add User to Database** பகுதிக்கு வந்து:
   * பயனரையும் (`cpaneluser_pu_admin`) டேட்டாபேஸையும் (`cpaneluser_placement`) தேர்ந்தெடுத்து **Add** கிளிக் செய்யவும்.
   * **ALL PRIVILEGES** டிக் செய்து **Make Changes** கொடுக்கவும்.
5. இப்போது cPanel முகப்புக்கு வந்து **phpMyAdmin** திறக்கவும்.
6. இடதுபக்க மெனுவில் உங்கள் டேட்டாபேஸை (`cpaneluser_placement`) கிளிக் செய்யவும்.
7. மேலே உள்ள **Import** tab-ஐத் திறக்கவும்.
8. **Choose File** கிளிக் செய்து, நம் ப்ராஜெக்ட் ரூட்டில் உள்ள **`periyar_university_placement_portal.sql`** (அல்லது `cpanel-setup/database_schema.sql`) கோப்பைத் தேர்ந்தெடுக்கவும்.
9. பக்கத்தின் கீழே உள்ள **Go** பட்டனை அழுத்தவும்.
   * ✅ அனைத்து 27 அட்டவணைகளும் (Tables) மற்றும் University Placement Admin கணக்கும் தயார் செய்யப்பட்டு விடும்!

---

### படி 2: cPanel-ல் Node.js Backend App அமைத்தல்

Node.js Backend-ஐ இயக்க cPanel-ல் இரண்டு வழிகள் உள்ளன. பல்கலைக்கழக சர்வர்களுக்கு **முறை A (Subdomain)** மிகவும் பாதுகாப்பானது மற்றும் தரமானது:

#### முறை A (பரிந்துரைக்கப்படும் முறை - Subdomain for API):
1. cPanel **Subdomains** சென்று `api-placement.periyaruniversity.ac.in` என்ற subdomain-ஐ உருவாக்கவும் (Folder: `placement_backend`).
2. cPanel Search-ல் **Setup Node.js App** (CloudLinux NodeJS Selector) திறக்கவும்:
   * **Create Application** கிளிக் செய்யவும்.
   * **Node.js version**: `20.x` அல்லது `22.x`
   * **Application mode**: `Production`
   * **Application root**: `placement_backend`
   * **Application URL**: `api-placement.periyaruniversity.ac.in`
   * **Application startup file**: `app.js`
   * **Create** கொடுக்கவும்.

*(அல்லது)*

#### முறை B (Sub-directory API for Main Domain):
* Subdomain தேவையில்லை என்றால், Application URL-ல் `periyaruniversity.ac.in/placement_api` என தேர்வு செய்யலாம்.

#### கோப்புகளை பதிவேற்றுதல்:
1. cPanel **File Manager** திறந்து `placement_backend` ஃபோல்டருக்கு செல்லவும்.
2. உங்கள் கணினியில் உள்ள `backend` ஃபோல்டரில் இருக்கும் கோப்புகளை Upload செய்யவும்:
   * ⚠️ **கவனிக்க:** `node_modules` ஃபோல்டரை Upload செய்ய வேண்டாம்!
   * Upload செய்ய வேண்டியவை:
     * `src/` (முழு ஃபோல்டரும்)
     * `prisma/` (முழு ஃபோல்டரும்)
     * `package.json`
     * `package-lock.json`
     * `app.js`
3. **`.env` கோப்பை உருவாக்குதல்**:
   `placement_backend` ஃபோல்டருக்குள் **`.env`** என்ற பெயரில் புதிய ஃபைலை உருவாக்கி, கீழே உள்ளவாறு உங்கள் விவரங்களை உள்ளிட்டு சேமிக்கவும்:
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL="mysql://cpaneluser_pu_admin:Periyar@Place2026@localhost:3306/cpaneluser_placement"
   FRONTEND_URL=https://periyaruniversity.ac.in
   COOKIE_SECURE=true
   SESSION_HOURS=24
   UPLOAD_DIR=./uploads
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=gowtham114411@gmail.com
   SMTP_PASSWORD=olmdbdkovjulozke
   SMTP_FROM="Periyar University Placement Portal <gowtham114411@gmail.com>"
   ```
4. மீண்டும் cPanel **Setup Node.js App** பக்கத்திற்குச் சென்று:
   * **Run NPM Install** பட்டனை கிளிக் செய்யவும்.
   * இன்ஸ்டால் முடிந்தவுடன் **Restart** பட்டனை கிளிக் செய்யவும்.

---

### படி 3: Frontend Build செய்து `public_html/placement_centre` ஃபோல்டரில் பதிவேற்றுதல்

1. உங்கள் லோக்கல் கம்ப்யூட்டரில் டெர்மினலில் `frontend` கோப்பகத்தில் Build எடுக்கவும்:
   *(ஏற்கனவே நாம் `base: '/placement_centre/'` அமைத்து விட்டோம்)*
   ```bash
   cd frontend
   npm run build
   ```
   * இது `frontend/dist/` ஃபோல்டரில் உற்பத்தி கோப்புகளை உருவாக்கும்.
   * இதில் தானாகவே `.htaccess` கோப்பும் `/placement_centre/` RewriteBase உடன் தயாராகி இருக்கும்.
2. `frontend/dist/` ஃபோல்டரில் உள்ள அனைத்து கோப்புகளையும் (`index.html`, `assets/`, `periyar-logo.png`, `.htaccess` போன்றவை) சேர்த்து ஒரு **ZIP** ஃபைலாக மாற்றவும் (எ.கா: `placement_dist.zip`).
3. **cPanel File Manager**-க்கு செல்லவும்:
   * **`public_html`** ஃபோல்டரைத் திறக்கவும். *(இங்கே உள்ள பழைய கோப்புகளை எதுவும் தொட வேண்டாம்!)*
   * மேலே உள்ள **+ Folder** பட்டனை கிளிக் செய்து **`placement_centre`** என்ற புதிய ஃபோல்டரை உருவாக்கவும்.
   * இப்போது `public_html/placement_centre/` ஃபோல்டருக்குள் செல்லவும்.
   * உங்கள் `placement_dist.zip` ஃபைலை இங்கே Upload செய்து, அதை **Extract** செய்யவும்.
4. இப்போது உங்கள் கோப்பு அமைப்பு இவ்வாறு இருக்க வேண்டும்:
   ```
   public_html/
   ├── index.php             <-- முதன்மை பல்கலைக்கழக தளம் (பாதுகாப்பாக உள்ளது)
   ├── wp-content/           <-- முதன்மை பல்கலைக்கழக தளம் (பாதுகாப்பாக உள்ளது)
   └── placement_centre/     <-- நமது புதிய போர்ட்டல் ஃபோல்டர்!
       ├── index.html
       ├── .htaccess
       ├── assets/
       ├── periyar-logo.png
       ├── periyar-portrait.png
       └── periyar-campus.jpg
   ```

---

### படி 4: Verification & Login

1. பிரவுசரில் பல்கலைக்கழக இணையதளத்தைத் திறந்து பார்க்கவும்:
   `https://periyaruniversity.ac.in` 
   👉 முதன்மை தளம் வழக்கம்போல் எந்த பாதிப்பும் இல்லாமல் இயங்கும்!
2. இப்போது நமது புதிய பிளேஸ்மென்ட் போர்ட்டலைத் திறக்கவும்:
   **`https://periyaruniversity.ac.in/placement_centre`**
   👉 பெரியார் பல்கலைக்கழக Placement Management Portal முழுமையான அனிமேஷன்கள், லோகோ மற்றும் பேனருடன் அழகாகத் தோன்றும்!
3. மேலே உள்ள **Portal Login** பட்டனை கிளிக் செய்து Admin Login விவரங்களை உள்ளிடவும்:
   * **Email**: `placement@periyaruniversity.ac.in`
   * **Password**: `admin@123`
4. வெற்றிகரமாக University Admin Dashboard திறக்கப்படும்!

---

## 🛠️ முக்கிய குறிப்புகள் & Tips:
* **Refresh 404 வராது**: `public_html/placement_centre/.htaccess` கோப்பில் `RewriteBase /placement_centre/` அமைக்கப்பட்டுள்ளதால் மாணவர்கள் அல்லது நிறுவனங்கள் எந்த பக்கத்தில் நின்று Refresh செய்தாலும் 404 Error வராது.
* **Upload Permissions**: `placement_backend/uploads` ஃபோல்டருக்கு Permission `755` இருப்பதை File Manager-ல் உறுதி செய்து கொள்ளவும்.
