import assert from "node:assert/strict";
import { after, afterEach, test } from "node:test";

const originalFetch = global.fetch;
const originalApiKey = process.env.TAVILY_API_KEY;

async function getSearchWeb() {
  process.env.TAVILY_API_KEY = "test-key";
  return import("../lib/ai/web-search");
}

afterEach(() => {
  global.fetch = originalFetch;
});

after(() => {
  if (originalApiKey === undefined) {
    delete process.env.TAVILY_API_KEY;
  } else {
    process.env.TAVILY_API_KEY = originalApiKey;
  }
});

function mockTavily(results: unknown[]) {
  global.fetch = async () =>
    new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
}

test("upcoming-event searches exclude past and undated results", async () => {
  const { searchWeb } = await getSearchWeb();
  mockTavily([
    {
      title: "Future conference",
      url: "https://university.edu/events/future",
      content: "The conference will be held October 21-23, 2099.",
    },
    {
      title: "Duplicate future conference page",
      url: "https://university.edu/events/future/?utm_source=test#details",
      content: "The conference will be held October 21-23, 2099.",
    },
    {
      title: "Past conference",
      url: "https://example.org/past",
      content: "The conference was held June 10, 2001.",
    },
    {
      title: "Undated conference",
      url: "https://example.org/undated",
      content: "Registration is open. Apply by October 30, 2099.",
    },
    {
      title: "Announcement date only",
      url: "https://example.org/announcement",
      content: "Conference announcement published October 22, 2099.",
    },
  ]);

  const result = await searchWeb({
    query: "upcoming student conference",
    intent: "upcoming_events",
  });

  assert.deepEqual(
    result.results.map((item) => item.title),
    ["Future conference"],
  );
  assert.equal(result.results[0].eventDateStatus, "upcoming");
  assert.equal(
    result.results[0].sourceClassification,
    "government_or_education_domain",
  );
});

