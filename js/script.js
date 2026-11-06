/* ==========================================================================
   MERIDIAN ATHLETIC CLUB — SITE SCRIPT
   ==========================================================================
   This file is split into small, labelled sections. Each section only runs
   if the matching HTML element exists on the current page, so this single
   file can be safely linked from every page.

   Sections in this file:
   1. Mobile navigation menu
   2. Scroll reveal animation
   3. Scoreboard number count-up
   4. Ticker loop
   5. Sport tabs (sports.html)
   6. Fixture filters (matches.html)
   7. Membership plan buttons -> pre-fill the join form
   8. Join form -> opens the payment popup
   9. Pay Now -> validate payment method -> show downloadable receipt
   10. Download receipt as a text file
   11. Contact form validation
   12. Small page helpers (active nav link, footer year)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ======================================================================
     1. MOBILE NAVIGATION MENU
     Toggles the .open class on the hamburger button and the nav links list.
     ====================================================================== */
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navToggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close the menu automatically when a link is tapped
    var allNavLinkEls = navLinks.querySelectorAll('a');
    for (var i = 0; i < allNavLinkEls.length; i++) {
      allNavLinkEls[i].addEventListener('click', function () {
        navToggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    }
  }

  /* ======================================================================
     2. SCROLL REVEAL ANIMATION
     Any element with the class "reveal" fades/slides into view the first
     time it scrolls into the browser window.
     ====================================================================== */
  var revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback for very old browsers: just show everything immediately
    revealElements.forEach(function (el) { el.classList.add('in'); });
  }

  /* ======================================================================
     3. SCOREBOARD NUMBER COUNT-UP
     Elements with a "data-count" attribute animate from 0 up to that
     number when they scroll into view (used on the homepage stat strip).
     ====================================================================== */
  var counterElements = document.querySelectorAll('[data-count]');

  if (counterElements.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var targetValue = parseInt(el.getAttribute('data-count'), 10);
        var suffix = el.getAttribute('data-suffix') || '';
        var durationMs = 1200;
        var startTime = null;

        function animateStep(timestamp) {
          if (startTime === null) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / durationMs, 1);
          var currentValue = Math.floor(progress * targetValue);
          el.textContent = currentValue + suffix;

          if (progress < 1) {
            requestAnimationFrame(animateStep);
          } else {
            el.textContent = targetValue + suffix;
          }
        }

        requestAnimationFrame(animateStep);
        counterObserver.unobserve(el);
      });
    }, { threshold: 0.4 });

    counterElements.forEach(function (el) { counterObserver.observe(el); });
  }

  /* ======================================================================
     4. TICKER LOOP
     The scrolling announcement bar only has one copy of its messages in
     the HTML. We duplicate that content once here so the CSS animation
     can loop seamlessly without a visible jump.
     ====================================================================== */
  var tickerTrack = document.querySelector('.ticker-track');
  if (tickerTrack) {
    tickerTrack.innerHTML = tickerTrack.innerHTML + tickerTrack.innerHTML;
  }

  /* ======================================================================
     5. SPORT TABS (sports.html)
     Clicking a tab button shows the matching panel and hides the rest.
     ====================================================================== */
  var tabBar = document.querySelector('.tab-bar[data-tabs]');
  if (tabBar) {
    var tabButtons = tabBar.querySelectorAll('.tab-btn');

    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-tab');

        // Update which button looks "active"
        tabButtons.forEach(function (b) { b.classList.remove('active'); });
        button.classList.add('active');

        // Show only the matching panel
        document.querySelectorAll('.tab-panel').forEach(function (panel) {
          panel.classList.toggle('active', panel.id === targetId);
        });
      });
    });

    // If the page URL has a hash like sports.html#football, open that tab
    var hashId = window.location.hash.replace('#', '');
    if (hashId) {
      var matchingButton = tabBar.querySelector('[data-tab="' + hashId + '"]');
      if (matchingButton) matchingButton.click();
    }
  }

  /* ======================================================================
     6. FIXTURE FILTERS (matches.html)
     Clicking a filter button shows only fixtures for that sport.
     ====================================================================== */
  var filterBar = document.querySelector('[data-filter-group]');
  if (filterBar) {
    var filterButtons = filterBar.querySelectorAll('.tab-btn');
    var fixtureItems = document.querySelectorAll('[data-sport]');

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var chosenSport = button.getAttribute('data-filter');

        filterButtons.forEach(function (b) { b.classList.remove('active'); });
        button.classList.add('active');

        fixtureItems.forEach(function (item) {
          var shouldShow = chosenSport === 'all' || item.getAttribute('data-sport') === chosenSport;
          item.style.display = shouldShow ? '' : 'none';
        });
      });
    });
  }

  /* ======================================================================
     SHARED FORM-VALIDATION HELPERS
     Used by the join form, the payment popup and the contact form below.
     ====================================================================== */
  function showFieldError(fieldWrapper, message) {
    fieldWrapper.classList.add('has-error');
    var errorEl = fieldWrapper.querySelector('.error-msg');
    if (errorEl) errorEl.textContent = message;
  }

  function clearFieldError(fieldWrapper) {
    fieldWrapper.classList.remove('has-error');
    var errorEl = fieldWrapper.querySelector('.error-msg');
    if (errorEl) errorEl.textContent = '';
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidPhone(value) {
    return /^[0-9+\-\s()]{7,15}$/.test(value);
  }

  /* ======================================================================
     7. MEMBERSHIP PLAN BUTTONS -> PRE-FILL THE JOIN FORM
     Each "Choose Plan" button has a data-plan attribute. Clicking it sets
     the plan dropdown in the join form.
     ====================================================================== */
  var planButtons = document.querySelectorAll('[data-plan]');
  var planSelect = document.getElementById('membership-plan');

  // Prices are kept in one place so every part of the page agrees on them
  var PLAN_PRICES = {
    junior: 1200,
    standard: 2000,
    'all-access': 3200
  };

  var PLAN_LABELS = {
    junior: 'Junior',
    standard: 'Standard',
    'all-access': 'All-Access'
  };

  if (planButtons.length > 0 && planSelect) {
    planButtons.forEach(function (button) {
      button.addEventListener('click', function (e) {
        e.preventDefault();
        planSelect.value = button.getAttribute('data-plan');
        document.getElementById('join').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ======================================================================
     8. JOIN FORM -> OPENS THE PAYMENT POPUP
     Clicking "Submit Application" first validates the applicant's details.
     If everything looks correct, it opens the payment popup instead of
     submitting straight away (this site has no server to submit to).
     ====================================================================== */
  var joinForm = document.getElementById('join-form');
  var paymentModal = document.getElementById('payment-modal');

  function validateJoinForm() {
    var formIsValid = true;

    var nameField = document.getElementById('full-name');
    var emailField = document.getElementById('email');
    var phoneField = document.getElementById('phone');
    var sportField = document.getElementById('sport-interest');
    var planField = document.getElementById('membership-plan');
    var termsField = document.getElementById('agree-terms');

    [nameField, emailField, phoneField, sportField, planField].forEach(function (field) {
      clearFieldError(field.closest('.field'));
    });
    clearFieldError(termsField.closest('.field'));

    if (!nameField.value.trim() || nameField.value.trim().length < 3) {
      showFieldError(nameField.closest('.field'), 'Please enter your full name (at least 3 characters).');
      formIsValid = false;
    }
    if (!isValidEmail(emailField.value.trim())) {
      showFieldError(emailField.closest('.field'), 'Please enter a valid email address.');
      formIsValid = false;
    }
    if (!isValidPhone(phoneField.value.trim())) {
      showFieldError(phoneField.closest('.field'), 'Please enter a valid phone number.');
      formIsValid = false;
    }
    if (!sportField.value) {
      showFieldError(sportField.closest('.field'), 'Please select a sport you are interested in.');
      formIsValid = false;
    }
    if (!planField.value) {
      showFieldError(planField.closest('.field'), 'Please choose a membership plan.');
      formIsValid = false;
    }
    if (!termsField.checked) {
      showFieldError(termsField.closest('.field'), 'Please accept the club terms to continue.');
      formIsValid = false;
    }

    return formIsValid;
  }

  if (joinForm && paymentModal) {
    joinForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateJoinForm()) return;

      // Show the amount for the chosen plan inside the popup, then open it
      var amount = PLAN_PRICES[planSelect.value] || 0;
      document.getElementById('modal-amount-value').textContent = '\u20B9' + amount;
      paymentModal.classList.add('show');
    });
  }

  /* ======================================================================
     PAYMENT POPUP: switching between UPI / Card / Net Banking
     ====================================================================== */
  var payMethodButtons = document.querySelectorAll('.pay-method-btn');
  payMethodButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var method = button.getAttribute('data-method');

      payMethodButtons.forEach(function (b) { b.classList.remove('active'); });
      button.classList.add('active');

      document.querySelectorAll('.pay-method-panel').forEach(function (panel) {
        panel.classList.toggle('active', panel.id === 'method-' + method);
      });
    });
  });

  /* ======================================================================
     PAYMENT POPUP: closing it
     ====================================================================== */
  var modalCloseBtn = document.getElementById('modal-close-btn');
  var receiptCloseBtn = document.getElementById('receipt-close-btn');

  function closePaymentModal() {
    paymentModal.classList.remove('show');
    // Reset the popup back to the payment step for next time it opens
    document.getElementById('payment-step').style.display = 'block';
    document.getElementById('receipt-step').style.display = 'none';
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closePaymentModal);
  if (receiptCloseBtn) {
    receiptCloseBtn.addEventListener('click', function () {
      closePaymentModal();
      joinForm.reset();
    });
  }

  /* ======================================================================
     9. PAY NOW -> VALIDATE PAYMENT METHOD -> SHOW DOWNLOADABLE RECEIPT
     This site is plain HTML/CSS/JS with no server, so there is no real
     bank or payment gateway connected here. This section validates the
     chosen payment method's details the same way a real payment form
     would, then generates a receipt the member can download as a text
     file. Swap this section for a real payment gateway (Razorpay,
     Stripe, etc.) if this project is deployed with a backend.
     ====================================================================== */
  function isValidUPI(value) {
    return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test(value);
  }

  function isValidCardNumber(value) {
    var digitsOnly = value.replace(/\s/g, '');
    return /^[0-9]{16}$/.test(digitsOnly);
  }

  function isValidExpiry(value) {
    // Expects MM/YY and checks the card has not already expired
    var match = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.exec(value);
    if (!match) return false;

    var expMonth = parseInt(match[1], 10);
    var expYear = 2000 + parseInt(match[2], 10);
    var now = new Date();
    var currentYear = now.getFullYear();
    var currentMonth = now.getMonth() + 1;

    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    return true;
  }

  function isValidCVV(value) {
    return /^[0-9]{3}$/.test(value);
  }

  function generateTransactionId() {
    var randomDigits = Math.floor(100000 + Math.random() * 900000);
    return 'MAC-TXN-' + randomDigits;
  }

  // Keeps the receipt text and the on-screen receipt in sync
  var lastReceiptText = '';
  var lastTransactionId = '';

  var payNowBtn = document.getElementById('pay-now-btn');
  if (payNowBtn) {
    payNowBtn.addEventListener('click', function () {
      var activeMethodBtn = document.querySelector('.pay-method-btn.active');
      var method = activeMethodBtn.getAttribute('data-method');
      var methodIsValid = true;
      var methodLabel = '';

      if (method === 'upi') {
        var upiField = document.getElementById('upi-id');
        clearFieldError(upiField.closest('.field'));
        if (!isValidUPI(upiField.value.trim())) {
          showFieldError(upiField.closest('.field'), 'Please enter a valid UPI ID, e.g. name@upi.');
          methodIsValid = false;
        }
        methodLabel = 'UPI (' + upiField.value.trim() + ')';

      } else if (method === 'card') {
        var cardNameField = document.getElementById('card-name');
        var cardNumberField = document.getElementById('card-number');
        var cardExpiryField = document.getElementById('card-expiry');
        var cardCvvField = document.getElementById('card-cvv');

        [cardNameField, cardNumberField, cardExpiryField, cardCvvField].forEach(function (field) {
          clearFieldError(field.closest('.field'));
        });

        if (!cardNameField.value.trim()) {
          showFieldError(cardNameField.closest('.field'), 'Please enter the name on the card.');
          methodIsValid = false;
        }
        if (!isValidCardNumber(cardNumberField.value.trim())) {
          showFieldError(cardNumberField.closest('.field'), 'Please enter a valid 16-digit card number.');
          methodIsValid = false;
        }
        if (!isValidExpiry(cardExpiryField.value.trim())) {
          showFieldError(cardExpiryField.closest('.field'), 'Please enter a valid, unexpired date as MM/YY.');
          methodIsValid = false;
        }
        if (!isValidCVV(cardCvvField.value.trim())) {
          showFieldError(cardCvvField.closest('.field'), 'Please enter a valid 3-digit CVV.');
          methodIsValid = false;
        }

        var last4 = cardNumberField.value.trim().replace(/\s/g, '').slice(-4);
        methodLabel = 'Card ending in ' + last4;

      } else if (method === 'netbanking') {
        var bankField = document.getElementById('bank-select');
        clearFieldError(bankField.closest('.field'));
        if (!bankField.value) {
          showFieldError(bankField.closest('.field'), 'Please select your bank.');
          methodIsValid = false;
        }
        methodLabel = 'Net Banking (' + bankField.value + ')';
      }

      if (!methodIsValid) return;

      // Everything looks correct: simulate a short processing delay,
      // similar to how a real payment gateway takes a moment before
      // confirming the transaction.
      payNowBtn.disabled = true;
      payNowBtn.textContent = 'Processing Payment...';

      setTimeout(function () {
        var nameField = document.getElementById('full-name');
        var sportField = document.getElementById('sport-interest');
        var planField = document.getElementById('membership-plan');

        var firstName = nameField.value.trim();
        var planKey = planField.value;
        var amount = PLAN_PRICES[planKey] || 0;
        var transactionId = generateTransactionId();
        var now = new Date();
        var dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

        lastTransactionId = transactionId;

        // Build the on-screen receipt (HTML)
        var receiptHtml =
          '<div class="receipt-row"><span class="receipt-label">Transaction ID</span><span class="receipt-value">' + transactionId + '</span></div>' +
          '<div class="receipt-row"><span class="receipt-label">Date &amp; Time</span><span class="receipt-value">' + dateString + '</span></div>' +
          '<div class="receipt-row"><span class="receipt-label">Member Name</span><span class="receipt-value">' + firstName + '</span></div>' +
          '<div class="receipt-row"><span class="receipt-label">Sport</span><span class="receipt-value">' + sportField.value + '</span></div>' +
          '<div class="receipt-row"><span class="receipt-label">Membership Plan</span><span class="receipt-value">' + PLAN_LABELS[planKey] + '</span></div>' +
          '<div class="receipt-row"><span class="receipt-label">Payment Method</span><span class="receipt-value">' + methodLabel + '</span></div>' +
          '<div class="receipt-row receipt-total"><span class="receipt-label">Amount Paid</span><span class="receipt-value">\u20B9' + amount + '</span></div>';

        document.getElementById('receipt-content').innerHTML = receiptHtml;

        // Build the plain-text version used for the downloaded file
        lastReceiptText =
          'MERIDIAN ATHLETIC CLUB - PAYMENT RECEIPT\n' +
          '========================================\n' +
          'Transaction ID : ' + transactionId + '\n' +
          'Date & Time    : ' + dateString + '\n' +
          'Member Name    : ' + firstName + '\n' +
          'Sport          : ' + sportField.value + '\n' +
          'Membership Plan: ' + PLAN_LABELS[planKey] + '\n' +
          'Payment Method : ' + methodLabel + '\n' +
          '----------------------------------------\n' +
          'Amount Paid    : Rs. ' + amount + '\n' +
          '========================================\n' +
          'Thank you for joining Meridian Athletic Club!\n';

        // Switch the popup from the payment form to the receipt view
        document.getElementById('payment-step').style.display = 'none';
        document.getElementById('receipt-step').style.display = 'block';

        payNowBtn.disabled = false;
        payNowBtn.textContent = 'Pay Now';

        // Show a confirmation message on the page behind the popup too
        var successBox = document.getElementById('join-success');
        successBox.classList.add('show');
        successBox.textContent = 'Payment successful! Your Meridian Athletic Club membership is confirmed.';
      }, 1500);
    });
  }

  /* ======================================================================
     10. DOWNLOAD RECEIPT AS A TEXT FILE
     Builds a small text file in the browser (no server needed) and
     triggers a normal file download using a temporary link element.
     ====================================================================== */
  var downloadReceiptBtn = document.getElementById('download-receipt-btn');
  if (downloadReceiptBtn) {
    downloadReceiptBtn.addEventListener('click', function () {
      var fileBlob = new Blob([lastReceiptText], { type: 'text/plain' });
      var downloadUrl = URL.createObjectURL(fileBlob);

      var tempLink = document.createElement('a');
      tempLink.href = downloadUrl;
      tempLink.download = 'Meridian-Receipt-' + lastTransactionId + '.txt';
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      URL.revokeObjectURL(downloadUrl);
    });
  }

  /* ======================================================================
     11. CONTACT FORM VALIDATION (join.html)
     ====================================================================== */
  var contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var formIsValid = true;

      var nameField = document.getElementById('c-name');
      var emailField = document.getElementById('c-email');
      var messageField = document.getElementById('c-message');

      [nameField, emailField, messageField].forEach(function (field) {
        clearFieldError(field.closest('.field'));
      });

      if (!nameField.value.trim()) {
        showFieldError(nameField.closest('.field'), 'Please enter your name.');
        formIsValid = false;
      }
      if (!isValidEmail(emailField.value.trim())) {
        showFieldError(emailField.closest('.field'), 'Please enter a valid email address.');
        formIsValid = false;
      }
      if (!messageField.value.trim() || messageField.value.trim().length < 10) {
        showFieldError(messageField.closest('.field'), 'Message should be at least 10 characters.');
        formIsValid = false;
      }

      var successBox = document.getElementById('contact-success');
      if (formIsValid) {
        successBox.classList.add('show');
        successBox.textContent = 'Message sent. Thanks for reaching out - we will reply soon.';
        contactForm.reset();
      } else {
        successBox.classList.remove('show');
      }
    });
  }

  /* ======================================================================
     12. SMALL PAGE HELPERS
     ====================================================================== */

  // Highlight the current page's link in the navbar
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    var linkPage = link.getAttribute('href').split('#')[0];
    if (linkPage === currentPage) link.classList.add('active');
  });

  // Show the current year in the footer copyright line
  var yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
