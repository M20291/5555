# Magnet to Google Drive

פרויקט זה מאפשר להוריד קבצים מקישורי magnet ולהעלות אותם לגוגל דרייב.

## התקנה

```bash
npm install
```

## משתני סביבה

יש להגדיר את המשתנים הבאים ב-Render:

- `GOOGLE_CLIENT_ID`: Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth Client Secret  
- `GOOGLE_ACCESS_TOKEN`: Google OAuth Access Token
- `GOOGLE_REFRESH_TOKEN`: Google OAuth Refresh Token

הפרטים האלו צריכים להיות מוגדרים כ-secrets ב-Render ולא בקוד.

## שימוש

POST request ל-`/api` עם ה-body הבא:

```json
{
  "magnetUri": "magnet:?xt=urn:btih:...",
  "fileName": "desired_filename.ext",
  "mimeType": "file_mime_type",
  "timeout": 300000
}
```

## פריסה ל-Render

1. חבר את המאגר ל-Render
2. הגדר את משתני הסביבה
3. Render יפרוס אוטומטית את הפרויקט