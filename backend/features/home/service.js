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

function toCanonicalKey(text) {
  return normalizeVietnamese(text).replace(/\s+/g, "");
}

function getFirstName(fullName) {
  const normalized = normalizeVietnamese(fullName);
  if (!normalized) {
    return "";
  }

  const parts = normalized.split(" ");
  return parts[parts.length - 1] || "";
}

function isFullNameQuery(query) {
  return String(query || "").trim().split(" ").filter(Boolean).length >= 2;
}

function firstNameMatchScore(query, firstName) {
  if (!query || !firstName) {
    return null;
  }

  if (firstName === query) {
    return 0;
  }

  if (query.length === 1) {
    return firstName.startsWith(query) ? 1 : null;
  }

  return null;
}

async function lookupAccountsByFirstName(rawKeyword) {
  const keyword = normalizeVietnamese(rawKeyword);
  const canonicalKeyword = toCanonicalKey(rawKeyword);
  if (!keyword) {
    return [];
  }

  const students = await model.listStudentsForLookup();
  const fullNameMode = isFullNameQuery(keyword);
  const exactMatches = [];

  for (const item of students) {
    const username = item.username || item.account;
    if (!username) {
      continue;
    }

    const normalizedFullName = normalizeVietnamese(item.full_name);
    const canonicalFullName = toCanonicalKey(item.full_name);
    if (canonicalFullName && canonicalFullName === canonicalKeyword) {
      exactMatches.push({
        fullName: item.full_name,
        username,
        mustChangePassword: !!item.must_change_password,
        matchType: "exact",
      });
    }
  }

  if (exactMatches.length > 0) {
    exactMatches.sort((a, b) =>
      String(a.fullName || "").localeCompare(String(b.fullName || ""), "vi")
    );
    return exactMatches.slice(0, 30);
  }

  if (fullNameMode) {
    return [];
  }

  const matched = [];

  for (const item of students) {
    const firstName = getFirstName(item.full_name);
    const score = firstNameMatchScore(keyword, firstName);
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
      mustChangePassword: !!item.must_change_password,
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
    mustChangePassword: item.mustChangePassword,
    matchType: "fuzzy",
  }));
}

module.exports = {
  buildHomeViewData,
  lookupAccountsByFirstName,
};
