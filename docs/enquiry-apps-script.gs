/**
 * THE WED THEORY: receives the website's enquiries into a Google Sheet and emails an alert.
 *
 * The site's /api/enquiry route POSTs each enquiry here as JSON. This script saves it as a row, then
 * emails you. Full steps are in the README, "Receiving enquiries". In short:
 *
 *   1. Create a Google Sheet. Open Extensions > Apps Script and replace the code with this file.
 *   2. Replace SECRET below with a long random string (keep it private).
 *   3. Choose the function `setup` and press Run. Allow the permissions it asks for. (Google says the
 *      app is unverified because you wrote it: Advanced > Go to project.)
 *   4. Deploy > New deployment > type "Web app". Execute as: Me. Who has access: Anyone. Deploy.
 *   5. Copy the Web app URL (it ends in /exec) and set, in Vercel (Production):
 *        ENQUIRY_WEBHOOK_URL = <that URL>?key=<your SECRET>
 *      Then redeploy.
 *
 * After changing this script, publish it again: Deploy > Manage deployments > Edit > New version.
 * The URL stays the same.
 *
 * @OnlyCurrentDoc
 */

// A long random string. It goes on the end of the web app URL as ?key=..., so only the website can
// post here. Never commit the real one.
const SECRET = "REPLACE_WITH_A_LONG_RANDOM_STRING";

// Who gets the email alert. Leave blank to use the Google account that deployed this script.
const NOTIFY_EMAIL = "";

const SHEET_NAME = "Enquiries";

// [field in the website's payload, column heading]. Add a pair to add a column.
const COLUMNS = [
  ["receivedAt", "Received (UTC)"],
  ["name", "Name"],
  ["phone", "WhatsApp / phone"],
  ["eventType", "Event"],
  ["date", "Date"],
  ["venue", "Venue or city"],
  ["guests", "Guests"],
  ["budget", "Budget"],
  ["details", "Details"],
  ["whatsappChat", "Chat on WhatsApp"],
  ["pageUrl", "Page"],
  ["emailStatus", "Email alert"],
];

/** Receives an enquiry. Answers JSON: {"ok": true} only once the row is saved. */
function doPost(e) {
  try {
    if (SECRET === "REPLACE_WITH_A_LONG_RANDOM_STRING") return reply_({ ok: false, error: "not_configured" });
    if (!e || !e.parameter || e.parameter.key !== SECRET) return reply_({ ok: false, error: "forbidden" });

    const data = JSON.parse(e.postData.contents);
    if (!data || typeof data !== "object" || !data.name || !data.phone) {
      return reply_({ ok: false, error: "invalid" });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    let sheet;
    let row;
    try {
      sheet = sheet_();
      row = sheet.getLastRow() + 1;
      const range = sheet.getRange(row, 1, 1, COLUMNS.length);
      // Plain text, so nothing a visitor types (a phone starting with +, or =IMPORTXML(...)) is ever
      // read as a formula.
      range.setNumberFormat("@");
      range.setValues([COLUMNS.map(function (column) { return clip_(data[column[0]]); })]);
    } finally {
      lock.releaseLock();
    }

    // The row is the record. If the email fails, say so in the sheet rather than losing the enquiry.
    const status = notify_(data);
    sheet.getRange(row, COLUMNS.length).setValue(status);

    return reply_({ ok: true });
  } catch (error) {
    return reply_({ ok: false, error: String(error).slice(0, 200) });
  }
}

/** Open the web app URL in a browser to check it is reachable. Reveals nothing. */
function doGet() {
  return reply_({ ok: true, service: "wed-theory-enquiries" });
}

/** Run once from the editor: creates the sheet and its headings, and asks for the permissions it needs. */
function setup() {
  const sheet = sheet_();
  Logger.log("Sheet ready: " + sheet.getParent().getUrl());
  Logger.log("Emails you can still send today: " + MailApp.getRemainingDailyQuota());
  Logger.log("Alerts will go to: " + (NOTIFY_EMAIL || Session.getEffectiveUser().getEmail()));
}

/** Optional: run from the editor to add a clearly marked test row and send a test alert. */
function sendTest() {
  const result = doPost({
    parameter: { key: SECRET },
    postData: {
      contents: JSON.stringify({
        receivedAt: new Date().toISOString(),
        name: "TEST - please ignore",
        phone: "+92 300 0000000",
        eventType: "Wedding",
        details: "A test from the Apps Script editor.",
        text: "Name: TEST - please ignore\nDetails: A test from the Apps Script editor.",
      }),
    },
  });
  Logger.log(result.getContent());
}

function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    const headings = sheet.getRange(1, 1, 1, COLUMNS.length);
    headings.setNumberFormat("@");
    headings.setValues([COLUMNS.map(function (column) { return column[1]; })]);
    headings.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function notify_(data) {
  try {
    const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
    const subject = ("New website enquiry: " + oneLine_(data.name) + " (" + oneLine_(data.eventType) + ")").slice(0, 150);
    const lines = [
      "A new enquiry came in on the website.",
      "",
      clip_(data.text),
      "",
      data.whatsappChat ? "Reply on WhatsApp: " + clip_(data.whatsappChat) : "",
      "",
      "It is saved in your enquiries sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    ];
    MailApp.sendEmail({ to: to, subject: subject, body: lines.join("\n"), name: "The Wed Theory website" });
    return "sent to " + to;
  } catch (error) {
    return "failed: " + String(error).slice(0, 200);
  }
}

function reply_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}

function clip_(value) {
  return value === null || value === undefined ? "" : String(value).slice(0, 2000);
}

function oneLine_(value) {
  return clip_(value).replace(/\s+/g, " ").trim();
}
