document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views.
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // Sends email when form is submitted.
  document.querySelector('form').onsubmit = send;

  // By default, load the inbox.
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields.
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views.
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name.
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the appropriate mailbox.
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(email => {
        get_email(email, mailbox);
      });
  });
}

function send() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send a POST request to /emails API route.
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print JSON results for each email to console.
      console.log(result);
  });

  localStorage.clear();

  // Show sent mailbox.
  load_mailbox('sent');

  // Prevents reloading of page.
  return false;
}

function get_email(email, mailbox) {
  // Card view.
  const emailCard = document.createElement('div');
  emailCard.className = "card border-dark mb-1";

  // Email row.
  const emailDiv = document.createElement('div');
  emailDiv.className = "row";
  emailDiv.style.padding = "20px";
  
  // To/from column placed inside email row.
  const ToFrom = document.createElement('div');
  ToFrom.className = "col-lg-3";
  if (mailbox === 'inbox' || mailbox === 'archive') {
    ToFrom.innerHTML = `From: ${email.sender}`;
  }
  else {
    ToFrom.innerHTML = `To: ${email.recipients}`;
  }
  emailDiv.append(ToFrom);

  // Subject column placed inside email row.
  const subject = document.createElement('div');
  subject.className = "col-lg-5";
  subject.innerHTML = email.subject;
  emailDiv.append(subject);

  // Timestamp column placed inside email row.
  const timestamp = document.createElement('div');
  timestamp.className = "col-lg-3";
  timestamp.innerHTML = email.timestamp;
  emailDiv.append(timestamp);

  // Archive column placed inside email row.
  if (mailbox === 'inbox') {
    const archive = document.createElement('div');
    archive.className = "col-lg-1";
    archive.innerHTML = "Archive";
    archive.style.whiteSpace = "nowrap";
    emailDiv.append(archive);
  }
  
  // Add email row to card view.
  emailCard.append(emailDiv);
  document.querySelector('#emails-view').append(emailCard);

  // Gray out read emails. 
  if (email.read) {
    emailCard.style.backgroundColor = "gray";
  }
}