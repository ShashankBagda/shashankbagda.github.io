Google Apps Script Setup

1) Open script.new while signed in with the organizer Google account.
2) Paste Code.gs from this folder.
3) In Code.gs update:
   - YOUR_GOOGLE_CLIENT_ID
   - OPTIONAL_DRIVE_FOLDER_ID (optional)
4) Deploy as Web app:
   - Execute as: Me
   - Who has access: Anyone
5) Copy deployed Web app URL and put it into memory-capture/index.html as APPS_SCRIPT_WEB_APP_URL.

Google OAuth Setup

1) Open Google Cloud Console.
2) Enable APIs:
   - Google OAuth (Identity Services)
   - Google People API (for userinfo endpoint response)
3) Create OAuth Client ID (Web application).
4) Add authorized JavaScript origins:
   - Your GitHub Pages origin or hosting origin.
5) Put the same client ID in:
   - memory-capture/index.html (GOOGLE_CLIENT_ID)
   - apps-script/Code.gs (YOUR_GOOGLE_CLIENT_ID)

How security works

- Frontend requests Google OAuth token for each participant.
- Frontend sends token + image to Apps Script.
- Apps Script verifies token audience and fetches verified email.
- Only verified Google users can upload.
- Files are saved into organizer Drive account.

Notes

- This is best for event counters and managed uploads.
- If you need per-user upload to their own Drive, you need a full backend OAuth flow with user-owned Drive scopes.