test("funding status requires explicit open or future-cycle evidence", async () => {
  const { searchWeb, buildFundingSummary } = await getSearchWeb();
  mockTavily([
    {
      title: "Expired grant",
      url: "https://scholarship.gov/expired",
      raw_content: "This travel grant application closes on October 10, 2001.",
    },
    {
      title: "Open Bangladesh undergraduate scholarship",
      url: "https://scholarship.gov/open",
      raw_content:
        "Applications are now open. Application deadline is October 31, 2099. Bangladeshi undergraduate Computer Science scholarship applicants are eligible to apply for a USD 1,000 award. Covers tuition and accommodation.",
    },
    {
      title: "Future deadline only",
      url: "https://foundation.org/current",
      content: "Applications close on October 31, 2099. Open to students.",
    },
    {
      title: "Future application cycle",
      url: "https://scholarship.gov/next-cycle",
      raw_content:
        "The next application cycle opens on March 1, 2099. Undergraduate CS scholarship applications are expected for Bangladeshi students.",
    },
    {
      title: "Applications now open: annual scholarship",
      url: "https://foundation.org/title-only-open",
      content: "Annual award information is available for international students.",
    },
    {
      title: "Incomplete undergraduate scholarship",
      url: "https://foundation.org/incomplete",
      content: "International undergraduate scholarship information is available.",
    },
    {
      title: "Bangladesh CS undergraduate scholarship",
      url: "https://university.edu/restricted-country",
      raw_content:
        "Bangladeshi undergraduate Computer Science students are not eligible; this award is restricted to US citizens only.",
    },
    {
      title: "Restricted grant",
      url: "https://university.edu/restricted",
      raw_content: "Bangladeshi undergraduate students are not eligible.",
    },
    {
      title: "Graduate funding",
      url: "https://university.edu/graduate",
      raw_content: "Funding is for master's and PhD students only.",
    },
    {
      title: "Gender-restricted award",
      url: "https://university.edu/women-award",
      raw_content: "Women applicants only. Undergraduate scholarship.",
    },
    {
      title: "Institution-restricted award",
      url: "https://university.edu/university-award",
      raw_content: "This scholarship is only for students at Dhaka University.",
    },
    {
      title: "Conference travel grant",
      url: "https://example.org/conference-grant",
      content: "Conference student travel grant applications are available.",
    },
    {
      title: "Scraped official undergraduate scholarship",
      url: "https://www.studyinkorea.go.kr/scholarship",
      raw_content:
        `<nav><a href="/generic-apply">Apply</a>Home Scholarships Menu</nav><p>${"Unrelated navigation and promotional text. ".repeat(40)}</p><p>Applications are now open. Deadline: October 31, 2099.</p><p>Applications are now open. Deadline: October 31, 2099.</p><p>Bangladesh undergraduate Computer Science students are eligible. Covers tuition and accommodation. Eligible countries include Bangladesh.</p><p>404 error page not found.</p><p>Error loading scholarship details.</p><a href="https://apply.foundationforms.com/scholarship?utm_source=test&token=abc#apply">Application portal</a>`,
    },
  ]);

  const result = await searchWeb({
    query: "student travel grants",
    intent: "funding",
  });

  const byTitle = (title: string) => {
    const match = result.results.find((item) => item.title === title);
    assert.ok(match, `Expected search result: ${title}`);
    return match;
  };

  const openScholarship = byTitle("Open Bangladesh undergraduate scholarship");
  assert.equal(openScholarship.status, "open");
  assert.equal(openScholarship.deadlineStatus, "future");
  assert.equal(openScholarship.relevance, "priority");
  assert.equal(openScholarship.targetFit, "confirmed");
  assert.match(openScholarship.fundingAmount ?? "", /USD 1,000/);
  assert.match(openScholarship.academicLevel ?? "", /undergraduate/i);
  assert.match(openScholarship.fundingCoverage ?? "", /tuition and accommodation/i);
  assert.equal(byTitle("Future application cycle").status, "upcoming");
  assert.equal(byTitle("Future deadline only").status, "status_unconfirmed");
  assert.equal(byTitle("Future deadline only").deadline, null);
  assert.equal(byTitle("Future deadline only").deadlineStatus, "unknown");
  assert.equal(
    byTitle("Applications now open: annual scholarship").status,
    "status_unconfirmed",
  );
  const incompleteScholarship = byTitle(
    "Incomplete undergraduate scholarship",
  );
  assert.equal(incompleteScholarship.status, "status_unconfirmed");
  assert.equal(incompleteScholarship.deadline, null);
  assert.equal(incompleteScholarship.eligibility, null);
  assert.equal(incompleteScholarship.eligibleCountries, null);
  assert.equal(incompleteScholarship.fundingCoverage, null);
  assert.equal(incompleteScholarship.applicationUrl, null);

  const scrapedScholarship = byTitle(
    "Scraped official undergraduate scholarship",
  );
  assert.equal(scrapedScholarship.status, "open");
  assert.equal(
    scrapedScholarship.opportunityType,
    "undergraduate_scholarship",
  );
  assert.equal(scrapedScholarship.relevance, "priority");
  assert.match(scrapedScholarship.fundingCoverage ?? "", /tuition and accommodation/i);
  assert.match(scrapedScholarship.eligibility ?? "", /Bangladesh undergraduate Computer Science students are eligible/i);
  assert.match(scrapedScholarship.eligibleCountries ?? "", /Bangladesh/i);
  assert.equal(
    scrapedScholarship.applicationUrl,
    "https://apply.foundationforms.com/scholarship?token=abc",
  );
  assert.doesNotMatch(
    scrapedScholarship.content,
    /404 error|Error loading|Home Scholarships Menu|Unrelated navigation/,
  );
  assert.equal(
    scrapedScholarship.content.match(/Applications are now open/g)?.length,
    1,
  );
  assert.equal(byTitle("Graduate funding").opportunityType, "graduate_funding");
  assert.equal(byTitle("Graduate funding").status, "eligibility_restricted");
  assert.equal(
    byTitle("Bangladesh CS undergraduate scholarship").status,
    "eligibility_restricted",
  );
  assert.equal(
    byTitle("Bangladesh CS undergraduate scholarship").relevance,
    "other",
  );
  assert.equal(
    byTitle("Conference travel grant").opportunityType,
    "conference_travel_grant",
  );
  assert.equal(
    byTitle("Gender-restricted award").opportunityType,
    "gender_restricted",
  );
  assert.equal(
    byTitle("Gender-restricted award").status,
    "eligibility_restricted",
  );
  assert.equal(
    byTitle("Institution-restricted award").opportunityType,
    "institution_restricted",
  );
  assert.equal(
    byTitle("Institution-restricted award").status,
    "eligibility_restricted",
  );
  assert.equal(byTitle("Future deadline only").deadlineStatus, "unknown");
  assert.equal(byTitle("Restricted grant").status, "eligibility_restricted");
  assert.equal(byTitle("Expired grant").status, "closed");

  const summary = buildFundingSummary(
    result.results.map((item) => ({ ...item, category: "funding" })),
    "bn",
  );
  assert.ok(summary);
  assert.match(summary, /সম্ভাব্য বৃত্তির তথ্য নিচের কার্ডে/);
  assert.doesNotMatch(summary, /Scraped official undergraduate scholarship|October 31, 2099/);
});

