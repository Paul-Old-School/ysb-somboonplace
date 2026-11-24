/* อยู่สมบูรณ์ เพลส (YSB) — Production Frontend Interactions (Static, No Backend) */
(function () {
  'use strict';

  /* 1. Mobile navigation drawer */
  const menuBtn = document.querySelector('.menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  if (menuBtn && mobileNav) {
    function closeMenu() {
      mobileNav.hidden = true;
      menuBtn.setAttribute('aria-expanded', 'false');
    }

    menuBtn.addEventListener('click', function () {
      const isOpen = !mobileNav.hidden;
      mobileNav.hidden = isOpen;
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
    });

    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !mobileNav.hidden) {
        closeMenu();
        menuBtn.focus();
      }
    });
  }

  /* 2. Hero Booking / Search Box (index.html) */
  const checkinInput = document.getElementById('checkin-date');
  const checkoutInput = document.getElementById('checkout-date');
  const nightsDisplay = document.getElementById('nights-display');
  const moveinMonth = document.getElementById('movein-month');
  const dailyRoomSelect = document.getElementById('daily-room-type');
  const monthlyContractSelect = document.getElementById('monthly-contract');
  const summaryPreview = document.getElementById('booking-summary-preview');
  const copyBtn = document.getElementById('copy-inquiry-btn');
  const copyFeedback = document.getElementById('copy-feedback');
  const tabs = document.querySelectorAll('.booking-tab');
  const panelDaily = document.getElementById('panel-daily');
  const panelMonthly = document.getElementById('panel-monthly');

  if (tabs.length > 0) {
    function formatDateISO(dateObj) {
      const y = dateObj.getFullYear();
      const m = String(dateObj.getMonth() + 1).padStart(2, '0');
      const d = String(dateObj.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + d;
    }

    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];

    function formatThaiDate(isoStr) {
      if (!isoStr) return '';
      const parts = isoStr.split('-');
      if (parts.length !== 3) return isoStr;
      const day = String(Number(parts[2]));
      const monthName = thaiMonths[Number(parts[1]) - 1] || parts[1];
      const beYear = Number(parts[0]) + 543;
      return day + ' ' + monthName + ' ' + beYear;
    }

    function formatThaiMonth(ymStr) {
      if (!ymStr) return '';
      const parts = ymStr.split('-');
      if (parts.length !== 2) return ymStr;
      return (thaiMonths[Number(parts[1]) - 1] || parts[1]) + ' ' + (Number(parts[0]) + 543);
    }

    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    if (checkinInput && checkoutInput) {
      const todayStr = formatDateISO(today);
      const tomorrowStr = formatDateISO(tomorrow);
      checkinInput.min = todayStr;
      checkinInput.value = todayStr;
      checkoutInput.min = tomorrowStr;
      checkoutInput.value = tomorrowStr;
    }

    if (moveinMonth) {
      const ym = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
      moveinMonth.min = ym;
      moveinMonth.value = ym;
    }

    let activeMode = 'daily';

    function updateNights() {
      if (!checkinInput || !checkoutInput || !nightsDisplay) return 1;
      const inDate = new Date(checkinInput.value + 'T00:00:00');
      let outDate = new Date(checkoutInput.value + 'T00:00:00');
      if (isNaN(inDate.getTime())) return 1;

      const nextDay = new Date(inDate.getFullYear(), inDate.getMonth(), inDate.getDate() + 1);
      checkoutInput.min = formatDateISO(nextDay);
      if (isNaN(outDate.getTime()) || outDate <= inDate) {
        outDate = nextDay;
        checkoutInput.value = formatDateISO(outDate);
      }

      const diffDays = Math.round((outDate - inDate) / 86400000);
      nightsDisplay.textContent = diffDays + ' คืน';
      return diffDays;
    }

    function buildInquiryText() {
      if (activeMode === 'daily') {
        const nights = updateNights();
        const inText = formatThaiDate(checkinInput ? checkinInput.value : '');
        const outText = formatThaiDate(checkoutInput ? checkoutInput.value : '');
        const roomOpt = dailyRoomSelect ? dailyRoomSelect.options[dailyRoomSelect.selectedIndex].text : 'ห้องรายวัน';
        return 'สวัสดีครับ/ค่ะ สอบถามห้องว่างรายวัน อยู่สมบูรณ์ เพลส · ' + roomOpt + ' · เข้าพัก ' + inText + ' ออก ' + outText + ' (' + nights + ' คืน)';
      }
      const monthText = formatThaiMonth(moveinMonth ? moveinMonth.value : '');
      const contractOpt = monthlyContractSelect ? monthlyContractSelect.options[monthlyContractSelect.selectedIndex].text : 'รายเดือน';
      return 'สวัสดีครับ/ค่ะ สอบถามห้องว่างรายเดือน อยู่สมบูรณ์ เพลส · ' + contractOpt + ' · สตูดิโอ 26 ตร.ม. · ต้องการเข้าอยู่ช่วง ' + monthText;
    }

    function updateSummaryAndHighlights() {
      const inquiry = buildInquiryText();
      if (summaryPreview) {
        summaryPreview.textContent = 'ตัวอย่างข้อความถามทางไลน์: "' + inquiry + '" (ปุ่มด้านบนจะเปิด LINE ID: ysb2015 โดยตรง)';
      }

      document.querySelectorAll('.room-card').forEach(function (card) {
        card.classList.remove('is-highlighted');
      });

      if (activeMode === 'daily' && dailyRoomSelect && dailyRoomSelect.value !== 'all') {
        const target = document.querySelector('.room-card[data-room-id="' + dailyRoomSelect.value + '"]');
        if (target) target.classList.add('is-highlighted');
      } else if (activeMode === 'monthly' && monthlyContractSelect) {
        const target = document.querySelector('.room-card[data-room-id="' + monthlyContractSelect.value + '"]');
        if (target) target.classList.add('is-highlighted');
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        activeMode = tab.dataset.mode || 'daily';
        tabs.forEach(function (t) {
          const selected = t === tab;
          t.classList.toggle('is-active', selected);
          t.setAttribute('aria-selected', String(selected));
        });
        if (panelDaily && panelMonthly) {
          panelDaily.hidden = activeMode !== 'daily';
          panelMonthly.hidden = activeMode !== 'monthly';
        }
        updateSummaryAndHighlights();
      });
    });

    [checkinInput, checkoutInput, dailyRoomSelect, moveinMonth, monthlyContractSelect].forEach(function (el) {
      if (el) el.addEventListener('change', updateSummaryAndHighlights);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        const text = buildInquiryText();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () {
            if (copyFeedback) copyFeedback.textContent = 'คัดลอกแล้ว วางส่งใน LINE ได้เลย';
            setTimeout(function () {
              if (copyFeedback) copyFeedback.textContent = '';
            }, 3000);
          }).catch(function () {
            if (copyFeedback) copyFeedback.textContent = 'คัดลอกไม่ได้ กรุณาพิมพ์ถามทาง LINE ID: ysb2015';
          });
        } else if (copyFeedback) {
          copyFeedback.textContent = 'กรุณาคัดลอกข้อความด้านล่างเพื่อส่งใน LINE ID: ysb2015';
        }
      });
    }

    updateNights();
    updateSummaryAndHighlights();
  }

  /* 3. Room list filter pills (index.html & rooms.html) */
  const filterPills = document.querySelectorAll('.filter-pill');
  const roomCards = document.querySelectorAll('.room-card');
  if (filterPills.length > 0 && roomCards.length > 0) {
    filterPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        const filter = pill.dataset.filter || 'all';
        filterPills.forEach(function (p) {
          p.classList.toggle('is-active', p === pill);
        });
        roomCards.forEach(function (card) {
          card.hidden = !(filter === 'all' || card.dataset.category === filter);
        });
      });
    });
  }

  /* 4. Daily stay transparent cost estimator (rooms.html — verified rates only) */
  const estRoomType = document.getElementById('est-room-type');
  const estNights = document.getElementById('est-nights');
  const estNightsLabel = document.getElementById('est-nights-label');
  const estRoomCost = document.getElementById('est-room-cost');
  const estTotal = document.getElementById('est-total');

  if (estRoomType && estNights && estNightsLabel && estRoomCost && estTotal) {
    function formatBaht(num) {
      return Number(num).toLocaleString('th-TH') + ' บาท';
    }

    function updateEstimator() {
      const rate = Number(estRoomType.value) === 600 ? 600 : 500;
      let nights = parseInt(estNights.value, 10);
      if (isNaN(nights) || nights < 1) nights = 1;
      if (nights > 30) nights = 30;
      estNights.value = String(nights);

      const roomSubtotal = rate * nights;
      const keyDeposit = 300;
      estNightsLabel.textContent = String(nights);
      estRoomCost.textContent = formatBaht(roomSubtotal);
      estTotal.textContent = formatBaht(roomSubtotal + keyDeposit);
    }

    estRoomType.addEventListener('change', updateEstimator);
    estNights.addEventListener('input', updateEstimator);
    estNights.addEventListener('change', updateEstimator);
    updateEstimator();
  }

  /* 5. FAQ Expand/Collapse All toggle (index.html & terms.html) */
  const faqToggleBtn = document.querySelector('[data-faq-toggle-all]');
  const faqGroup = document.querySelector('[data-faq-group]');
  if (faqToggleBtn && faqGroup) {
    const items = Array.from(faqGroup.querySelectorAll('details.faq-item'));
    function syncToggleLabel() {
      const allOpen = items.every(function (d) { return d.open; });
      faqToggleBtn.textContent = allOpen ? 'พับเก็บทุกข้อ' : 'เปิดดูทุกข้อ';
    }

    faqToggleBtn.addEventListener('click', function () {
      const allOpen = items.every(function (d) { return d.open; });
      items.forEach(function (d) { d.open = !allOpen; });
      syncToggleLabel();
    });

    items.forEach(function (d) {
      d.addEventListener('toggle', syncToggleLabel);
    });
  }
})();
