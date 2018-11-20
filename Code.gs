// One top-level function, send_emails, which calls the rest.
// 1. Email individuals daily when they receive positive feedback
// 2. Email the chair daily for all feedback
// 3. If someone requests a response, not it in the email to the chair, and send them an acknowledgement


// Some of the code below could be done in the spreadsheet, but it becomes a pain pretty quicky. Easier to program in javascript.



// This function looks for recent reports, checking two criteria:
// - is the feedback timestamp in the last 25 hours
// - is the feedback about a seminar in the last week
// Both have to be true to count as "recent"
//
// The 25-hour thing presents some possiblity of duplication, but the triggers only allow me to
// run the function somewhere in a hour-long block, and I'd rather have the possibility of duplciates
// than missing reports.
//
// If people report feedback for a seminar more than a week ago, we should figure out what to do.
function get_recent_reports () {
  var ss = SpreadsheetApp.getActive().getSheetByName("Form Responses 1");
  // Read all available data
  var values = ss.getDataRange().getValues();
  var current_datetime = new Date();
  // javacript represents Date()-s as milliseconds.
  var min_timestamp = current_datetime    - (    25 * 60 * 60 * 1000);
  var min_seminar_date = current_datetime - (7 * 24 * 60 * 60 * 1000);
  var recent_reports = [];
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var timestamp = row[0];
    if (timestamp < min_timestamp) {
        continue; // skip the current loop iteration
    }
    // TODO: check that google is actually giving me a javascript Date here
    var seminar_date = row[3];
    if (seminar_date < min_seminar_date) {
      continue;
    }
    // Only one of these will be non-blank:
    var faculty_name = row[6];
    var affil_name   = row[8];
    var student_name = row[10];
    var other_name   = row[9];
    var unmatched_name = other_name != "";
    // name of the person who's the subject of this feedback
    var subject_name = faculty_name || student_name || affil_name || other_name;

    // There are other colums here, and those will be interesting for longer-
    // run data analysis, but they don't matter for the emails.
    var one_report = {
        seminar_date: seminar_date,
        seminar_series: row[1],
        subject_name: subject_name,
        unmatched_name: unmatched_name,
        likert_norms: row[12],
        likert_attribution: row[13],
        likert_questions: row[14],
        likert_background: row[15],
        likert_sem_specific: row[16],
        feedback_text: row[17],
        request_followup_with_subject: row[11],
        request_followup_with_writer: row[18],
        requested_followup_email: row[19]
    };
    var recent_reports.push(one_report);
  }
  return recent_reports;
}



function send_emails() {
  var recent_reports = get_recent_reports();
  email_chair(recent_reports);
  email_subject(recent_reports);
  email_writer_ack(recent_reports);
}

// Take the reports in recent_reports and aggregate counts to the subject level.
// Add a note if:
// - at least one person requested bringing up the feedback with the subject
// - someone requested follow up (with the feedback writer)
// Also check that the categories are expected;
function email_chair(recent_reports) {
  var expected_categories = ["Strongly violates norms", "Does not meet norms",
    "Meets norms", "Advances norms", "Strongly advances norms", "Does not apply"]

}

// Take the reports, filter only those that are neutral or positive on all
// categories (and strictly positive on at least one), aggregate to the subject
// level, look up the person's email
// and send one aggregated email
function email_subject(reports) {
  var aggregated_reports = aggregate_reports(reports, True);

  for (var i = 0; i < aggregated_reports.length; i++) {
    // start here.
    // get person's name out


  }
}

function is_report_positive(report) {
  var count_positive = 0;
  var count_negative = 0;
  const positive_categories = new Set(["Advances norms", "Strongly advances norms"]);
  const negative_categories = new Set(["Strongly violates norms", "Does not meet norms"]);
  if      (positive_categories.has(report.likert_attribution )) {count_positive++;}
  else if (negative_categories.has(report.likert_attribution )) {count_negative++;}

  if      (positive_categories.has(report.likert_questions   )) {count_positive++;}
  else if (negative_categories.has(report.likert_questions   )) {count_negative++;}

  if      (positive_categories.has(report.likert_background  )) {count_positive++;}
  else if (negative_categories.has(report.likert_background  )) {count_negative++;}

  if      (positive_categories.has(report.likert_sem_specific)) {count_positive++;}
  else if (negative_categories.has(report.likert_sem_specific)) {count_negative++;}
  if (count_negative == 0 && count_positive > 0) {
    return True;
  } else {
    return False;
  }
}

// Make an object, with people's names as attributes and their reports in an array
function aggregate_reports (reports, positive_only) {
  var reports_by_person = {};
  for (var i = 0; i < reports.length; i++) {
    if (positive_only && !(is_report_positive(reports[i]))) { continue; }
    var subject_name = reports[i].subject_name
    // STOP: this can't be right -- how do I look up an attribute by name?
    if (!reports_by_person.hasOwnProperty(subject_name)) {
      reports_by_person.subject_name = [];
    }
    reports_by_person.subject_name.append(reports[i]);
  }
  return reports_by_person;
}



// Take the reports, filter those that requested follow-up, provided an email
// *and* have that email match in our list of emails.
// Email them a note saying their feedback has been received.
function email_writer_ack(recent_reports) {

}
//
//
//function check_value()
//{
//  var ss = SpreadsheetApp.getActive();
//  var sheet = ss.getSheetByName("Summary");
//  var range = sheet.getRange("A2:E100");
//  var UserData = range.getValues();
//  for (i in UserData) {
//    var row = UserData[i];
//    var name = row[0];
//    var email = row[1];
//    var dateOfFeedback = row[2];
//    var valueToCheck = row[3];
//    var toneScore = row[4];
//    if(valueToCheck > 3 & toneScore > 5){
//      MailApp.sendEmail(row[1], "Custom mail", "Hello " + name + ", You have received" + valueToCheck + "reviews with an average Tone score of" + toneScore);
//    } else if(valueToCheck > 3 & toneScore < 5){
//      MailApp.sendEmail(row[1], "Custom mail", "Hello " + name + ", You have received" + valueToCheck + "reviews with an average Tone score of" + toneScore);
//    }
//  }
//}
