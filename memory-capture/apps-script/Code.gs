// ── CONFIGURATION ────────────────────────────────────────────────────────────
var DRIVE_FOLDER_ID = "1TjcFAMWNRa99WTJK0RtPX1mLm3zhgEKs";
var MAX_PHOTOS = 2;

// ── WEB APP ENTRY POINT ───────────────────────────────────────────────────────
// Deploy as: Execute as "Me", Who has access "Anyone with Google account"
// This serves the full UI and handles Google auth natively — no OAuth client needed.
function doGet() {
  return HtmlService.createHtmlOutputFromFile("Page")
    .setTitle("World Environment Day Capture")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── CALLED FROM PAGE.HTML VIA google.script.run ───────────────────────────────

// Always returns true — Google's own web app gate enforces auth before page loads.
function checkSignedIn() {
  return true;
}

// Returns how many uploads this device session has used and how many remain.
function checkLimit(userId) {
  var safeId = String(userId || "").replace(/[^a-z0-9]/gi, "").substring(0, 32);
  if (!safeId) return { count: 0, max: MAX_PHOTOS, remaining: MAX_PHOTOS };
  var count = parseInt(PropertiesService.getScriptProperties().getProperty("cnt_" + safeId) || "0", 10);
  return { count: count, max: MAX_PHOTOS, remaining: Math.max(0, MAX_PHOTOS - count) };
}

// Reads frame.png from the Drive folder and returns it as a data URL string.
// Returns null if the file does not exist (photo will upload without frame).
function getFrameBase64() {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
    var files = folder.getFilesByName("frame.png");
    if (!files.hasNext()) {
      return null;
    }
    var blob = files.next().getBlob();
    return "data:image/png;base64," + Utilities.base64Encode(blob.getBytes());
  } catch (err) {
    return null;
  }
}

function uploadPhoto(base64Data, mimeType, participantName, userId) {
  var safeId = String(userId || "").replace(/[^a-z0-9]/gi, "").substring(0, 32);
  var props = PropertiesService.getScriptProperties();
  var currentCount = safeId ? parseInt(props.getProperty("cnt_" + safeId) || "0", 10) : 0;
  if (safeId && currentCount >= MAX_PHOTOS) {
    throw new Error("Upload limit reached. Maximum " + MAX_PHOTOS + " photos allowed per device.");
  }

  // getActiveUser().getEmail() is empty for external Google accounts (personal
  // Gmail) due to an Apps Script platform limitation. The user IS authenticated
  // because Google enforces sign-in before serving this web app.
  // We use the effective (owner) user only for the Drive description label.
  var userEmail = Session.getActiveUser().getEmail() || "authorized-participant";

  var ext = "jpg";
  if (mimeType === "image/png") {
    ext = "png";
  } else if (mimeType === "image/webp") {
    ext = "webp";
  }

  var safePart = String(participantName || "participant")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 40) || "participant";

  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd_HHmmss");
  var safeName = ("envday_" + safePart + "_" + timestamp + "." + ext)
    .replace(/[^a-zA-Z0-9._-]/g, "_");

  var bytes = Utilities.base64Decode(base64Data);
  var blob = Utilities.newBlob(bytes, mimeType || "image/jpeg", safeName);
  var file = DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob);
  // Email stored only in Drive file description — never sent back to client.
  file.setDescription("Environment Day | Uploaded by: " + userEmail);
  var newCount = currentCount + 1;
  if (safeId) {
    props.setProperty("cnt_" + safeId, String(newCount));
  }

  return {
    ok: true,
    fileName: file.getName(),
    remaining: Math.max(0, MAX_PHOTOS - newCount)
    // No email, no fileId returned to client
  };
}
