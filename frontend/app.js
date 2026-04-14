// ============================================================
// app.js — All frontend logic
// Talks to backend at http://localhost:3000/feedback
// ============================================================

const API_URL = 'https://student-feedback-system-wpi9.onrender.com/feedback';

// -------------------------------------------------------
// STAR RATING LOGIC
// When user clicks a star, save value in hidden input
// -------------------------------------------------------
let selectedRating = 0;

document.querySelectorAll('.star').forEach(star => {
  star.addEventListener('click', function () {
    selectedRating = parseInt(this.getAttribute('data-value'));

    // Update hidden input value
    document.getElementById('rating').value = selectedRating;

    // Update label text
    const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    document.getElementById('ratingLabel').textContent = `${selectedRating} — ${labels[selectedRating]}`;

    // Highlight selected stars (and all before it)
    document.querySelectorAll('.star').forEach((s, index) => {
      if (index < selectedRating) {
        s.classList.add('selected');
      } else {
        s.classList.remove('selected');
      }
    });
  });

  // Hover effect — highlight stars on mouse over
  star.addEventListener('mouseover', function () {
    const hoverValue = parseInt(this.getAttribute('data-value'));
    document.querySelectorAll('.star').forEach((s, index) => {
      if (index < hoverValue) {
        s.style.color = '#f6c90e';
      } else {
        s.style.color = '#cbd5e0';
      }
    });
  });

  // Reset to selected state when mouse leaves
  star.addEventListener('mouseleave', function () {
    document.querySelectorAll('.star').forEach((s, index) => {
      if (index < selectedRating) {
        s.style.color = '#f6c90e';
      } else {
        s.style.color = '#cbd5e0';
      }
    });
  });
});

// -------------------------------------------------------
// SHOW TOAST — temporary success/error message
// -------------------------------------------------------
function showToast(message, type) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;   // adds 'success' or 'error' class
  setTimeout(() => {
    toast.className = 'toast hidden';  // hide after 3 seconds
  }, 3000);
}

// -------------------------------------------------------
// GENERATE STARS HTML — turns number 4 into ★★★★☆
// -------------------------------------------------------
function starsHTML(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating);
}

// -------------------------------------------------------
// FORMAT DATE — turns ISO date into readable format
// -------------------------------------------------------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
}

// -------------------------------------------------------
// LOAD ALL FEEDBACK — runs when page loads
// GET /feedback → show all cards on the right panel
// -------------------------------------------------------
async function loadFeedback() {
  try {
    const response = await fetch(API_URL);         // Send GET request to backend
    const result   = await response.json();        // Parse JSON response
    console.log('data:',result);

    const list         = document.getElementById('feedbackList');
    const emptyState   = document.getElementById('emptyState');
    const loadingState = document.getElementById('loadingState');
    const countBadge   = document.getElementById('feedbackCount');

    // Hide loading spinner
    loadingState.classList.add('hidden');

    if (!result.feedback || result.feedback.length === 0) {
      emptyState.classList.remove('hidden');       // Show "no feedback" message
      countBadge.textContent = '0 entries';
      list.innerHTML = '';
      return;
    }

    // Hide empty state, update count
    emptyState.classList.add('hidden');
    countBadge.textContent = `${result.feedback.length} ${result.feedback.length === 1 ? 'entry' : 'entries'}`;

    // Build a card for each feedback item
    list.innerHTML = result.feedback.map(f => `
      <div class="feedback-card" id="card-${f._id}">
        <div class="card-top">
          <div>
            <div class="card-name">${f.studentName}</div>
            <div class="card-course">📚 ${f.courseName}</div>
          </div>
          <div class="card-stars">${starsHTML(f.rating)}</div>
        </div>
        ${f.comments ? `<div class="card-comment">"${f.comments}"</div>` : ''}
        <div class="card-footer">
          <span class="card-date">${formatDate(f.createdAt)}</span>
          <button class="btn-delete" onclick="deleteFeedback('${f._id}')">🗑 Delete</button>
        </div>
      </div>
    `).join('');

  } catch (error) {
    // Backend not running
    document.getElementById('loadingState').innerHTML = `
      <div class="empty-icon">⚠️</div>
      <p>Cannot connect to server.<br/>Make sure backend is running on port 3000.</p>
    `;
  }
}

// -------------------------------------------------------
// SUBMIT FEEDBACK — runs when Submit button is clicked
// POST /feedback → send form data → refresh list
// -------------------------------------------------------
async function submitFeedback() {
  // Step 1: Read values from form fields
  const studentName = document.getElementById('studentName').value.trim();
  const courseName  = document.getElementById('courseName').value.trim();
  const rating      = parseInt(document.getElementById('rating').value);
  const comments    = document.getElementById('comments').value.trim();

  // Step 2: Validate — check required fields
  if (!studentName) return showToast('Please enter student name', 'error');
  if (!courseName)  return showToast('Please enter course name', 'error');
  if (!rating || rating === 0) return showToast('Please select a star rating', 'error');

  // Step 3: Disable button while submitting
  const btn = document.getElementById('submitBtn');
  btn.disabled    = true;
  btn.textContent = 'Submitting...';

  try {
    // Step 4: Send POST request to backend with form data as JSON
    const response = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ studentName, courseName, rating, comments })
    });

    const result = await response.json();   // Parse response from backend
    console.log('Data from backend:', result);

    if (response.ok) {
      showToast('✅ Feedback submitted successfully!', 'success');

      // Clear form fields
      document.getElementById('studentName').value = '';
      document.getElementById('courseName').value  = '';
      document.getElementById('comments').value    = '';
      document.getElementById('rating').value      = '0';
      document.getElementById('ratingLabel').textContent = 'Click to rate';
      selectedRating = 0;
      document.querySelectorAll('.star').forEach(s => s.classList.remove('selected'));

      // Refresh feedback list to show new entry
      loadFeedback();
    } else {
      showToast(result.message || 'Something went wrong', 'error');
    }

  } catch (error) {
    showToast('Cannot reach server. Is backend running?', 'error');
  } finally {
    // Re-enable button
    btn.disabled    = false;
    btn.textContent = 'Submit Feedback';
  }
}

// -------------------------------------------------------
// DELETE FEEDBACK — runs when Delete button is clicked
// DELETE /feedback/:id → remove from DB → remove from UI
// -------------------------------------------------------
async function deleteFeedback(id) {
  if (!confirm('Delete this feedback?')) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    const result   = await response.json();

    if (response.ok) {
      showToast('Feedback deleted!', 'success');
      loadFeedback();   // Refresh list
    } else {
      showToast(result.message || 'Delete failed', 'error');
    }
  } catch (error) {
    showToast('Cannot reach server.', 'error');
  }
}

// -------------------------------------------------------
// ON PAGE LOAD — immediately fetch all feedback
// -------------------------------------------------------
loadFeedback();