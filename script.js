/* Updated script: per-link recipient password and share prompts */

let sharerName = 'a friend';
let recipientName = null;

// Utility: get URL param
function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// Utility: set "forWho" display on login card
function showForWho(name) {
  const el = document.getElementById('forWho');
  if (!el) return;
  el.textContent = name ? `For: ${name}` : '';
}

// On load: ask who is sharing, read ?to=Recipient and show notes
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

// Check password: if page was sent with ?to=Name require that Name, otherwise require user to enter recipient's name and treat that as the required name for this session
function checkPassword() {
  const input = document.getElementById('password').value.trim();
  if (!input) {
    alert("Please enter the recipient's name to unlock.");
    return;
  }

  if (recipientName) {
    // Require the recipient from the link
    if (input.toLowerCase() === recipientName.toLowerCase()) {
      revealMessage();
    } else {
      alert('That is not the correct recipient name for this message.');
    }
  } else {
    // No recipient set in the URL: treat the entered name as the intended recipient and unlock
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

// Build share links that embed the recipient so every copy requires that recipient's name to unlock
function addShareButtons(sharer) {
  if (document.getElementById('shareRow')) return;

  // If no recipient set yet, ask who the sharer is sending this to now
  if (!recipientName) {
    const ask = prompt("Who are you sending this to? (enter recipient's name)");
    if (!ask || !ask.trim()) {
      alert('Sharing cancelled — recipient name is required to create a personalized unlock link.');
      return;
    }
    recipientName = ask.trim();
    showForWho(recipientName);
  }

  const container = document.getElementById('messageContainer');
  const shareRow = document.createElement('div');
  shareRow.id = 'shareRow';
  shareRow.className = 'share-row';

  const messageText = document.getElementById('heartfeltMessage').innerText.trim();
  const currentUrlBase = window.location.origin + window.location.pathname;
  const personalizedUrl = `${currentUrlBase}?to=${encodeURIComponent(recipientName)}`;
  const pageUrl = personalizedUrl;
  const shareTitle = encodeURIComponent("Unlock the Treasure of My Heart");
  const shareTextPlain = `${messageText}\n\n— Shared by ${sharer} (for ${recipientName})`;
  const shareText = encodeURIComponent(shareTextPlain);
  const urlEncoded = encodeURIComponent(pageUrl);

  // Web Share API (mobile)
  const webShareButton = document.createElement('button');
  webShareButton.className = 'share-btn';
  webShareButton.textContent = 'Share';
  webShareButton.onclick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Unlock the Treasure of My Heart", text: shareTextPlain, url: pageUrl });
      } catch (e) {
        alert('Share cancelled or not available.');
      }
    } else {
      alert('Native share is not available on this device. Use one of the social buttons.');
    }
  };
  shareRow.appendChild(webShareButton);

  // Social buttons
  const makeLink = (text, href) => {
    const a = document.createElement('a');
    a.className = 'share-btn';
    a.textContent = text;
    a.href = href;
    a.target = '_blank';
    return a;
  };

  const tw = makeLink('Twitter', `https://twitter.com/intent/tweet?text=${shareText}&url=${urlEncoded}`);
  shareRow.appendChild(tw);

  const fb = makeLink('Facebook', `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${shareText}`);
  shareRow.appendChild(fb);

  const wa = makeLink('WhatsApp', `https://wa.me/?text=${shareText}%20${urlEncoded}`);
  shareRow.appendChild(wa);

  const tg = makeLink('Telegram', `https://t.me/share/url?url=${urlEncoded}&text=${shareText}`);
  shareRow.appendChild(tg);

  const li = makeLink('LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`);
  shareRow.appendChild(li);

  const em = document.createElement('a');
  em.className = 'share-btn';
  em.textContent = 'Email';
  em.href = `mailto:?subject=${shareTitle}&body=${shareText}%0A%0A${urlEncoded}`;
  shareRow.appendChild(em);

  container.appendChild(shareRow);
}