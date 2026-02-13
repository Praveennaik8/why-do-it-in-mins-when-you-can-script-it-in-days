# 🧩 LeetCode Scripts

Scripts for extracting and organizing LeetCode data.

---

## Company-Wise Question Export

**File:** [`company_wise_question_export.js`](./company_wise_question_export.js)

Export LeetCode questions tagged to a specific company as a CSV file — sorted by frequency so the most commonly asked questions appear first.

### CSV Columns

| Column | Description |
|---|---|
| ID | LeetCode question number |
| Title | Question title |
| Difficulty | Easy / Medium / Hard |
| Acceptance Rate (%) | Community acceptance rate |
| Topics | Pipe-separated topic tags |
| Is Premium | Whether the question is premium-only |
| Status | Solved / Attempted / Not Started |
| Frequency | Occurrence frequency across time periods (All Time, 6 Months, 1 Year, 2 Years) |
| LeetCode URL | Direct link to the problem |

### Usage

1. **Log in** to [LeetCode](https://leetcode.com) (Premium required for company tags).
2. Navigate to any company page, e.g. `leetcode.com/company/google/`.
3. Open **DevTools → Console** (`F12`).
4. Paste the contents of `company_wise_question_export.js` and press **Enter**.
5. Enter the company slug when prompted (e.g., `google`, `amazon`, `meta`, `microsoft`).
6. The CSV auto-downloads.

### Notes

- The script tries a direct fetch first; if the response times out (504), it falls back to paginated fetching (50 questions per page).
- LeetCode may change their GraphQL schema — if the script breaks, the query fields may need updating.
