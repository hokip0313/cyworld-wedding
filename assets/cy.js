/* ============================================================================
 *  싸이월드 미니홈피 청첩장 — 화면 그리기
 *  ⚠️ 이 파일은 고치지 않아도 됩니다. 내용은 config.js 에서 바꿔주세요.
 * ========================================================================== */
(function () {
  'use strict';

  var C = window.WEDDING || {};
  var app = document.getElementById('app');

  /* ── 작은 도구들 ───────────────────────────────────────────────────── */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nl2br(s) { return esc(s).replace(/\n/g, '<br>'); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // 사진·음악 주소는 같은 사이트의 파일 또는 https 주소만 사용합니다.
  function safeUrl(u) {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^https:\/\//i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) || u.indexOf('//') === 0) return '';
    return u;
  }
  function store(k, v) {
    try {
      if (v === undefined) return localStorage.getItem('cy:' + k);
      localStorage.setItem('cy:' + k, v);
    } catch (e) { return null; }
  }
  function firstNameOf(p) {
    if (p.firstName) return p.firstName;
    var n = String(p.name || '').trim();
    return n.length >= 3 ? n.slice(1) : n;
  }

  /* ── 설정 검사 ─────────────────────────────────────────────────────── */
  var G = C.groom || {}, B = C.bride || {}, W = C.wedding || {}, H = C.hompy || {};
  var problems = [];
  if (!G.name) problems.push('groom.name (신랑 이름)');
  if (!B.name) problems.push('bride.name (신부 이름)');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(W.date || '')) problems.push("wedding.date ('2027-05-15' 형식)");
  if (!/^\d{2}:\d{2}$/.test(W.time || '')) problems.push("wedding.time ('12:00' 형식)");
  if (!W.venue) problems.push('wedding.venue (예식장 이름)');
  var weddingAt = new Date((W.date || '') + 'T' + (W.time || '') + ':00+09:00');
  if (!problems.length && isNaN(weddingAt)) problems.push('wedding.date / wedding.time (존재하지 않는 날짜)');
  if (problems.length) {
    app.innerHTML = '<div class="cy-error"><h1>⚠ config.js 를 확인해주세요</h1><p>아래 항목이 비어 있거나 형식이 맞지 않아요.</p><ul>' +
      problems.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul></div>';
    return;
  }

  var gFirst = firstNameOf(G), bFirst = firstNameOf(B);
  var couple = gFirst + ' ♥ ' + bFirst;
  var hompyTitle = H.title || couple + '의 미니홈피';
  var DAYS = ['일', '월', '화', '수', '목', '금', '토'];
  // 날짜 계산은 항상 한국 시간 기준
  var kst = new Date(weddingAt.getTime() + 9 * 3600 * 1000);
  var wy = kst.getUTCFullYear(), wm = kst.getUTCMonth() + 1, wd = kst.getUTCDate(), wday = kst.getUTCDay();
  var wh = kst.getUTCHours(), wmin = kst.getUTCMinutes();
  var timeText = (wh < 12 ? '오전 ' : wh === 12 ? '낮 ' : '오후 ') + (wh % 12 || 12) + '시' + (wmin ? ' ' + wmin + '분' : '');
  var dateText = wy + '년 ' + wm + '월 ' + wd + '일 ' + DAYS[wday] + '요일 ' + timeText;
  var dotDate = wy + '.' + pad(wm) + '.' + pad(wd);
  var venueText = [W.venue, W.hall].filter(Boolean).join(' ');
  var pageUrl = location.href.split('#')[0];

  document.title = (C.meta && C.meta.title) || couple + ' 결혼합니다';
  var desc = (C.meta && C.meta.description) || dateText + ' · ' + venueText;
  [['meta[name="description"]', desc], ['meta[property="og:title"]', document.title], ['meta[property="og:description"]', desc]].forEach(function (m) {
    var el = $(m[0]); if (el) el.setAttribute('content', m[1]);
  });

  function dday() {
    var now = new Date(Date.now() + 9 * 3600 * 1000);
    var today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    var diff = Math.round((Date.UTC(wy, wm - 1, wd) - today) / 86400000);
    return diff > 0 ? 'D-' + diff : diff === 0 ? 'D-DAY' : 'D+' + (-diff);
  }

  /* ── 도트 미니미 (픽셀 그림) ───────────────────────────────────────── */
  var PAL = {
    k: '#2b2b2b', s: '#ffd9b8', e: '#222', c: '#ff9db0', m: '#e0526b', n: '#2d3a6b', t: '#e23b3b',
    w: '#ffffff', b: '#6b3e26', p: '#ff6f9a', d: '#fbeff4', g: '#c9a227', o: '#ff8a3d', h: '#7a7a7a', v: '#8fc3ff'
  };
  var MINIMI = {
    groom: [
      '...kkkkkk...', '..kkkkkkkk..', '..kssssssk..', '..sesssses..', '..cssmmssc..', '...ssssss...',
      '..nnnwwnnn..', '.nnnnttnnnn.', '.snnnttnnns.', '..nnnttnnn..', '..nnnnnnnn..', '..nnn..nnn..',
      '..nnn..nnn..', '..kkk..kkk..'
    ],
    bride: [
      '..wbbbbbbw..', '.wbbbbbbbbw.', '.wbssssssbw.', '.wsesssesbw.', '.wcssmmsscw.', '.wbssssssbw.',
      '.wbddppddbw.', '.sdddppddds.', '..dddddddd..', '..dddddddd..', '.dddddddddd.', '.dddddddddd.',
      'dddddddddddd', '...gg..gg...'
    ],
    guest: [
      '...oooooo...', '..oooooooo..', '..osssssso..', '..sesssses..', '..cssmmssc..', '...ssssss...',
      '..vvvvvvvv..', '.vvvvvvvvvv.', '.svvvvvvvvs.', '..vvvvvvvv..', '..hhhhhhhh..', '..hhh..hhh..',
      '..hhh..hhh..', '..kkk..kkk..'
    ]
  };
  function minimi(kind, size) {
    var rows = MINIMI[kind] || MINIMI.guest, rects = '';
    rows.forEach(function (row, y) {
      for (var x = 0; x < row.length; x++) {
        var col = PAL[row[x]];
        if (col) rects += '<rect x="' + x + '" y="' + y + '" width="1.02" height="1.02" fill="' + col + '"/>';
      }
    });
    return '<svg class="minimi" viewBox="-1 -1 14 16" width="' + (size || 36) + '" shape-rendering="crispEdges" aria-hidden="true">' + rects + '</svg>';
  }
  function guestKind(name) {
    var h = 0; String(name).split('').forEach(function (ch) { h = (h * 31 + ch.charCodeAt(0)) % 997; });
    return ['guest', 'groom', 'bride'][h % 3];
  }

  function miniroom() {
    var mm = function (kind, x, y) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(3.2)">' + minimi(kind).replace(/<\/?svg[^>]*>/g, '') + '</g>';
    };
    return '<svg class="miniroom" viewBox="0 0 320 220" role="img" aria-label="두 사람의 미니룸">' +
      '<polygon points="0,60 160,10 160,120 0,170" fill="#fff1b8"/>' +
      '<polygon points="160,10 320,60 320,170 160,120" fill="#ffd9e4"/>' +
      '<polygon points="0,170 160,120 320,170 160,220" fill="#e7b982"/>' +
      '<g stroke="#d49e64" stroke-width="1">' +
        '<line x1="40" y1="157.5" x2="200" y2="207.5"/><line x1="80" y1="145" x2="240" y2="195"/><line x1="120" y1="132.5" x2="280" y2="182.5"/></g>' +
      // 창문
      '<polygon points="30,88 100,66 100,112 30,134" fill="#bfe6ff" stroke="#fff" stroke-width="4"/>' +
      '<line x1="65" y1="77" x2="65" y2="123" stroke="#fff" stroke-width="3"/>' +
      '<text x="48" y="104" font-size="12" fill="#fff">☁</text>' +
      // 액자
      '<polygon points="205,58 275,80 275,126 205,104" fill="#fff" stroke="#c9a26b" stroke-width="4"/>' +
      '<text x="231" y="100" font-size="22" fill="#ff5c8a">♥</text>' +
      // 가랜드
      '<path d="M170 40 Q 210 62 250 54 T 315 70" fill="none" stroke="#999" stroke-width="1"/>' +
      '<g fill="#ff8fb1"><circle cx="190" cy="50" r="4"/><circle cx="230" cy="57" r="4"/><circle cx="270" cy="58" r="4"/><circle cx="300" cy="66" r="4"/></g>' +
      // 화분
      '<rect x="20" y="150" width="18" height="16" fill="#c96a3a"/><circle cx="29" cy="142" r="11" fill="#5fb85f"/><circle cx="22" cy="134" r="7" fill="#79cc6e"/>' +
      // 케이크
      '<rect x="146" y="166" width="30" height="14" fill="#fff" stroke="#e6a"/><rect x="151" y="156" width="20" height="10" fill="#fff" stroke="#e6a"/>' +
      '<rect x="160" y="148" width="2" height="8" fill="#f5c542"/><circle cx="161" cy="146" r="2" fill="#ff8a3d"/>' +
      mm('groom', 98, 128) + mm('bride', 186, 128) +
      '<text x="160" y="36" font-size="13" text-anchor="middle" fill="#ff5c8a" class="miniroom__float">♥</text>' +
      '</svg>';
  }

  /* ── 탭 구성 ───────────────────────────────────────────────────────── */
  var A = C.accounts || {};
  var hasAccounts = (A.groom || []).length + (A.bride || []).length > 0;
  var photos = ((C.gallery || {}).photos || []).filter(function (p) { return p && safeUrl(p.src); });
  var TABS = [
    ['home', '홈'], ['profile', '프로필'], ['diary', '다이어리'], ['photo', '사진첩'],
    ['map', '오시는길'], hasAccounts ? ['gift', '선물가게'] : null, ['guest', '방명록']
  ].filter(Boolean);

  /* ── 공통 틀 ───────────────────────────────────────────────────────── */
  var M = C.music || {};
  var musicSrc = safeUrl(M.src);
  var profileSrc = safeUrl(C.profileImage);

  function shell() {
    var song = [M.title, M.artist].filter(Boolean).join(' - ') || '배경음악';
    return '' +
      '<header class="bgm">' +
        '<span class="bgm__label">BGM</span>' +
        '<div class="bgm__marquee"><span>♬ ' + esc(song) + ' ♬</span></div>' +
        (musicSrc ? '<button type="button" class="bgm__btn" data-action="music" aria-label="배경음악 재생/정지" aria-pressed="false">▶</button><audio src="' + esc(musicSrc) + '" loop preload="none"></audio>' : '') +
      '</header>' +
      '<div class="hompy">' +
        '<div class="hompy__counter"><span>TODAY</span> <b class="or">' + dday() + '</b><i>|</i><span>WEDDING</span> <b>' + dotDate + '</b></div>' +
        '<div class="hompy__body">' +
          '<section class="hompy__paper">' +
            '<div class="hompy__head"><h1>' + esc(hompyTitle) + '</h1><span class="hompy__url">' + esc(location.host || 'cyworld.com') + '</span></div>' +
            '<div class="hompy__page" id="page" tabindex="-1"></div>' +
          '</section>' +
          '<nav class="tabs" aria-label="메뉴">' + TABS.map(function (t) {
            return '<a href="#/' + t[0] + '" class="tab" data-tab="' + t[0] + '">' + t[1].split('').join('<br>') + '</a>';
          }).join('') + '</nav>' +
        '</div>' +
      '</div>' +
      '<footer class="foot">ⓒ ' + esc(couple) + ' · since ' + dotDate + '</footer>' +
      '<div class="toast" role="status" aria-live="polite"></div>';
  }

  function box(title, inner, extra) {
    return '<section class="box' + (extra ? ' ' + extra : '') + '"><h2 class="box__title">' + title + '</h2>' + inner + '</section>';
  }
  function profilePhoto() {
    var fallback = '<div class="photo__dot">' + minimi('groom', 44) + minimi('bride', 44) + '</div>';
    return '<div class="photo">' + (profileSrc
      ? '<img src="' + esc(profileSrc) + '" alt="' + esc(couple) + ' 프로필 사진" onerror="this.parentNode.classList.add(\'is-empty\')">' + fallback
      : fallback) + '</div>';
  }
  function parentsLine(p) {
    var mark = function (x) { return x && x.name ? (x.deceased ? '故 ' : '') + esc(x.name) : ''; };
    var names = [mark(p.father), mark(p.mother)].filter(Boolean).join(' · ');
    return names ? names + '<small>의 ' + esc(p.relation || '') + '</small>' : '';
  }

  /* ── 페이지: 홈 ────────────────────────────────────────────────────── */
  function pageHome() {
    return '' +
      '<div class="home-top">' +
        '<div class="home-top__left">' + profilePhoto() +
          '<p class="mood">오늘의 기분 <b>' + esc(H.mood || '행복') + '</b> 😊</p>' +
        '</div>' +
        '<div class="home-top__right">' +
          '<p class="intro">' + nl2br(H.intro || '') + '</p>' +
          '<p class="names">' + esc(G.name) + ' <span class="sex m">♂</span><br>' + esc(B.name) + ' <span class="sex f">♀</span></p>' +
          '<label class="wave"><span class="sr">공유하기</span><select data-action="wave">' +
            '<option value="">▼ 파도타기</option><option value="copy">🔗 청첩장 링크 복사</option>' +
            (navigator.share ? '<option value="share">📤 다른 앱으로 공유</option>' : '') +
            '<option value="calendar">📅 내 캘린더에 추가</option></select></label>' +
        '</div>' +
      '</div>' +
      box('Updated news', '<ul class="news">' +
        '<li><a href="#/diary"><em>[다이어리]</em> ' + esc((C.diary || {}).title || '저희 결혼합니다') + ' <span class="new">N</span></a></li>' +
        '<li><a href="#/diary"><em>[일정]</em> ' + esc(dateText) + '</a></li>' +
        '<li><a href="#/map"><em>[게시판]</em> ' + esc(venueText) + ' 오시는 길</a></li>' +
        '<li><a href="#/photo"><em>[사진첩]</em> ' + (photos.length ? '사진 ' + photos.length + '장이 올라왔어요' : '곧 사진이 올라와요') + '</a></li>' +
        '<li><a href="#/guest"><em>[방명록]</em> 축하 한마디 남겨주세요 ♥</a></li></ul>') +
      box('Mini Room', '<div class="room">' + miniroom() + '</div>') +
      '<button type="button" class="cy-btn cy-btn--big" data-action="rsvp">✚ 일촌 신청 <small>(참석 의사 전달)</small></button>' +
      box('일촌평', '<form class="ilchon-form" data-form="ilchon">' +
        '<input name="name" maxlength="10" placeholder="이름" aria-label="이름" required>' +
        '<input name="message" maxlength="40" placeholder="축하 한마디 (40자)" aria-label="일촌평" required>' +
        '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<button type="submit" class="cy-btn">확인</button></form>' +
        '<ul class="ilchon" data-gb-short><li class="muted">불러오는 중…</li></ul>');
  }

  /* ── 페이지: 프로필 ────────────────────────────────────────────────── */
  function person(p, kind, label) {
    var phone = String(p.phone || '').replace(/[^0-9+]/g, '');
    return '<div class="person">' +
      '<div class="person__ava">' + minimi(kind, 56) + '</div>' +
      '<div class="person__info"><p class="person__role">' + label + '</p>' +
      '<p class="person__name">' + esc(p.name) + '</p>' +
      '<p class="person__parents">' + parentsLine(p) + '</p>' +
      (phone ? '<p class="person__links"><a class="cy-btn" href="tel:' + esc(phone) + '">☎ 전화</a> <a class="cy-btn" href="sms:' + esc(phone) + '">✉ 문자</a></p>' : '') +
      '</div></div>';
  }
  function parentContacts(p) {
    return ['father', 'mother'].map(function (k) {
      var x = p[k] || {}, phone = String(x.phone || '').replace(/[^0-9+]/g, '');
      return phone && x.name ? '<li>' + (k === 'father' ? '아버지 ' : '어머니 ') + esc(x.name) +
        ' <a href="tel:' + esc(phone) + '">☎</a> <a href="sms:' + esc(phone) + '">✉</a></li>' : '';
    }).join('');
  }
  function pageProfile() {
    var parents = parentContacts(G) + parentContacts(B);
    return box('PROFILE', person(G, 'groom', '신랑') + '<p class="ilchon-link">♥ 일촌명 : <b>' + esc(H.ilchonName || '평생짝꿍') + '</b> ♥</p>' + person(B, 'bride', '신부')) +
      (parents ? box('혼주께 연락하기', '<ul class="plain">' + parents + '</ul>') : '') +
      '<button type="button" class="cy-btn cy-btn--big" data-action="rsvp">✚ 일촌 신청 <small>(참석 의사 전달)</small></button>';
  }

  /* ── 페이지: 다이어리 ─────────────────────────────────────────────── */
  function calendarHtml() {
    var first = new Date(Date.UTC(wy, wm - 1, 1)).getUTCDay();
    var last = new Date(Date.UTC(wy, wm, 0)).getUTCDate();
    var cells = '';
    for (var i = 0; i < first; i++) cells += '<span></span>';
    for (var d = 1; d <= last; d++) {
      var dow = (first + d - 1) % 7;
      cells += '<span class="' + (d === wd ? 'is-day' : dow === 0 ? 'sun' : dow === 6 ? 'sat' : '') + '">' + d + '</span>';
    }
    return '<div class="cal"><p class="cal__head">' + wy + '. ' + pad(wm) + '</p>' +
      '<div class="cal__grid">' + DAYS.map(function (x, j) { return '<b class="' + (j === 0 ? 'sun' : j === 6 ? 'sat' : '') + '">' + x + '</b>'; }).join('') + cells + '</div></div>';
  }
  function pageDiary() {
    var D = C.diary || {};
    return '<div class="diary">' + calendarHtml() +
      '<div class="dday"><b data-dday>' + dday() + '</b><p data-countdown></p></div></div>' +
      box(esc(D.title || '저희 결혼합니다'),
        '<p class="diary__meta">' + dotDate + ' ' + DAYS[wday] + ' · 날씨 ' + esc(D.weather || '☀️') + ' · 기분 ' + esc(H.mood || '행복') + '</p>' +
        '<p class="diary__text">' + nl2br(D.message || '') + '</p>' +
        '<p class="diary__parents">' + parentsLine(G) + ' ' + esc(gFirst) + '<br>' + parentsLine(B) + ' ' + esc(bFirst) + '</p>', 'box--diary') +
      box('예식 안내', '<dl class="info"><dt>일시</dt><dd>' + esc(dateText) + '</dd><dt>장소</dt><dd>' + esc(venueText) + '</dd>' +
        (W.address ? '<dt>주소</dt><dd>' + esc(W.address) + '</dd>' : '') + '</dl>' +
        '<p class="row"><button type="button" class="cy-btn" data-action="calendar">📅 캘린더에 추가</button> <a class="cy-btn" href="#/map">🗺 오시는 길</a></p>');
  }

  /* ── 페이지: 사진첩 ───────────────────────────────────────────────── */
  function pagePhoto() {
    var folder = (C.gallery || {}).folder || '우리 둘';
    var list = photos.length ? photos.map(function (p, i) {
      return '<article class="post">' +
        '<header class="post__head"><b>' + esc(p.title || folder + ' #' + (i + 1)) + '</b><span>' + dotDate + '</span></header>' +
        '<button type="button" class="post__img" data-action="lightbox" data-index="' + i + '" aria-label="사진 크게 보기">' +
        '<img src="' + esc(safeUrl(p.src)) + '" alt="' + esc(p.title || '사진 ' + (i + 1)) + '" loading="lazy"></button>' +
        '<footer class="post__foot"><button type="button" class="cy-link" data-action="scrap">스크랩</button> | <span>댓글 ♥</span></footer></article>';
    }).join('') : '<div class="empty">' + minimi('groom', 40) + minimi('bride', 40) + '<p>사진첩 준비 중이에요.<br>곧 예쁜 사진이 올라올 거예요!</p></div>';
    return '<div class="folders"><span class="folder is-on">📁 ' + esc(folder) + ' (' + photos.length + ')</span></div>' + list;
  }

  /* ── 페이지: 오시는 길 ────────────────────────────────────────────── */
  function pageMap() {
    var q = encodeURIComponent(W.venue || W.address);
    var lat = parseFloat(W.lat), lng = parseFloat(W.lng), hasXY = isFinite(lat) && isFinite(lng);
    var kakao = hasXY ? 'https://map.kakao.com/link/map/' + encodeURIComponent(W.venue) + ',' + lat + ',' + lng : 'https://map.kakao.com/link/search/' + q;
    var transport = (C.transport || []).filter(function (t) { return t && t.title; });
    return box('📍 ' + esc(venueText), '<div class="map-card"><div class="map-card__pin">' + minimi('groom', 30) + '<span>♥</span>' + minimi('bride', 30) + '</div>' +
        '<p><b>' + esc(W.venue) + '</b>' + (W.hall ? ' ' + esc(W.hall) : '') + '</p>' +
        (W.address ? '<p>' + esc(W.address) + '</p>' : '') +
        (W.tel ? '<p>☎ <a href="tel:' + esc(String(W.tel).replace(/[^0-9]/g, '')) + '">' + esc(W.tel) + '</a></p>' : '') + '</div>' +
        '<p class="row">' +
          '<a class="cy-btn" target="_blank" rel="noopener" href="https://map.naver.com/p/search/' + q + '">네이버 지도</a> ' +
          '<a class="cy-btn" target="_blank" rel="noopener" href="' + esc(kakao) + '">카카오맵</a> ' +
          (hasXY ? '<a class="cy-btn" href="tmap://route?goalname=' + encodeURIComponent(W.venue) + '&goalx=' + lng + '&goaly=' + lat + '">티맵</a> ' : '') +
          (W.address ? '<button type="button" class="cy-btn" data-action="copy" data-copy="' + esc(W.address) + '">주소 복사</button>' : '') +
        '</p>') +
      (transport.length ? box('교통 안내', transport.map(function (t) {
        return '<div class="board"><p class="board__title">▶ ' + esc(t.title) + '</p><ul>' +
          (t.lines || []).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul></div>';
      }).join('')) : '');
  }

  /* ── 페이지: 선물가게 (계좌) ──────────────────────────────────────── */
  function pageGift() {
    function group(list, label) {
      if (!list || !list.length) return '';
      return box('🌰 ' + label + '측 도토리 보내기', list.map(function (a) {
        var line = [a.bank, a.number].filter(Boolean).join(' ');
        return '<div class="acct"><p><b>' + esc(a.label || '') + '</b> ' + esc(a.holder || '') + '</p><p class="acct__num">' + esc(line) + '</p>' +
          '<button type="button" class="cy-btn" data-action="copy" data-copy="' + esc(line) + '">복사</button></div>';
      }).join(''));
    }
    return '<p class="notice">' + nl2br(A.message || '') + '</p>' + group(A.groom, '신랑') + group(A.bride, '신부');
  }

  /* ── 페이지: 방명록 ───────────────────────────────────────────────── */
  function pageGuest() {
    return '<form class="gb-write" data-form="guestbook">' +
        '<div class="gb-write__ava">' + minimi('guest', 48) + '</div>' +
        '<div class="gb-write__main"><input name="name" maxlength="20" placeholder="이름" aria-label="이름" required>' +
        '<textarea name="message" maxlength="500" rows="4" placeholder="두 사람에게 축하의 마음을 남겨주세요 ♥" aria-label="축하 메시지" required></textarea>' +
        '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="hint">이름과 메시지는 청첩장에 공개돼요. 연락처는 적지 마세요.</p>' +
        '<button type="submit" class="cy-btn">확인</button></div></form>' +
      (C.googleScriptUrl ? '' : '<p class="notice">방명록은 아직 연결 전이에요. (config.js 의 googleScriptUrl 설정 필요)</p>') +
      '<div class="gb" data-gb-list></div>' +
      '<p class="row center"><button type="button" class="cy-btn" data-action="gb-more" hidden>더보기 ▼</button></p>';
  }

  var PAGES = { home: pageHome, profile: pageProfile, diary: pageDiary, photo: pagePhoto, map: pageMap, gift: pageGift, guest: pageGuest };

  /* ── 화면 그리기 & 탭 이동 ─────────────────────────────────────────── */
  app.innerHTML = shell();
  var page = $('#page');
  var current = '';
  function route() {
    var name = (location.hash.match(/^#\/(\w+)/) || [])[1];
    if (!PAGES[name] || !TABS.some(function (t) { return t[0] === name; })) name = 'home';
    if (name === current) return;
    var first = !current;
    current = name;
    page.innerHTML = PAGES[name]();
    $$('.tab').forEach(function (t) {
      var on = t.getAttribute('data-tab') === name;
      t.classList.toggle('is-on', on);
      if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
    });
    if (!first) { page.focus({ preventScroll: true }); $('.hompy').scrollIntoView({ block: 'start' }); }
    if (name === 'home' || name === 'guest') loadGuestbook();
    tick();
  }
  window.addEventListener('hashchange', route);
  route();

  /* ── D-day 카운트다운 ─────────────────────────────────────────────── */
  function tick() {
    var el = $('[data-countdown]');
    if (!el) return;
    var ms = weddingAt - Date.now();
    if (ms <= 0) { el.textContent = '저희 결혼했어요! 축하해주셔서 감사합니다 ♥'; return; }
    var d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000) % 24, m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
    el.innerHTML = '결혼식까지<br>' + d + '일 ' + h + '시간 ' + m + '분 ' + s + '초';
  }
  setInterval(tick, 1000);

  /* ── 알림 / 창 ────────────────────────────────────────────────────── */
  var toastTimer;
  function toast(msg) {
    var t = $('.toast');
    t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-on'); }, 2400);
  }
  var lastFocus = null;
  function openModal(title, html) {
    closeModal();
    lastFocus = document.activeElement;
    var m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = '<div class="win" role="dialog" aria-modal="true" aria-label="' + esc(title) + '">' +
      '<div class="win__bar"><span>' + esc(title) + '</span><button type="button" class="win__x" data-action="close" aria-label="닫기">✕</button></div>' +
      '<div class="win__body">' + html + '</div></div>';
    document.body.appendChild(m);
    document.body.classList.add('no-scroll');
    var f = $('input:not(.hp), button:not(.win__x), a', m) || $('.win__x', m);
    f.focus();
    return m;
  }
  function closeModal() {
    var m = $('.modal');
    if (!m) return;
    m.remove();
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

  function copy(text) {
    function done() { toast('복사되었어요!'); }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
    else fallback();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast('복사하지 못했어요. 길게 눌러 복사해주세요.'); }
      ta.remove();
    }
  }

  /* ── 캘린더 추가 ──────────────────────────────────────────────────── */
  function openCalendar() {
    var end = new Date(weddingAt.getTime() + 2 * 3600 * 1000);
    function fmt(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var title = couple + ' 결혼식';
    var loc = [venueText, W.address].filter(Boolean).join(', ');
    var g = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) +
      '&dates=' + fmt(weddingAt) + '/' + fmt(end) + '&location=' + encodeURIComponent(loc) + '&details=' + encodeURIComponent(pageUrl);
    var ics = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//cy-wedding//KO',
      'BEGIN:VEVENT', 'UID:' + fmt(weddingAt) + '@cy-wedding', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(weddingAt), 'DTEND:' + fmt(end),
      'SUMMARY:' + title, 'LOCATION:' + loc.replace(/,/g, '\\,'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n'));
    openModal('내 캘린더에 추가', '<p class="row center"><a class="cy-btn" target="_blank" rel="noopener" href="' + esc(g) + '">구글 캘린더</a> ' +
      '<a class="cy-btn" href="' + esc(ics) + '" download="wedding.ics">아이폰·기타 (.ics)</a></p>' +
      '<p class="hint">카카오톡 안에서 열리지 않으면 오른쪽 위 메뉴 → 다른 브라우저로 열기를 눌러주세요.</p>');
  }

  /* ── 사진 크게 보기 ───────────────────────────────────────────────── */
  function openLightbox(i) {
    var p = photos[i];
    if (!p) return;
    var m = openModal(p.title || '사진첩', '<img class="lightbox" src="' + esc(safeUrl(p.src)) + '" alt="' + esc(p.title || '사진') + '">' +
      '<p class="row center"><button type="button" class="cy-btn" data-action="lb-prev">◀ 이전</button> <span>' + (i + 1) + ' / ' + photos.length + '</span> <button type="button" class="cy-btn" data-action="lb-next">다음 ▶</button></p>');
    m.setAttribute('data-index', i);
  }

  /* ── 구글 시트 통신 (방명록 · 일촌신청) ───────────────────────────── */
  function api(method, payload) {
    var url = C.googleScriptUrl;
    if (!url) return Promise.reject(new Error('NO_URL'));
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 15000);
    var opts = method === 'GET' ? {}
      // text/plain 으로 보내야 구글 스크립트가 추가 확인(CORS) 없이 받습니다.
      : { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) };
    opts.signal = controller.signal;
    var full = method === 'GET' ? url + (url.indexOf('?') < 0 ? '?' : '&') + 'type=guestbook&limit=10' + (payload.before ? '&before=' + payload.before : '') + '&t=' + Date.now() : url;
    return fetch(full, opts).then(function (r) { if (!r.ok) throw new Error('HTTP_' + r.status); return r.json(); }).then(function (res) {
      if (!res || res.ok === false) throw new Error((res && res.error) || 'FAILED');
      return res;
    }).finally(function () { clearTimeout(timeout); });
  }
  function submitError(e) {
    return e.message === 'NO_URL' ? '아직 준비 중인 기능이에요 (구글 시트 연결 필요)'
      : e.message === 'RATE_LIMIT' ? '너무 자주 보냈어요. 1분 뒤 다시 시도해주세요.' : '전송에 실패했어요. 잠시 후 다시 시도해주세요.';
  }
  function requestId() { return window.crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2); }

  var gbItems = [], gbCursor = null, gbLoaded = false, gbLoading = false;
  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? '' : d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }
  function renderGuestbook() {
    var list = $('[data-gb-list]'), short = $('[data-gb-short]');
    if (short) {
      short.innerHTML = !C.googleScriptUrl ? '<li class="muted">일촌평은 방명록 연결 후 보여요.</li>'
        : !gbItems.length ? '<li class="muted">첫 일촌평을 남겨주세요 ♥</li>'
        : gbItems.slice(0, 5).map(function (it) {
          return '<li>· ' + esc(it.message.length > 40 ? it.message.slice(0, 40) + '…' : it.message) + ' <span class="who">(' + esc(it.name) + ')</span></li>';
        }).join('');
    }
    if (list) {
      list.innerHTML = gbItems.length ? gbItems.map(function (it, i) {
        return '<article class="gb__item"><header class="gb__head"><span>No.' + (gbItems.length - i) + '</span> <b>' + esc(it.name) + '</b> <time>(' + fmtDate(it.createdAt) + ')</time></header>' +
          '<div class="gb__body"><div class="gb__ava">' + minimi(guestKind(it.name), 44) + '</div><p>' + nl2br(it.message) + '</p></div></article>';
      }).join('') : '<p class="empty">' + (C.googleScriptUrl && !gbLoaded ? '불러오는 중…' : '아직 방명록이 비어 있어요. 첫 번째로 남겨주세요!') + '</p>';
      var more = $('[data-action="gb-more"]');
      if (more) more.hidden = !gbCursor;
    }
  }
  function loadGuestbook(append) {
    if (!C.googleScriptUrl || gbLoading || (gbLoaded && !append)) { renderGuestbook(); return; }
    gbLoading = true;
    api('GET', { before: append ? gbCursor : null }).then(function (res) {
      gbItems = append ? gbItems.concat(res.items || []) : (res.items || []);
      gbCursor = res.nextCursor || null;
      gbLoaded = true;
    }).catch(function () {
      if (append) toast('더 불러오지 못했어요.');
      gbLoaded = true;
    }).finally(function () { gbLoading = false; renderGuestbook(); });
  }
  function postGuestbook(form, maxLen) {
    var name = form.elements.name.value.trim(), message = form.elements.message.value.trim();
    if (form.elements.website.value) return;
    if (!name) { toast('이름을 입력해주세요'); return; }
    if (!message) { toast('메시지를 입력해주세요'); return; }
    if (message.length > maxLen) { toast(maxLen + '자 이내로 적어주세요'); return; }
    var btn = $('button[type=submit]', form);
    btn.disabled = true;
    api('POST', { type: 'guestbook', name: name, message: message, requestId: form.dataset.rid || (form.dataset.rid = requestId()), website: '' }).then(function () {
      gbItems.unshift({ name: name, message: message, createdAt: new Date().toISOString() });
      form.reset(); delete form.dataset.rid;
      renderGuestbook();
      toast('방명록이 등록되었어요 ♥');
    }).catch(function (e) { toast(submitError(e)); }).finally(function () { btn.disabled = false; });
  }

  /* ── 일촌 신청 (참석 의사) ────────────────────────────────────────── */
  function openRsvp() {
    var m = openModal('일촌 신청', '<form class="form" data-form="rsvp">' +
      '<div class="rsvp-hero">' + minimi('groom', 40) + '<span>♥</span>' + minimi('bride', 40) + '</div>' +
      '<p class="center"><b>' + esc(couple) + '</b>님께 일촌을 신청합니다.<br><small>(= 결혼식 참석 의사 전달)</small></p>' +
      '<fieldset><legend>어느 쪽 일촌이세요?</legend><label><input type="radio" name="side" value="신랑측"> 신랑측</label> <label><input type="radio" name="side" value="신부측"> 신부측</label></fieldset>' +
      '<fieldset><legend>참석 여부</legend><label><input type="radio" name="attend" value="참석" checked> 참석할게요</label> <label><input type="radio" name="attend" value="불참"> 마음만 전할게요</label></fieldset>' +
      '<label class="field">성함 <input name="name" maxlength="20" autocomplete="name"></label>' +
      '<label class="field" data-attend-only>본인 포함 인원 <input name="count" type="number" inputmode="numeric" min="1" max="20" value="1"></label>' +
      '<fieldset data-attend-only><legend>식사</legend><label><input type="radio" name="meal" value="예정" checked> 예정</label> <label><input type="radio" name="meal" value="안함"> 안 함</label> <label><input type="radio" name="meal" value="미정"> 미정</label></fieldset>' +
      '<label class="field">일촌 신청 메시지 <small>(선택)</small><input name="memo" maxlength="200" placeholder="예) 아이 1명과 함께 가요"></label>' +
      '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<p class="hint">응답은 두 사람의 구글 시트에만 저장되고 청첩장에 공개되지 않아요.</p>' +
      '<p class="row center"><button type="submit" class="cy-btn cy-btn--big">신청하기</button></p></form>');
    var form = $('form', m), rid = requestId();
    form.addEventListener('change', function () {
      var no = form.elements.attend.value === '불참';
      $$('[data-attend-only]', form).forEach(function (el) { el.hidden = no; });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website.value) return;
      if (!f.side.value) { toast('신랑측 / 신부측을 선택해주세요'); return; }
      if (!f.name.value.trim()) { toast('성함을 입력해주세요'); return; }
      var attend = f.attend.value, count = attend === '참석' ? Number(f.count.value) : 0;
      if (attend === '참석' && (!Number.isInteger(count) || count < 1 || count > 20)) { toast('인원은 1~20명으로 적어주세요'); return; }
      var btn = $('button[type=submit]', form);
      btn.disabled = true;
      api('POST', { type: 'rsvp', side: f.side.value, attend: attend, name: f.name.value.trim(), count: count,
        meal: attend === '참석' ? f.meal.value : '', memo: f.memo.value.trim(), requestId: rid, website: '' }).then(function () {
        closeModal();
        toast(attend === '참석' ? '일촌 신청 완료! 그날 만나요 ♥' : '따뜻한 마음 감사합니다 ♥');
      }).catch(function (err) { btn.disabled = false; toast(submitError(err)); });
    });
  }

  /* ── 배경음악 ─────────────────────────────────────────────────────── */
  function toggleMusic(force) {
    var audio = $('.bgm audio'), btn = $('[data-action="music"]');
    if (!audio) return;
    var play = force !== undefined ? force : audio.paused;
    if (play) audio.play().then(function () { btn.textContent = '❚❚'; btn.setAttribute('aria-pressed', 'true'); store('music', '1'); }, function () {});
    else { audio.pause(); btn.textContent = '▶'; btn.setAttribute('aria-pressed', 'false'); store('music', '0'); }
  }
  // 휴대폰은 화면을 한 번 터치해야 음악을 틀 수 있어요.
  if (musicSrc && store('music') !== '0') {
    var firstTouch = function (e) {
      document.removeEventListener('click', firstTouch, true);
      if (e.target.closest && e.target.closest('[data-action="music"]')) return;
      toggleMusic(true);
    };
    document.addEventListener('click', firstTouch, true);
  }

  /* ── 공유 (파도타기) ──────────────────────────────────────────────── */
  function wave(v) {
    if (v === 'copy') copy(pageUrl);
    else if (v === 'share') navigator.share({ title: document.title, text: desc, url: pageUrl }).catch(function () {});
    else if (v === 'calendar') openCalendar();
  }

  /* ── 이벤트 ───────────────────────────────────────────────────────── */
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-action]');
    if (!t) { if (e.target.classList.contains('modal')) closeModal(); return; }
    var a = t.getAttribute('data-action'), mi;
    if (a === 'close') closeModal();
    else if (a === 'rsvp') openRsvp();
    else if (a === 'calendar') openCalendar();
    else if (a === 'copy') copy(t.getAttribute('data-copy'));
    else if (a === 'music') toggleMusic();
    else if (a === 'lightbox') openLightbox(+t.getAttribute('data-index'));
    else if (a === 'lb-prev' || a === 'lb-next') {
      mi = +$('.modal').getAttribute('data-index') + (a === 'lb-next' ? 1 : -1);
      openLightbox((mi + photos.length) % photos.length);
    }
    else if (a === 'scrap') copy(pageUrl + '#/photo');
    else if (a === 'gb-more') loadGuestbook(true);
  });
  document.addEventListener('change', function (e) {
    if (e.target.getAttribute('data-action') === 'wave') { wave(e.target.value); e.target.value = ''; }
  });
  document.addEventListener('submit', function (e) {
    var kind = e.target.getAttribute('data-form');
    if (kind === 'guestbook') { e.preventDefault(); postGuestbook(e.target, 500); }
    else if (kind === 'ilchon') { e.preventDefault(); postGuestbook(e.target, 40); }
  });
})();