test("official named programs and German study costs are kept evidence-bound", async () => {
  const { searchWeb, buildFundingSummary } = await getSearchWeb();
  mockTavily([
    {
      title: "Study in Korea | Run by Korean Government",
      url: "https://www.studyinkorea.go.kr/en/plan/scholarship.do",
      raw_content:
        "The official Study in Korea portal lists the Global Korea Scholarship (GKS) scholarship program.",
    },
    {
      title: "Türkiye Scholarships",
      url: "https://www.turkiyeburslari.gov.tr/",
      raw_content:
        "Türkiye Scholarships provides international students with a monthly stipend, tuition fee, health insurance, accommodation, Turkish language course, and one-time flight ticket.",
    },
    {
      title: "Stipendium Hungaricum",
      url: "https://stipendiumhungaricum.hu/",
      raw_content:
        "Scholarship holders have tuition fees covered and accommodation costs supported.",
    },
    {
      title: "Finances: studying in Germany",
      url: "https://www.daad.de/en/studying-in-germany/living-in-germany/finances/",
      raw_content:
        "This page describes education and living costs to expect. Currently (as of 1 January 2025), students from outside the EU or EEA must prove 992 euros per month for a study visa. There are generally no fees for Bachelor's courses and most Master's courses at state higher education institutions. Baden-Württemberg charges non-EU citizens EUR 1,500 per semester. All students pay a semester contribution of EUR 70 to 430.",
    },
  ]);

  const result = await searchWeb({
    query: "GKS Türkiye Scholarships Stipendium Hungaricum Germany tuition fees",
    intent: "funding",
  });
  const getByTitle = (title: string) => {
    const opportunity = result.results.find((item) => item.title === title);
    assert.ok(opportunity, `Expected result: ${title}`);
    return opportunity;
  };

  const gks = getByTitle("Study in Korea | Run by Korean Government");
  assert.equal(gks.sourceRole, "primary_source_candidate");
  assert.equal(gks.status, "status_unconfirmed");
  assert.equal(gks.deadline, null);
  assert.equal(gks.eligibleCountries, null);
  assert.equal(gks.academicLevel, null);

  const turkiye = getByTitle("Türkiye Scholarships");
  assert.equal(turkiye.sourceRole, "primary_source_candidate");
  assert.equal(turkiye.status, "status_unconfirmed");
  assert.equal(turkiye.deadline, null);
  assert.match(turkiye.fundingCoverage ?? "", /monthly stipend/);

  const stipendium = getByTitle("Stipendium Hungaricum");
  assert.equal(stipendium.sourceRole, "primary_source_candidate");
  assert.equal(stipendium.status, "status_unconfirmed");
  assert.equal(stipendium.deadline, null);
  assert.match(stipendium.fundingCoverage ?? "", /tuition fees covered/);

  const germany = getByTitle("Finances: studying in Germany");
  assert.equal(germany.opportunityType, "tuition_policy");
  assert.equal(germany.status, "not_applicable");
  assert.match(germany.tuitionCost ?? "", /no fees for Bachelor's courses/i);
  assert.match(germany.livingCost ?? "", /living costs to expect/i);
  assert.match(germany.visaFinancialRequirement ?? "", /study visa/i);
  assert.doesNotMatch(germany.title, /scholarship/i);

  const summary = buildFundingSummary(
    result.results.map((item) => ({ ...item, category: "funding" })),
    "bn",
  );
  assert.ok(summary);
  assert.match(summary, /সম্পর্কিত সুযোগ পেয়েছি/);
  assert.doesNotMatch(summary, /GKS|Stipendium Hungaricum|টিউশন নীতি/);
});

test("third-party deadlines and application claims remain discovery-only", async () => {
  const { searchWeb } = await getSearchWeb();
  mockTavily([
    {
      title: "Scholarship roundup",
      url: "https://example.org/scholarship-roundup",
      raw_content:
        '<nav>Home Scholarships</nav><p>GKS applications are now open. Deadline: October 31, 2099.</p><p>GKS applications are now open. Deadline: October 31, 2099.</p><p>| Award | Eligibility |</p><p>|---|---|</p><p>| Scholarship | Bangladesh undergraduate students |</p><p>Read more in our related articles and promotional content.</p>',
    },
  ]);

  const result = await searchWeb({
    query: "Bangladesh undergraduate CS scholarships",
    intent: "funding",
  });
  const [discovery] = result.results;
  assert.equal(discovery.sourceRole, "discovery_source");
  assert.equal(discovery.status, "status_unconfirmed");
  assert.equal(discovery.deadline, null);
  assert.equal(discovery.deadlineStatus, "unknown");
  assert.equal(discovery.eligibility, null);
  assert.equal(discovery.eligibleCountries, null);
  assert.equal(discovery.applicationUrl, null);
  assert.doesNotMatch(
    discovery.content,
    /Home Scholarships|related articles|promotional|---|utm_/i,
  );
});

test("only official page evidence verifies undergraduate scholarship matches", async () => {
  const { searchWeb, buildFundingSummary } = await getSearchWeb();
  mockTavily([
    {
      title: "Snippet-only undergraduate scholarship",
      url: "https://university.edu/funding/snippet",
      content:
        "Applications are now open. Deadline: October 31, 2099. Bangladeshi undergraduate Computer Science students are eligible.",
    },
    {
      title: "Undergraduate scholarship database",
      url: "https://university.edu/funding/database",
      raw_content:
        "Search our scholarship database for undergraduate funding in computer science. Listings may include programs from many providers.",
    },
    {
      title: "Graduate scholarship",
      url: "https://university.edu/funding/graduate",
      raw_content:
        "This scholarship is for master's and PhD students only. Applications are now open.",
    },
    {
      title: "International undergraduate tuition waiver",
      url: "https://university.edu/funding/waiver",
      raw_content:
        "International undergraduate students may apply for a tuition fee waiver. Computer Science applicants are eligible. Application deadline: October 31, 2099.",
    },
    {
      title: "International education loan",
      url: "https://university.edu/funding/loan",
      raw_content:
        "International students may apply for an education loan. Repayment is required.",
    },
    {
      title: "Bangladesh undergraduate CS scholarship",
      url: "https://scholarship.gov/verified",
      raw_content:
        "Applications are now open. Bangladeshi undergraduate Computer Science scholarship applicants are eligible to apply. Covers tuition and accommodation. Application deadline: October 31, 2099.",
    },
  ]);

  const result = await searchWeb({
    query: "Bangladesh undergraduate CS scholarships",
    intent: "funding",
  });
  const getByTitle = (title: string) => {
    const opportunity = result.results.find((item) => item.title === title);
    assert.ok(opportunity, `Expected result: ${title}`);
    return opportunity;
  };
  const verified = getByTitle("Bangladesh undergraduate CS scholarship");
  assert.equal(verified.targetFit, "confirmed");
  assert.equal(verified.opportunityType, "undergraduate_scholarship");
  assert.equal(verified.status, "open");
  assert.equal(result.results[0].title, verified.title);

  const snippetOnly = getByTitle("Snippet-only undergraduate scholarship");
  assert.equal(snippetOnly.sourceRole, "discovery_source");
  assert.equal(snippetOnly.targetFit, "unconfirmed");
  assert.equal(snippetOnly.status, "status_unconfirmed");
  assert.equal(snippetOnly.deadline, null);
  assert.equal(snippetOnly.eligibility, null);
  assert.equal(snippetOnly.applicationUrl, null);

  const directory = getByTitle("Undergraduate scholarship database");
  assert.equal(directory.opportunityType, "other_funding");
  assert.notEqual(directory.targetFit, "confirmed");

  const graduate = getByTitle("Graduate scholarship");
  assert.equal(graduate.opportunityType, "graduate_funding");
  assert.notEqual(graduate.targetFit, "confirmed");

  const waiver = getByTitle("International undergraduate tuition waiver");
  assert.equal(waiver.opportunityType, "university_tuition_waiver");
  assert.notEqual(waiver.targetFit, "confirmed");

  const loan = getByTitle("International education loan");
  assert.equal(loan.opportunityType, "student_loan");
  assert.equal(loan.status, "not_applicable");
  assert.notEqual(loan.targetFit, "confirmed");

  const summary = buildFundingSummary(
    result.results.map((item) => ({ ...item, category: "funding" })),
    "bn",
  );
  assert.ok(summary);
  assert.match(summary, /সম্ভাব্য বৃত্তির তথ্য নিচের কার্ডে/);
  assert.doesNotMatch(summary, /Bangladesh undergraduate CS|আবেদন খোলা/);
  assert.doesNotMatch(summary, /Common App|CSS Profile|IELTS|TOEFL/);
});

test("funding summaries distinguish no matches from unavailable search", async () => {
  const { buildFundingSummary } = await getSearchWeb();
  const noMatch = buildFundingSummary([], "bn", true, true);
  assert.match(noMatch ?? "", /নির্ভরযোগ্য বৃত্তির তথ্য পাইনি/);
  assert.match(noMatch ?? "", /খুঁজে দেখতে পারি/);

  const unavailable = buildFundingSummary([], "en", true, false);
  assert.match(unavailable ?? "", /couldn’t complete the live scholarship search/i);
  assert.doesNotMatch(unavailable ?? "", /couldn’t find a reliable scholarship match/i);
});

test("funding queries preserve the user's stated target", async () => {
  const { searchWeb } = await getSearchWeb();
  let submittedQuery = "";
  global.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body)) as { query: string };
    submittedQuery = body.query;
    return new Response(JSON.stringify({ results: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  const result = await searchWeb({
    query: "Taiwan master's engineering scholarship",
    intent: "funding",
  });

  assert.equal(result.success, true);
  assert.match(submittedQuery, /Taiwan master's engineering scholarship/i);
  assert.doesNotMatch(submittedQuery, /Bangladesh undergraduate CS AI student/i);
  assert.match(submittedQuery, /official scholarship provider/i);
});
