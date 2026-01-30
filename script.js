/* FINAL SHARE SCRIPT — optimized for OG previews on all platforms */

let sharerName = 'a friend';
let recipientName = null;

// Utility: get URL param
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Utility: show recipient
function showForWho(name) {
  const el = document.getElementById('forWho');
  if (!el) return;
  el.textContent = name ? `For: ${name}` : '';
}

// On load
window.addEventListener('DOMContentLoaded', () => {
  const promptName = prompt("Who's sharing this? (your name will appear when shared)");
  if (promptName && promptName.trim()) sharerName = promptName.trim();

  const loginContainer = document.getElementById('loginContainer');
  const note = document.createElement('div');
  note.id = 'sharedBy';
  note.textContent = `Shared by: ${sharerName}`;
  note.style.marginTop = '10px';
  note.style.fontSize = '14px';
  note.style.color = '#8a5a6b';
  loginContainer.appendChild(note);

  const toParam = getParam('to');
  if (toParam) {
    recipientName = decodeURIComponent(toParam);
    showForWho(recipientName);
  }
});

// Unlock logic
function checkPassword() {
  const input = document.getElementById('password').value.trim();
  if (!input) {
    alert("Please enter the recipient's name to unlock.");
    return;
  }

  if (recipientName) {
    if (input.toLowerCase() === recipientName.toLowerCase()) {
      revealMessage();
    } else {
      alert('That is not the correct recipient name for this message.');
    }
  } else {
    recipientName = input;
    showForWho(recipientName);
    revealMessage();
  }
}

function revealMessage() {
  document.getElementById('loginContainer').classList.add('hidden');
  document.getElementById('messageContainer').classList.remove('hidden');
  addShareButtons(sharerName);
}

// SHARE BUTTONS — OG PREVIEW SAFE
function addShareButtons(sharer) {
  if (document.getElementById('shareRow')) return;

  if (!recipientName) {
    const ask = prompt("Who are you sending this to?");
    if (!ask || !ask.trim()) return;
    recipientName = ask.trim();
    showForWho(recipientName);
  }

  const container = document.getElementById('messageContainer');
  const shareRow = document.createElement('div');
  shareRow.id = 'shareRow';
  shareRow.className = 'share-row';

  const baseUrl = window.location.origin + window.location.pathname;
  const pageUrl = `${baseUrl}?to=${encodeURIComponent(recipientName)}`;
  const urlEncoded = encodeURIComponent(pageUrl);

  const teaser = encodeURIComponent(
    `i made this instead of texting you. tap gently. — ${sharer}`
  );

  // Native share (mobile)
  const webShareButton = document.createElement('button');
  webShareButton.className = 'share-btn';
  webShareButton.textContent = 'Share';
  webShareButton.onclick = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'soft launch: my feelings',
        text: 'i made this instead of texting you.',
        url: pageUrl
      });
    }
  };
  shareRow.appendChild(webShareButton);

  const makeLink = (label, href) => {
    const a = document.createElement('a');
    a.className = 'share-btn';
    a.textContent = label;
    a.href = href;
    a.target = '_blank';
    return a;
  };

  // Twitter / X
  shareRow.appendChild(
    makeLink(
      'Twitter',
      `https://twitter.com/intent/tweet?text=${teaser}&url=${urlEncoded}`
    )
  );

  // Facebook (URL ONLY → OG preview)
  shareRow.appendChild(
    makeLink(
      'Facebook',
      `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}`
    )
  );

  // WhatsApp (URL ONLY — THIS FIXES YOUR ISSUE)
  shareRow.appendChild(
    makeLink(
      'WhatsApp',
      `https://wa.me/?text=${urlEncoded}`
    )
  );

  // Telegram
  shareRow.appendChild(
    makeLink(
      'Telegram',
      `https://t.me/share/url?url=${urlEncoded}`
    )
  );

  // LinkedIn
  shareRow.appendChild(
    makeLink(
      'LinkedIn',
      `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`
    )
  );

  // Email
  shareRow.appendChild(
    makeLink(
      'Email',
      `mailto:?subject=soft launch: my feelings&body=i made this instead of texting you.%0A%0A${pageUrl}`
    )
  );

  container.appendChild(shareRow);
}
