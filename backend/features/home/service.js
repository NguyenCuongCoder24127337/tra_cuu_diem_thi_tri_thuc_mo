const model = require("./model");

function buildHomeViewData(sessionUser) {
  return {
    user: sessionUser || null,
    meta: model.getHomeMetadata(),
  };
}

function normalizeVietnamese(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getFirstName(fullName) {
  const normalized = normalizeVietnamese(fullName);
  if (!normalized) {
    return "";
  }

  const parts = normalized.split(" ");
  return parts[parts.length - 1] || "";
}

function levenshteinDistance(a, b) {
  const source = String(a || "");
  const target = String(b || "");

  if (!source.length) {
    return target.length;
  }
  if (!target.length) {
    return source.length;
  }

  const previous = new Array(target.length + 1);
  const current = new Array(target.length + 1);

  for (let j = 0; j <= target.length; j += 1) {
    previous[j] = j;
  }

  for (let i = 1; i <= source.length; i += 1) {
    current[0] = i;
    for (let j = 1; j <= target.length; j += 1) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j <= target.length; j += 1) {
      previous[j] = current[j];
    }
  }

  return previous[target.length];
}

function matchScore(query, firstName) {
  if (!query || !firstName) {
    return null;
  }

  if (firstName === query) {
    return 0;
  }

  if (firstName.startsWith(query)) {
    return 1;
  }

  if (query.startsWith(firstName)) {
    return 2;
  }

  if (firstName.includes(query)) {
    return 3;
  }

  const distance = levenshteinDistance(firstName, query);
  const allowedDistance = query.length >= 5 ? 2 : 1;

  if (distance <= allowedDistance) {
    return 4 + distance;
  }

  return null;
}

async function lookupAccountsByFirstName(rawKeyword) {
  const keyword = normalizeVietnamese(rawKeyword);
  if (!keyword) {
    return [];
  }

  const students = await model.listStudentsForLookup();
  const matched = [];

  for (const item of students) {
    const firstName = getFirstName(item.full_name);
    const score = matchScore(keyword, firstName);
    if (score === null) {
      continue;
    }

    const username = item.username || item.account;
    if (!username) {
      continue;
    }

    matched.push({
      fullName: item.full_name,
      username,
      score,
    });
  }

  matched.sort((a, b) => {
    if (a.score !== b.score) {
      return a.score - b.score;
    }
    return String(a.fullName || "").localeCompare(String(b.fullName || ""), "vi");
  });

  return matched.slice(0, 30).map((item) => ({
    fullName: item.fullName,
    username: item.username,
  }));
}

module.exports = {
  buildHomeViewData,
  lookupAccountsByFirstName,
};
