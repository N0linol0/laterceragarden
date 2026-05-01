document.addEventListener("DOMContentLoaded", function() {

    // ── POPUP CONTROLS ──
    function openWaitlist() {
      document.getElementById('waitlist-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function openContact() {
      document.getElementById('contact-overlay').classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closePopup(type) {
      document.getElementById(type + '-overlay').classList.remove('active');
      document.body.style.overflow = '';
    }

    document.getElementById('btn-waitlist').addEventListener('click', openWaitlist);
    document.getElementById('btn-contact').addEventListener('click', openContact);
    document.getElementById('close-waitlist').addEventListener('click', function() { closePopup('waitlist'); });
    document.getElementById('close-contact').addEventListener('click', function() { closePopup('contact'); });

    document.getElementById('waitlist-overlay').addEventListener('click', function(e) {
      if (e.target === this) closePopup('waitlist');
    });
    document.getElementById('contact-overlay').addEventListener('click', function(e) {
      if (e.target === this) closePopup('contact');
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closePopup('waitlist');
        closePopup('contact');
      }
    });

    // ── PHONE AUTO-FORMAT ──
    function formatPhone(input) {
      let val = input.value.replace(/\D/g, '');
      if (val.length > 10) val = val.slice(-10);
      let formatted = '';
      if (val.length >= 1) formatted = '(' + val.slice(0, 3);
      if (val.length >= 4) formatted += ') ' + val.slice(3, 6);
      if (val.length >= 7) formatted += '-' + val.slice(6, 10);
      input.value = formatted;
    }

    document.getElementById('phone').addEventListener('input', function() { formatPhone(this); });
    document.getElementById('wl-phone').addEventListener('input', function() { formatPhone(this); });

    // ── WAITLIST FORM ──
    document.getElementById('waitlist-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('wl-btn');
      const msg = document.getElementById('waitlist-msg');
      const firstname = document.getElementById('wl-firstname').value.trim();
      const email = document.getElementById('wl-email').value.trim();

      if (!firstname) return showMsg(msg, 'Please enter your first name.', 'error');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return showMsg(msg, 'Please enter a valid email address.', 'error');

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const phone = document.getElementById('wl-phone').value.trim();
        const res = await fetch('/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname,
            lastname: document.getElementById('wl-lastname').value.trim(),
            email,
            phone,
            message: document.getElementById('wl-message').value.trim(),
          }),
        });
        const json = await res.json();
        if (json.success) {
          showMsg(msg, "You're on the list. We'll be in touch when a spot opens up.", 'success');
          document.getElementById('waitlist-form').reset();
        } else {
          showMsg(msg, json.error || 'Something went wrong. Please try again.', 'error');
        }
      } catch(err) {
        showMsg(msg, 'Something went wrong. Please try again.', 'error');
      }

      btn.textContent = 'Add me to the waitlist';
      btn.disabled = false;
    });

    // ── CONTACT FORM ──
    document.getElementById('contact-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('ct-btn');
      const msg = document.getElementById('contact-msg');
      const name = document.getElementById('ct-name').value.trim();
      const email = document.getElementById('ct-email').value.trim();
      const subject = document.getElementById('ct-subject').value.trim();
      const message = document.getElementById('ct-message').value.trim();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!name) return showMsg(msg, 'Please enter your name.', 'error');
      if (!emailRegex.test(email)) return showMsg(msg, 'Please enter a valid email address.', 'error');
      if (!subject) return showMsg(msg, 'Please enter a subject.', 'error');
      if (!message) return showMsg(msg, 'Please enter a message.', 'error');

      btn.textContent = 'Sending...';
      btn.disabled = true;

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message }),
        });
        const json = await res.json();
        if (json.success) {
          showMsg(msg, "Message sent. We'll get back to you soon.", 'success');
          document.getElementById('contact-form').reset();
        } else {
          showMsg(msg, json.error || 'Something went wrong. Please try again.', 'error');
        }
      } catch(err) {
        showMsg(msg, 'Something went wrong. Please try again.', 'error');
      }

      btn.textContent = 'Send message';
      btn.disabled = false;
    });

    function showMsg(el, text, type) {
      el.style.display = 'block';
      el.textContent = text;
      if (type === 'success') {
        el.style.background = '#eef5eb';
        el.style.color = '#1e3a2f';
        el.style.border = '1px solid #a8c5a0';
      } else {
        el.style.background = '#fce8e5';
        el.style.color = '#9e2a22';
        el.style.border = '1px solid #f5c0bb';
      }
    }

    // ── SIGNUP FORM ──
    document.getElementById('signup-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      const btn = document.getElementById('submit-btn');
      const msg = document.getElementById('form-message');
      const firstname = document.getElementById('firstname').value.trim();
      const lastname = document.getElementById('lastname').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const sms_consent = document.getElementById('sms_consent').checked;
      const email_consent = document.querySelector('input[name="email_consent"]').checked;
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!firstname) return showMsg(msg, 'Please enter your first name.', 'error');
      if (!email || !emailRe.test(email)) return showMsg(msg, 'Please enter a valid email address.', 'error');
      if (!email_consent) return showMsg(msg, 'Please check the newsletter consent box to subscribe.', 'error');
      if (phone && !sms_consent) return showMsg(msg, 'You entered a phone number — please check the SMS reminders box.', 'error');
      if (sms_consent && !phone) return showMsg(msg, 'Please enter your phone number to receive SMS reminders.', 'error');
      if (phone && phone.replace(/\D/g, '').length !== 10) return showMsg(msg, 'Please enter a complete 10-digit US phone number, e.g. (707) 555-1234.', 'error');

      btn.textContent = 'Sending...';
      btn.disabled = true;
      msg.style.display = 'none';

      try {
        const res = await fetch('/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstname, lastname, email, phone, sms_consent }),
        });
        const json = await res.json();
        if (json.success) {
          showMsg(msg, 'Welcome to La Tercera Garden. Roots down.', 'success');
          msg.style.background = 'rgba(168,197,160,0.15)';
          msg.style.color = '#a8c5a0';
          msg.style.border = '1px solid rgba(168,197,160,0.3)';
          document.getElementById('signup-form').reset();
        } else {
          showMsg(msg, json.error || 'Something went wrong. Please try again later.', 'error');
        }
      } catch(err) {
        showMsg(msg, 'Something went wrong. Please try again later.', 'error');
      }

      btn.textContent = 'Stay in the loop';
      btn.disabled = false;
    });
  
});