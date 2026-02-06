/**
 * F-2-R Visa Blog Post Insertion Script
 *
 * Run with: node scripts/insert-f2r-blog-post.js
 *
 * Requires: npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// F-2-R Blog Post Content (English Version - 2026 Complete Guide)
const blogPost = {
    title: 'F-2-R Visa Korea 2026: Complete Residence Visa Guide for Regional University Graduates',
    slug: 'f2r-visa-korea-regional-university-graduate-residence-guide-2026',
    category: 'residence',
    excerpt: 'Graduated from a regional university in Korea? The F-2-R visa lets you live and work freely in depopulating areas — with family sponsorship, no employer lock-in after year one, and a direct path to permanent residency.',
    meta_description: 'Complete 2026 F-2-R residence visa guide for international graduates of Korean regional universities. Covers eligibility, local government recommendation, family sponsorship, participating regions, and comparison with E-7 and D-10 visas.',
    thumbnail_url: null,
    related_services: JSON.stringify([
        { id: 'f2-r-change', name: 'F-2-R Regional Residence Visa Application' }
    ]),
    is_published: true,
    content: JSON.stringify([

        // ── Introduction ──────────────────────────────────────────────
        {
            type: 'paragraph',
            content: '<strong>Graduation is approaching. Your D-2 visa is about to expire. Most international students aim for an E-7 (work visa).</strong>'
        },
        {
            type: 'paragraph',
            content: '<strong>But if you graduated from a regional university, there may be a far better option than E-7.</strong>'
        },
        {
            type: 'paragraph',
            content: 'The F-2-R visa (Regional Talent Residence Visa) is a <strong>residence visa</strong> granted to foreign nationals willing to settle in depopulating areas of South Korea. You can sponsor your family, work in any industry within the region after the first year, and open a clear path to permanent residency (F-5).'
        },
        {
            type: 'paragraph',
            content: 'A total of <strong>85 local governments</strong> are participating, with a combined quota of <strong>5,072 slots</strong>. Most graduates do not even know this visa exists.'
        },

        // ── What Is the F-2-R Visa? ───────────────────────────────────
        {
            type: 'heading',
            content: 'What Is the F-2-R Visa?'
        },
        {
            type: 'paragraph',
            content: 'The F-2-R is a visa created by the Korean government to combat rural depopulation. When a local government in a designated depopulating area recommends a foreign national who agrees to settle there, the Ministry of Justice grants <strong>F-2 (residence) status</strong>.'
        },
        {
            type: 'paragraph',
            content: 'The differences from an E-7 visa are significant:'
        },
        {
            type: 'table',
            headers: ['Category', 'F-2-R (Regional Residence)', 'E-7 (Specific Activity)'],
            rows: [
                ['Visa type', '<strong>Residence visa</strong>', 'Work visa'],
                ['Family sponsorship', '✅ Spouse + minor children', 'Limited'],
                ['Industry restrictions', 'Any industry except restricted fields', 'Only the job listed in employer statement'],
                ['Job change', 'Free within region after 1 year', 'New employer must re-file & get re-assessed'],
                ['Path to PR (F-5)', 'Favorable (F-2 stay counts toward eligibility)', 'Possible'],
                ['Employment required to apply?', '❌ Education alone qualifies', '✅ Mandatory'],
                ['Regional restriction', '85 depopulating-area municipalities', 'None']
            ]
        },
        {
            type: 'info-box',
            style: 'info',
            content: '<strong>Key Point:</strong> The F-2-R ties you to a <strong>region</strong>, not an employer. With an E-7, every time you change jobs, the new employer must submit an employment justification statement and your eligibility is re-assessed. With the F-2-R, once your first year is complete, you can work at any employer in any industry within your designated region.'
        },

        // ── Can D-2 Students Apply Directly? ─────────────────────────
        {
            type: 'heading',
            content: 'Can D-2 Students Apply Directly?'
        },
        {
            type: 'paragraph',
            content: '<strong>Yes.</strong> You can switch from D-2 directly to F-2-R without going through D-10 first.'
        },
        {
            type: 'paragraph',
            content: 'The following visa statuses are <strong>excluded</strong> from F-2-R eligibility:'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Ineligible statuses:</strong> D-3 (Industrial Training), D-4 (General Training), E-6-2 (Hotel Entertainment), E-8 (Seasonal Work), E-9 (Non-professional Employment), E-10 (Crew), G-1 (Miscellaneous), H-1 (Working Holiday)'
        },
        {
            type: 'paragraph',
            content: '<strong>D-2 (Student) is NOT on this exclusion list.</strong>'
        },
        {
            type: 'paragraph',
            content: '<strong>Prospective graduates</strong> can also apply. If you can prove that you are expected to graduate within 6 months from the application date (with a certificate of expected graduation signed by the university president or department head), you are eligible. You must submit your actual degree certificate when you first apply for a stay extension.'
        },

        // ── Eligibility Requirements ─────────────────────────────────
        {
            type: 'heading',
            content: 'Eligibility Requirements'
        },
        {
            type: 'paragraph',
            content: 'You must satisfy <strong>both</strong> the Ministry of Justice\'s baseline requirements <strong>and</strong> the individual criteria set by each local government.'
        },

        // 1. Education or Income
        {
            type: 'heading',
            content: '1. Education or Income (Meet One)'
        },
        {
            type: 'paragraph',
            content: '<strong>Education (most graduates meet this):</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'Graduated (or expected to graduate) from a Korean junior college (2-year) or higher'
            ]
        },
        {
            type: 'paragraph',
            content: '<strong>Income:</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                '70% or more of the previous year\'s per-capita GNI',
                'Only your own income counts'
            ]
        },
        {
            type: 'table',
            headers: ['Benchmark', 'Amount (Applicable Apr 2025 – Mar 2026)'],
            rows: [
                ['Per-capita GNI', '₩49,955,000 / year'],
                ['70% threshold (F-2-R minimum)', '<strong>₩34,969,000 / year</strong>'],
                ['Monthly equivalent', '<strong>≈ ₩2,914,000 / month</strong>']
            ]
        },
        {
            type: 'info-box',
            style: 'success',
            content: '<strong>Most D-2 graduates qualify through education alone.</strong> You do not need income documentation — your degree is sufficient.'
        },

        // 2. Local Government Recommendation
        {
            type: 'heading',
            content: '2. Local Government Recommendation Letter'
        },
        {
            type: 'paragraph',
            content: 'This is the most critical requirement.'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'Apply to a participating local government in a designated depopulating area',
                'Obtain an official recommendation letter signed by the head of that local government',
                'The letter is valid for <strong>3 months</strong> from the date of issue'
            ]
        },
        {
            type: 'paragraph',
            content: 'Each municipality has its own selection criteria, and many <strong>prioritize graduates of universities located within their area</strong>.'
        },
        {
            type: 'table',
            headers: ['Province', 'Municipality', 'Selection Priority'],
            rows: [
                ['Chungbuk', 'Jecheon-si', '1st: Graduates of universities in Jecheon → 2nd: Within Chungbuk → 3rd: Others'],
                ['Chungbuk', 'Okcheon-gun', '1st: Graduates of universities in Chungbuk → 2nd: Others'],
                ['Chungbuk', 'Goesan-gun', '1st: Graduates of universities in Chungbuk → 2nd: Others']
            ]
        },
        {
            type: 'info-box',
            style: 'warning',
            content: '<strong>If your university is in a depopulating area, you have the strongest position for F-2-R.</strong> Check whether that area is participating in the F-2-R program.'
        },

        // 3. Residence
        {
            type: 'heading',
            content: '3. Residence Requirements'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'You must actually reside in the area that recommended you',
                '<strong>First 2 years:</strong> You must live in the recommending municipality',
                '<strong>After 2 years:</strong> You may move to another depopulating area within the same province',
                '<strong>Total residence restriction period: 5 years</strong>'
            ]
        },
        {
            type: 'paragraph',
            content: '<strong>Grace period:</strong> You do not need to have moved before applying. You have <strong>30 days after visa approval</strong> to complete your address registration (전입신고).'
        },
        {
            type: 'info-box',
            style: 'warning',
            content: '<strong>Caution:</strong> If more than 15 days pass between the date of your lease contract and your address registration, you are in violation of Article 36 of the Immigration Act.'
        },
        {
            type: 'paragraph',
            content: 'Some regions allow your residence and workplace to be in different locations:'
        },
        {
            type: 'table',
            headers: ['Type', 'Description', 'Available Regions'],
            rows: [
                ['Type A', 'Live in recommending area + Work anywhere in same province', 'Jeonnam, Jeonbuk, Gyeongbuk, Busan, Daegu, Gyeongnam, Gapyeong'],
                ['Type B', 'Live with family in recommending area + Work in same province', 'Jeonnam, Jeonbuk, Gyeongbuk, Busan, Daegu, Gyeongnam'],
                ['Type C', 'Live in same province + Work in recommending area', 'Jeonnam, Jeonbuk, Gyeongbuk, Busan'],
                ['Type D', 'Live in same province + Start business in recommending area', 'Jeonnam, Jeonbuk, Gyeongbuk, Busan']
            ]
        },
        {
            type: 'info-box',
            style: 'info',
            content: '<strong>Example:</strong> If a county in Jeonnam recommends you under Type A, you live in that county but can work anywhere in Jeonnam province.'
        },

        // 4. Employment or Business
        {
            type: 'heading',
            content: '4. Employment or Business (Meet One)'
        },
        {
            type: 'paragraph',
            content: '<strong>Employment:</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'Directly employed by a company located in the recommending area',
                'Salary: 70% or more of GNI (<strong>≈ ₩2,914,000/month or more</strong>)',
                'Contract term of 1 year or more; work must begin within 3 months of application',
                '<strong>Direct employment only</strong> — dispatch, staffing agencies, and daily-wage contracts are NOT accepted',
                'For the first year, you cannot change workplaces (exceptions: business closure, human rights violations — requires re-recommendation by local government)',
                'Any industry except restricted fields'
            ]
        },
        {
            type: 'paragraph',
            content: '<strong>Business:</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'Investment of ₩200 million (KRW) or more',
                'Business premises must be within the recommending area'
            ]
        },
        {
            type: 'paragraph',
            content: 'During your permitted stay, you must maintain employment or business for at least <strong>3/4 of the period (9 months per year)</strong>. You may also switch between employment and business within the recommending area.'
        },

        // 5. Korean Language
        {
            type: 'heading',
            content: '5. Korean Language Proficiency'
        },
        {
            type: 'paragraph',
            content: 'You must meet <strong>one</strong> of the following:'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'TOPIK <strong>Level 4 or higher</strong>, or',
                'KIIP (Social Integration Program) Stage 4 or higher completion (or assigned to Stage 5+ via pre-assessment)'
            ]
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Starting from 2025, the requirement was raised from Level 3 to Level 4.</strong> If you prepared based on the old standard, your application will be rejected.'
        },

        // 6. Clean Record
        {
            type: 'heading',
            content: '6. Clean Record (No Disqualifying History)'
        },
        {
            type: 'paragraph',
            content: 'An important distinction: <strong>"fines" (벌금) and "penalties" (범칙금) are different</strong>.'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                '<strong>Fine (벌금):</strong> A criminal punishment imposed by a court after a criminal trial',
                '<strong>Penalty (범칙금):</strong> An administrative sanction imposed by immigration authorities for immigration law violations'
            ]
        },
        {
            type: 'table',
            headers: ['Disqualifying Factor', 'Standard'],
            rows: [
                ['Serious violent crimes, fraud, drugs, sexual violence', 'Any conviction history → ineligible'],
                ['Prison sentence or higher (including suspended)', 'Less than 5 years since completion of sentence'],
                ['Criminal fine of ₩3 million+', 'Within last 3 years'],
                ['Immigration penalties totaling ₩5 million+', 'Within last 3 years'],
                ['3 or more penalty dispositions', 'Within last 3 years']
            ]
        },
        {
            type: 'info-box',
            style: 'warning',
            content: '"I paid a ₩1 million fine — am I okay?" "Are fines and penalties added together?" — The answer depends on your individual history. If you have any past dispositions, get a professional assessment before applying.<br><br><a href="/service-apply-general.html?service=visa-diagnosis"><strong>Request a Visa Assessment →</strong></a>'
        },

        // 7. Employer Requirements
        {
            type: 'heading',
            content: '7. Employer Requirements'
        },
        {
            type: 'paragraph',
            content: 'Your employer must also be free of disqualifying factors. An application may be denied if the employer has a history of fraudulent invitations, illegal employment, or labor law violations.'
        },

        // ── Participating Regions ────────────────────────────────────
        {
            type: 'heading',
            content: 'Participating Regions'
        },
        {
            type: 'paragraph',
            content: 'There are 89 designated depopulating areas + 18 "depopulation concern" areas = 107 total. Of these, <strong>85 municipalities</strong> are actively participating in the F-2-R program.'
        },
        {
            type: 'table',
            headers: ['Province', 'Depopulating Areas', 'Depopulation Concern Areas'],
            rows: [
                ['<strong>Busan</strong>', 'Dong-gu, Seo-gu, Yeongdo-gu', 'Geumjeong-gu, Jung-gu'],
                ['<strong>Daegu</strong>', 'Nam-gu, Seo-gu', 'Gunwi-gun'],
                ['<strong>Incheon</strong>', 'Ganghwa-gun, Ongjin-gun', 'Dong-gu'],
                ['<strong>Gwangju</strong>', '—', 'Dong-gu'],
                ['<strong>Daejeon</strong>', '—', 'Daedeok-gu, Dong-gu, Jung-gu'],
                ['<strong>Gyeonggi</strong>', 'Gapyeong-gun, Yeoncheon-gun', 'Dongducheon-si, Pocheon-si'],
                ['<strong>Gangwon</strong>', 'Goseong-gun, Samcheok-si, Yanggu-gun, Yangyang-gun, Yeongwol-gun, Jeongseon-gun, Cheorwon-gun, Taebaek-si, Pyeongchang-gun, Hongcheon-gun, Hwacheon-gun, Hoengseong-gun', 'Gangneung-si, Donghae-si, Sokcho-si, Inje-gun'],
                ['<strong>Chungbuk</strong>', 'Goesan-gun, Danyang-gun, Boeun-gun, Yeongdong-gun, Okcheon-gun, Jecheon-si', '—'],
                ['<strong>Chungnam</strong>', 'Gongju-si, Geumsan-gun, Nonsan-si, Boryeong-si, Buyeo-gun, Seocheon-gun, Yesan-gun, Cheongyang-gun, Taean-gun', '—'],
                ['<strong>Jeonbuk</strong>', 'Gochang-gun, Gimje-si, Namwon-si, Muju-gun, Buan-gun, Sunchang-gun, Imsil-gun, Jangsu-gun, Jeongeup-si, Jinan-gun', 'Iksan-si'],
                ['<strong>Jeonnam</strong>', 'Gangjin-gun, Goheung-gun, Gokseong-gun, Gurye-gun, Damyang-gun, Boseong-gun, Sinan-gun, Yeonggwang-gun, Yeongam-gun, Wando-gun, Jangseong-gun, Jangheung-gun, Jindo-gun, Hampyeong-gun, Haenam-gun, Hwasun-gun', '—'],
                ['<strong>Gyeongbuk</strong>', 'Goryeong-gun, Mungyeong-si, Bonghwa-gun, Sangju-si, Seongju-gun, Andong-si, Yeongdeok-gun, Yeongyang-gun, Yeongju-si, Yeongcheon-si, Ulleung-gun, Uljin-gun, Uiseong-gun, Cheongdo-gun, Cheongsong-gun', 'Gyeongju-si, Gimcheon-si'],
                ['<strong>Gyeongnam</strong>', 'Geochang-gun, Goseong-gun, Namhae-gun, Miryang-si, Sancheong-gun, Uiryeong-gun, Changnyeong-gun, Hadong-gun, Haman-gun, Hamyang-gun, Hapcheon-gun', 'Sacheon-si, Tongyeong-si']
            ]
        },
        {
            type: 'info-box',
            style: 'info',
            content: 'Not all 107 areas participate. Only the <strong>85 municipalities</strong> that submitted program plans and received quota allocations are eligible. Confirm whether your university\'s location or your preferred settlement area is participating.'
        },

        // ── Family Sponsorship ───────────────────────────────────────
        {
            type: 'heading',
            content: 'Family Sponsorship'
        },
        {
            type: 'paragraph',
            content: 'This is one of the biggest advantages of the F-2-R.'
        },
        {
            type: 'paragraph',
            content: '<strong>Who you can sponsor:</strong> Spouse + unmarried minor children → They receive <strong>F-3-1R</strong> status.'
        },
        {
            type: 'paragraph',
            content: '<strong>Spouse requirements:</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'Must live at the same address as the F-2-R holder (independent residential unit)',
                'Must complete KIIP Stage 2 or higher within 2 years of status change (maximum 6-month extension if incomplete)',
                'Can work within the recommending area (requires Permission for Activities Outside of Status)'
            ]
        },
        {
            type: 'paragraph',
            content: '<strong>Minor children requirements:</strong>'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                'School-age children must be enrolled in school (elementary/middle/high)',
                '<strong>Violation may result in cancellation of the primary holder\'s (F-2-R) visa</strong>'
            ]
        },
        {
            type: 'paragraph',
            content: '<strong>Income requirements for families of 5 or more:</strong>'
        },
        {
            type: 'table',
            headers: ['Family Size', '5', '6', '7', '8'],
            rows: [
                ['Monthly income requirement', '₩3,411,932', '₩3,871,106', '₩4,314,445', '₩4,757,784']
            ]
        },
        {
            type: 'paragraph',
            content: 'For families of 4 or fewer, meeting the standard individual income requirement (≈ ₩2,914,000/month) is sufficient for sponsorship.'
        },

        // ── Post-Graduation Visa Comparison ──────────────────────────
        {
            type: 'heading',
            content: 'Post-Graduation Visa Comparison'
        },
        {
            type: 'table',
            headers: ['', 'D-10-1 Job Seeker', 'E-7 Specific Activity', 'F-2-R Regional Residence', 'D-9-5 Student Entrepreneur'],
            rows: [
                ['<strong>Best for</strong>', 'Job/startup preparation', 'Confirmed professional employment', 'Regional settlement', 'Starting a business'],
                ['<strong>Employment required?</strong>', '❌', '✅ Employer statement mandatory', 'Education alone qualifies', '❌ (Investment required)'],
                ['<strong>Regional restriction</strong>', 'None', 'None', 'Depopulating areas', 'None'],
                ['<strong>Family sponsorship</strong>', '❌', 'Limited', '✅ Spouse + children', 'Limited'],
                ['<strong>Job flexibility</strong>', 'Part-time + internships', 'Listed job only; re-assessed on change', 'Any industry in region after year 1', 'Own business only'],
                ['<strong>Korean requirement</strong>', 'None (initial)', 'Varies by occupation', 'TOPIK 4+', 'No separate requirement'],
                ['<strong>Duration</strong>', 'Up to 2 years', 'Duration of employment', '5 years (renewable)', 'While business continues']
            ]
        },
        {
            type: 'paragraph',
            content: 'While on D-10, you can do part-time work and <strong>E-1 through E-7 field internships</strong> (up to 1 year total, max 6 months per company). Switching to D-10 first to job-search while preparing for F-2-R or E-7 is also a viable strategy.'
        },
        {
            type: 'info-box',
            style: 'info',
            content: '<strong>Not sure which path is right for you?</strong><br><a href="/service-apply-general.html?service=visa-diagnosis"><strong>Visa Assessment Consultation (₩55,000) →</strong></a>'
        },

        // ── Common Mistakes ──────────────────────────────────────────
        {
            type: 'heading',
            content: 'Common Mistakes'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #1: Applying to any depopulating area</strong><br>Not all 107 areas participate. Only 85 municipalities with allocated quotas are eligible, and each has different selection criteria.'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #2: Applying with a dispatch or staffing agency contract</strong><br>Only direct employment is accepted. Dispatch, staffing agency, and daily-wage contracts will be rejected.'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #3: Not completing address registration within 30 days</strong><br>If you used the grace period provision, you MUST complete address registration within 30 days of approval. You must also register within 15 days of the lease contract date.'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #4: Changing jobs within the first year</strong><br>Only allowed in cases of business closure or human rights violations, and only with re-recommendation from the local government. Unauthorized job changes are grounds for visa cancellation.'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #5: Confusing criminal fines with immigration penalties</strong><br>Different disqualification standards apply to each. If you have any prior dispositions, get a professional assessment.'
        },
        {
            type: 'info-box',
            style: 'danger',
            content: '<strong>Mistake #6: Preparing with TOPIK Level 3</strong><br>The requirement was raised to <strong>Level 4 starting in 2025</strong>. The old standard no longer applies.'
        },

        // ── FAQ ──────────────────────────────────────────────────────
        {
            type: 'heading',
            content: 'Frequently Asked Questions'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: Can I apply for F-2-R while on D-10 status?</strong><br>A: Yes, as long as your previous status before D-10 was not on the exclusion list (D-3, D-4, E-6-2, etc.). If your path was D-2 → D-10, there is no problem.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: What if I don\'t have TOPIK Level 4?</strong><br>A: You cannot apply. TOPIK Level 4 or KIIP Stage 4 completion is mandatory. TOPIK is administered 6 times per year.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: Can I move to Seoul after 2 years?</strong><br>A: No. You may only move to another depopulating area within the same province. The residence restriction lasts a total of 5 years.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: Can F-2-R lead to permanent residency (F-5)?</strong><br>A: Time spent on F-2 status counts toward F-5 eligibility requirements. The specific path depends on your individual circumstances.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: I\'m graduating in August. When should I start preparing?</strong><br>A: Now. Confirming a participating municipality → preparing documents → obtaining the local government recommendation → filing with immigration takes at least 2–3 months.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: Can my spouse work?</strong><br>A: Yes, with a Permission for Activities Outside of Status. They can work in any non-restricted industry within the recommending area.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: What is the minimum salary requirement?</strong><br>A: 70% of GNI = <strong>approximately ₩34,970,000/year (≈ ₩2,914,000/month)</strong> (applicable Apr 2025 – Mar 2026).'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: I have a past immigration penalty. Is it disqualifying?</strong><br>A: Penalties totaling ₩5 million or more within the last 3 years, or 3 or more penalty dispositions within 3 years, are disqualifying. Criminal fines and immigration penalties are assessed separately.'
        },

        // ── Application Service ──────────────────────────────────────
        {
            type: 'heading',
            content: 'Application Service'
        },
        {
            type: 'paragraph',
            content: 'The F-2-R requires a two-step process — local government recommendation, then immigration filing — and each municipality has different procedures.'
        },
        {
            type: 'paragraph',
            content: '<strong>Lawyeon Visa & Immigration Center</strong> handles the entire process on your behalf:'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                '✅ Eligibility review and optimal region selection',
                '✅ Complete document preparation and review',
                '✅ Support through the local government recommendation process',
                '✅ Immigration application filing on your behalf'
            ]
        },
        {
            type: 'link-button',
            text: 'Apply for F-2-R Regional Residence Visa →',
            url: '/service-apply-general.html?service=f2-r-change'
        },
        {
            type: 'paragraph',
            content: '<strong>Not sure which visa is right for you?</strong>'
        },
        {
            type: 'link-button',
            text: 'Visa Assessment Consultation (₩55,000) →',
            url: '/service-apply-general.html?service=visa-diagnosis'
        }
    ])
};

async function insertBlogPost() {
    console.log('Inserting F-2-R blog post...');

    // Check if a post with similar slug already exists
    const { data: existingPosts, error: fetchError } = await supabase
        .from('blog_posts')
        .select('id, slug')
        .or('slug.ilike.%f2r%,slug.ilike.%f-2-r%');

    if (fetchError) {
        console.error('Error fetching existing posts:', fetchError);
        return;
    }

    console.log('Found existing F-2-R posts:', existingPosts);

    if (existingPosts && existingPosts.length > 0) {
        // Update the first matching post
        const postToUpdate = existingPosts[0];
        console.log(`Updating existing post with ID: ${postToUpdate.id}`);

        const { data, error } = await supabase
            .from('blog_posts')
            .update({
                ...blogPost,
                updated_at: new Date().toISOString()
            })
            .eq('id', postToUpdate.id)
            .select();

        if (error) {
            console.error('Error updating blog post:', error);
            return;
        }

        console.log('Blog post updated successfully!');
        console.log('Post ID:', data[0].id);
        console.log('View at: blog-post.html?slug=' + blogPost.slug);
    } else {
        // Insert new post
        console.log('No existing F-2-R post found. Creating new post...');

        const { data, error } = await supabase
            .from('blog_posts')
            .insert([{
                ...blogPost,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error inserting blog post:', error);
            return;
        }

        console.log('Blog post inserted successfully!');
        console.log('Post ID:', data[0].id);
        console.log('View at: blog-post.html?slug=' + blogPost.slug);
    }
}

insertBlogPost();
