/**
 * LeetCode Company-Wise Question Export to CSV
 *
 * HOW TO USE:
 * 1. Log in to LeetCode (Premium required for company tags)
 * 2. Navigate to the company page, e.g. https://leetcode.com/company/google/
 * 3. Open DevTools (F12) → Console tab
 * 4. Paste this entire script and press Enter
 * 5. A prompt will ask for the company slug (e.g., "google", "amazon", "meta")
 * 6. The CSV will auto-download once all pages are fetched
 */

(async function exportLeetCodeCompanyQuestions() {
    // ─── Config ──────────────────────────────────────────────
    const companySlug = prompt(
        'Enter the company slug (e.g., google, amazon, meta, microsoft):'
    );

    if (!companySlug) {
        console.log('❌ No company slug provided. Aborting.');
        return;
    }

    const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql';
    const PAGE_SIZE = 50; // fetch in small batches to avoid timeouts

    // ─── Helper: GraphQL Fetch ───────────────────────────────
    async function gqlFetch(query, variables = {}) {
        const csrfToken =
            document.cookie
                .split('; ')
                .find((c) => c.startsWith('csrftoken='))
                ?.split('=')[1] || '';

        const res = await fetch(LEETCODE_GRAPHQL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-csrftoken': csrfToken,
                Referer: `https://leetcode.com/company/${companySlug}/`,
            },
            credentials: 'include',
            body: JSON.stringify({ query, variables }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
    }

    // ─── Helper: delay to avoid rate limits ──────────────────
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    // ─── Step 1: Fetch questions using paginated query ───────
    console.log(`🔍 Fetching questions for company: ${companySlug}...`);

    const COMPANY_QUESTIONS_QUERY = `
    query getCompanyTag($slug: String!) {
      companyTag(slug: $slug) {
        name
        slug
        questions {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          isPaidOnly
          acRate
          frontendQuestionId: questionFrontendId
          status
        }
        frequencies
      }
    }
  `;

    // Try paginated approach first via favoriteCompanyQuestions,
    // fallback to the simpler companyTag query in smaller scope
    const PAGINATED_QUERY = `
    query companyQuestions($slug: String!, $skip: Int!, $limit: Int!) {
      companyTag(slug: $slug) {
        name
        questionCount
      }
      problemsetQuestionList: companyQuestions(
        slug: $slug
        skip: $skip
        limit: $limit
      ) {
        questions {
          questionId
          title
          titleSlug
          difficulty
          topicTags {
            name
          }
          isPaidOnly
          acRate
          frontendQuestionId: questionFrontendId
          status
        }
        totalNum
      }
    }
  `;

    let allQuestions = [];
    let companyName = companySlug;
    let frequencies = {};

    // ─── Strategy 1: Try the simple companyTag query first ───
    try {
        console.log('� Attempting direct fetch...');
        const result = await gqlFetch(COMPANY_QUESTIONS_QUERY, { slug: companySlug });

        if (result.errors) {
            throw new Error(result.errors.map((e) => e.message).join('; '));
        }

        if (!result.data?.companyTag) {
            console.error(`❌ Company "${companySlug}" not found.`);
            console.log('💡 Check the slug — it should match the URL: leetcode.com/company/{slug}/');
            return;
        }

        companyName = result.data.companyTag.name;
        allQuestions = result.data.companyTag.questions || [];

        try {
            frequencies = JSON.parse(result.data.companyTag.frequencies || '{}');
        } catch {
            console.warn('⚠️ Could not parse frequency data.');
        }

        console.log(`✅ Direct fetch succeeded: ${allQuestions.length} questions`);
    } catch (err) {
        console.warn(`⚠️ Direct fetch failed (${err.message}). Trying paginated approach...`);

        // ─── Strategy 2: Paginated fetch ─────────────────────
        try {
            let skip = 0;
            let totalNum = null;

            while (totalNum === null || skip < totalNum) {
                console.log(`📄 Fetching page ${Math.floor(skip / PAGE_SIZE) + 1}...`);

                const result = await gqlFetch(PAGINATED_QUERY, {
                    slug: companySlug,
                    skip,
                    limit: PAGE_SIZE,
                });

                if (result.errors) {
                    throw new Error(result.errors.map((e) => e.message).join('; '));
                }

                const listData = result.data?.problemsetQuestionList;
                if (!listData) {
                    throw new Error('Paginated query returned no data');
                }

                if (result.data?.companyTag?.name) {
                    companyName = result.data.companyTag.name;
                }

                totalNum = listData.totalNum;
                const pageQuestions = listData.questions || [];
                allQuestions.push(...pageQuestions);

                console.log(`   Got ${pageQuestions.length} questions (${allQuestions.length}/${totalNum})`);

                if (pageQuestions.length === 0) break;
                skip += PAGE_SIZE;

                if (skip < totalNum) await delay(500); // rate-limit friendly
            }

            console.log(`✅ Paginated fetch succeeded: ${allQuestions.length} questions`);
        } catch (err2) {
            console.error('❌ Both fetch strategies failed:', err2.message);
            console.log('💡 Make sure you are:');
            console.log('   1. Logged in to leetcode.com');
            console.log('   2. Have a Premium subscription');
            console.log('   3. On the leetcode.com domain');
            return;
        }
    }

    if (allQuestions.length === 0) {
        console.log(`⚠️ No questions found for "${companyName}".`);
        return;
    }

    // ─── Step 2: Build CSV rows ─────────────────────────────
    console.log(`📊 Processing ${allQuestions.length} questions for "${companyName}"...`);

    const CSV_HEADERS = [
        'ID',
        'Title',
        'Difficulty',
        'Acceptance Rate (%)',
        'Topics',
        'Is Premium',
        'Status',
        'Frequency (All Time)',
        'Frequency (6 Months)',
        'Frequency (1 Year)',
        'Frequency (2 Years)',
        'LeetCode URL',
    ];

    const escapeCSV = (value) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = allQuestions
        .sort((a, b) => {
            // Sort by frequency (6 months) descending, then by ID
            const freqA = frequencies[a.questionId]?.[1] ?? 0;
            const freqB = frequencies[b.questionId]?.[1] ?? 0;
            if (freqB !== freqA) return freqB - freqA;
            return Number(a.frontendQuestionId) - Number(b.frontendQuestionId);
        })
        .map((q) => {
            const freq = frequencies[q.questionId] || [];
            return [
                q.frontendQuestionId,
                q.title,
                q.difficulty,
                q.acRate != null ? Number(q.acRate).toFixed(1) : '',
                (q.topicTags || []).map((t) => t.name).join(' | '),
                q.isPaidOnly ? 'Yes' : 'No',
                q.status === 'ac' ? 'Solved' : q.status === 'notac' ? 'Attempted' : 'Not Started',
                freq[0] != null ? Number(freq[0]).toFixed(2) : '',
                freq[1] != null ? Number(freq[1]).toFixed(2) : '',
                freq[2] != null ? Number(freq[2]).toFixed(2) : '',
                freq[3] != null ? Number(freq[3]).toFixed(2) : '',
                `https://leetcode.com/problems/${q.titleSlug}/`,
            ].map(escapeCSV);
        });

    // ─── Step 3: Generate & download CSV ────────────────────
    const csvContent = [CSV_HEADERS.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leetcode_${companySlug}_questions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`✅ Exported ${allQuestions.length} questions for "${companyName}" to CSV!`);
    console.log(`📁 File: leetcode_${companySlug}_questions.csv`);
})();
