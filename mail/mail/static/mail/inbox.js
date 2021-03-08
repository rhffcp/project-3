document.addEventListener('DOMContentLoaded', function () {

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
  document.querySelector('#email-contents').style.display = 'none';
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
  document.querySelector('#email-contents').style.display = 'none';

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

}

function get_email(email, mailbox) {
  // Card view.
  const emailCard = document.createElement('div');
  emailCard.className = "card border-dark mb-1";

  // Email row.
  const emailDiv = document.createElement('div');
  emailDiv.className = "row";
  emailDiv.style.padding = "10px";

  // To/from column placed inside email row.
  const ToFrom = document.createElement('div');
  ToFrom.className = "col-lg-3";
  ToFrom.style.fontWeight = "bold";
  if (mailbox === 'inbox' || mailbox === 'archive') {
    ToFrom.innerHTML = email.sender;
  }
  else {
    ToFrom.innerHTML = `To: ${email.recipients}`;
  }
  emailDiv.append(ToFrom);

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

  // Add email row to card view.
  emailCard.append(emailDiv);
  document.querySelector('#emails-view').append(emailCard);

  // When user clicks card, show contents.
  emailCard.addEventListener('click', () => email_view(email, mailbox));

  // Gray out read emails. 
  if (mailbox !== 'sent') {
    if (email.read) {
      emailCard.style.backgroundColor = "#DCDCDC";
    }
  }
}

function email_view(email, mailbox) {

  // Show email contents and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'block';

  if (mailbox === 'inbox') {
    document.querySelector('#archive-button').style.display = 'block';
    document.querySelector('#reply-button').style.display = 'block';
    document.querySelector('#unarchive-button').style.display = 'none';
  }
  else if (mailbox === 'archive') {
    document.querySelector('#unarchive-button').style.display = 'block';
    document.querySelector('#reply-button').style.display = 'block';
    document.querySelector('#archive-button').style.display = 'none';
  }
  else {
    document.querySelector('#archive-button').style.display = 'none';
    document.querySelector('#unarchive-button').style.display = 'none';
    document.querySelector('#reply-button').style.display = 'none';
  }

  document.querySelector('#archive-button').addEventListener('click', () => archive(email));
  document.querySelector('#unarchive-button').addEventListener('click', () => unarchive(email));
  document.querySelector('#reply-button').addEventListener('click', () => reply(email));

  fetch(`/emails/${email.id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);

      email_read(email);

      document.querySelector('#email-timestamp').innerHTML = `<b>Date</b>: ${email.timestamp}`;
      document.querySelector('#email-sender').innerHTML = `<b>From</b>: ${email.sender}`;
      document.querySelector('#email-recipients').innerHTML = `<b>To</b>: ${email.recipients}`;
      document.querySelector('#email-subject').innerHTML = `<b>Subject</b>: ${email.subject}`;
      document.querySelector('#email-body').innerHTML = email.body;

    });
}

function email_read(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function archive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  })
  location.reload();
}

function unarchive(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  })
  location.reload();
}

function reply(email) {

  // Show compose view and hide other views.
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-contents').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#compose-recipients').value = email.sender;
  if (email.subject.indexOf("Re: ") === -1) {
    document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
  }
  else {
    document.querySelector('#compose-subject').value = email.subject;
  }
  document.querySelector('#compose-body').value = `${email.body}\n---------------------\n`;
}