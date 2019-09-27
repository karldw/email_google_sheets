// One top-level function, send_emails, which calls the rest.
// Email the equity and inclusion committee a daily summary of feedback received.

// This is a script in Google Sheets, run by a google sheets trigger. It does
// not use the google forms triggers.
// The trigger is set up to run once a day. The get_recent_comments function
// looks for recent reports, checking if the feedback timestamp is in the last
// 25 hours. The 25-hour thing presents some possiblity of duplication, but the
// triggers only allow me to run the function somewhere in  an hour-long block,
// and I'd rather have the possibility of duplicates than missing reports.


function send_emails() {
    var recent_comments = get_recent_comments();
    if (recent_comments.length > 0) {
        email_committee(recent_comments);
    }
}

function get_recent_comments() {
    var ss = SpreadsheetApp.getActive().getSheetByName("Form Responses 1");
    // Read all available data
    var values = ss.getDataRange().getValues();
    var current_datetime = new Date();
    // javacript represents Date()-s as milliseconds.
    var min_timestamp = current_datetime - (25 * 60 * 60 * 1000);
    var recent_comments = [];
    // Skip row 0, the header row.
    for (var i = 1; i < values.length; i++) {
        var row = values[i];
        var timestamp = row[0];
        if (timestamp < min_timestamp) {
            continue; // skip the current loop iteration
        }
        var one_comment = {
            timestamp: timestamp,
            feedback_text: row[1],
        };
        recent_comments.push(one_comment);
    }
    return recent_comments;
}

function email_committee(recent_comments) {
    var message_subject = make_message_subject(recent_comments);
    var message_body = make_message_body(recent_comments);

    var emailQuotaRemaining = MailApp.getRemainingDailyQuota();
    if (emailQuotaRemaining < 3) {
        Logger.log("Failed to send email because quota exhausted");
        Logger.log(message_body);
    }
    MailApp.sendEmail({
       to: "test@example.com,email@example.com", // TODO: set your email here
       subject: message_subject,
       htmlBody: message_body,
       noReply: true,
       name: "ARE climate form"
   })
}

function make_message_body(recent_comments) {
    var body = "";
    for (const one_comment of recent_comments) {
        body +=
        "<h4 style='text-transform: capitalize; margin-bottom: 0'>" +
        "Received " + one_comment["timestamp"] +
        "</h4><br><div>" +
        sanitize_input(one_comment["feedback_text"]) + "</div>";
    }
    // once the looping is done, `body` will be one long string to email
    return body;
}

// sanitize content from the user
// ref: https://developers.google.com/apps-script/reference/html/html-output#appendUntrusted(String)
function sanitize_input(rawInput) {
   var placeholder = HtmlService.createHtmlOutput(" ");
   placeholder.appendUntrusted(rawInput);
   return placeholder.getContent();
 }

function make_message_subject(recent_comments) {
    if (recent_comments.length > 1) {
        var s = "s";
    } else {
        var s = "";
    }
    var subject = "[ARE climate form] Received " + recent_comments.length + " new comment" + s;
    return subject
}
