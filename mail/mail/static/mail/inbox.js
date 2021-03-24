document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views.
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);

  // Listens for form submission and sends email.
  document.querySelector('form').onsubmit = sendEmail;

  // By default, load the inbox.
  loadMailbox('inbox');
});

function composeEmail() {

  // Show compose view and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields.
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function loadMailbox(mailbox) {

  // Show mailbox view and hide other views.
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'none';

  // Show the mailbox name.
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Get the appropriate mailbox.
  // Send GET request to url.
  fetch(`/emails/${mailbox}`)
    // Put response into json form.
    .then(response => response.json())
    .then(emails => {
      // Display each email into a list of cards.
      emails.forEach(email => {
        listEmail(email, mailbox);
      });
    });
}

function sendEmail() {

  // Put user input values into variables.
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Create new email.
  // Send POST request to url.
  fetch('/emails', {
    // Change HTTP method.
    method: 'POST',
    // Change JSON object into a string before submitting.
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
}

function listEmail(email, mailbox) {

  // Card view.
  const emailCard = document.createElement('div');
  emailCard.className = "card border-dark mb-1";

  // Email row.
  const emailDiv = document.createElement('div');
  emailDiv.className = "row";
  emailDiv.style.padding = "10px";

  // To/from column placed inside email row.
  const toFrom = document.createElement('div');
  toFrom.className = "col-lg-3";
  toFrom.style.fontWeight = "bold";
  if (mailbox === 'inbox' || mailbox === 'archive') {
    toFrom.innerHTML = email.sender;
  } else {
    toFrom.innerHTML = `To: ${email.recipients}`;
  }
  emailDiv.append(toFrom);

  // Subject column placed inside email row.
  const subject = document.createElement('div');
  subject.className = "col-lg-6";
  subject.innerHTML = email.subject;
  emailDiv.append(subject);

  // Timestamp column placed inside email row.
  const timestamp = document.createElement('div');
  timestamp.className = "col-lg-3";
  timestamp.innerHTML = email.timestamp;
  emailDiv.append(timestamp);

  // Add email row to card view. Then add card to mailbox view.
  emailCard.append(emailDiv);
  document.querySelector('#emails-view').append(emailCard);

  // When user clicks card, show contents.
  emailCard.addEventListener('click', () => emailView(email, mailbox));

  // Gray out read emails. 
  if (mailbox !== 'sent') {
    if (email.read) {
      emailCard.style.backgroundColor = "#DCDCDC";
    }
  }
}

function emailView(email, mailbox) {

  // Show email contents view and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'block';

  // If email is from inbox, dislay archive and reply buttons.
  if (mailbox === 'inbox') {
    document.querySelector('#archive-button').style.display = 'block';
    document.querySelector('#reply-button').style.display = 'block';
    document.querySelector('#unarchive-button').style.display = 'none';
  }
  // If email is from archive, display unarchive and reply buttons. 
  else if (mailbox === 'archive') {
    document.querySelector('#unarchive-button').style.display = 'block';
    document.querySelector('#reply-button').style.display = 'block';
    document.querySelector('#archive-button').style.display = 'none';
  }
  // If email is from sent, display no buttons.
  else {
    document.querySelector('#archive-button').style.display = 'none';
    document.querySelector('#unarchive-button').style.display = 'none';
    document.querySelector('#reply-button').style.display = 'none';
  }

  // Listen for button clicks and execute appropriate request.
  document.querySelector('#archive-button').addEventListener('click', () => archive(email));
  document.querySelector('#unarchive-button').addEventListener('click', () => unarchive(email));
  document.querySelector('#reply-button').addEventListener('click', () => reply(email));

  // Get contents of email.
  // Send GET request to url.
  fetch(`/emails/${email.id}`)
    // Put response into json form.
    .then(response => response.json())
    .then(email => {
      // Update read status.
      emailRead(email);

      // Display contents.
      document.querySelector('#email-timestamp').innerHTML = `<b>Date</b>: ${email.timestamp}`;
      document.querySelector('#email-sender').innerHTML = `<b>From</b>: ${email.sender}`;
      document.querySelector('#email-recipients').innerHTML = `<b>To</b>: ${email.recipients}`;
      document.querySelector('#email-subject').innerHTML = `<b>Subject</b>: ${email.subject}`;
      document.querySelector('#email-body').innerHTML = email.body;
    });
}

function emailRead(email) {

  // Update read status to true.
  // Send PUT request to url.
  fetch(`/emails/${email.id}`, {
    // Change HTTP method.
    method: 'PUT',
    // Change JSON object into a string before submitting.
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(email) {

  // Update archive status to true.
  // Send PUT request to url.
  fetch(`/emails/${email.id}`, {
    // Change HTTP method.
    method: 'PUT',
    // Change JSON object into a string before submitting.
    body: JSON.stringify({
      archived: true
    })
  })

  // Refresh current document.
  location.reload();
}

function unarchive(email) {

  // Update archive status to false.
  // Send PUT request to url.
  fetch(`/emails/${email.id}`, {
    // Change HTTP method.
    method: 'PUT',
    // Change JSON object into a string before submitting.
    body: JSON.stringify({
      archived: false
    })
  })

  // Refresh current document.
  location.reload();
}

function reply(email) {

  // Show compose view and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Prefill recipient value (to).
  document.querySelector('#compose-recipients').value = email.sender;
  // Prefill subject value with "Re: ".
  if (email.subject.indexOf("Re: ") === -1) {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  } else {
    document.querySelector('#compose-subject').value = email.subject;
  }
  // Prefill body value with date and composer email (from).
  document.querySelector('#compose-body').value =
    `${email.body}\n---\nOn ${email.timestamp} <b>${email.recipients}</b> wrote:\n`;
}