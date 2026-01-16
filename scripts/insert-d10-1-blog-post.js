/**
 * D-10-1 Visa Blog Post Insertion Script
 *
 * Run with: node scripts/insert-d10-1-blog-post.js
 *
 * Requires: npm install @supabase/supabase-js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// D-10-1 Blog Post Content (English Version)
const blogPost = {
    title: 'D-10-1 Job Seeker Visa: No Points System Required for New Graduates',
    slug: 'd10-1-visa-korea-no-points-exemption-guide',
    category: 'education',
    meta_description: 'Just graduated from a Korean university? You might be exempt from the D-10 Points System and financial proof requirements. Apply for your Job Seeker Visa online instantly with Lawyeon.',
    thumbnail_url: null, // Add thumbnail URL if available
    related_services: JSON.stringify([
        { id: 'd10-1-change', name: 'D-10-1 일반구직 비자 변경' }
    ]),
    content: JSON.stringify([
        {
            type: 'paragraph',
            content: '<strong>"I just graduated. Do I really need 60 points for a D-10 visa?"</strong>'
        },
        {
            type: 'paragraph',
            content: 'This is the most common worry for international students in Korea as graduation approaches. The standard D-10-1 Job Seeker Visa usually operates on a strictly calculated Points System, requiring age, education, and Korean language scores to total at least 60 points.'
        },
        {
            type: 'info-box',
            style: 'success',
            content: '<strong>Great News!</strong> If you have just graduated from a Korean university, you are <strong>EXEMPT</strong> from the points system.'
        },
        {
            type: 'paragraph',
            content: 'At Lawyeon Visa Center, we specialize in helping fresh graduates transition smoothly to a Job Seeker status without the stress of complex calculations.'
        },
        {
            type: 'heading',
            content: 'The "New Graduate" Privilege'
        },
        {
            type: 'paragraph',
            content: 'According to the latest Immigration Office manual, you qualify for the <strong>Points System Exemption</strong> if you meet this specific condition:'
        },
        {
            type: 'table',
            headers: ['Criteria', 'Details'],
            rows: [
                ['Target', 'International students who have graduated from a Korean regular university (Junior College/Associate degree or higher)'],
                ['Condition', 'Applying for the D-10 visa for the <strong>first time immediately after graduation</strong>']
            ]
        },
        {
            type: 'paragraph',
            content: 'If you fit this description, you do not need to calculate points. You just need to prove you graduated.'
        },
        {
            type: 'heading',
            content: 'Why This is a Game Changer'
        },
        {
            type: 'paragraph',
            content: 'The biggest benefit isn\'t just skipping the math. <strong>It\'s about the money.</strong>'
        },
        {
            type: 'paragraph',
            content: 'Standard D-10 applicants must provide a bank statement showing proof of living expenses (approx. 4~5 million KRW). However, as a new graduate under this exemption rule:'
        },
        {
            type: 'info-box',
            style: 'info',
            content: '<strong>Proof of Living Expenses (Financial Ability) is EXEMPT.</strong><br>You do not need to freeze money in your bank account to apply.'
        },
        {
            type: 'heading',
            content: 'Required Documents (Simplified for Graduates)'
        },
        {
            type: 'paragraph',
            content: 'Since you are skipping the points evaluation, the document list is much simpler. We handle the preparation for you, but here is what\'s needed:'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                '<strong>Common Documents:</strong> Application form, Passport, Photo, ARC, Fee',
                '<strong>Job Seeking Plan:</strong> A detailed plan of how you will look for a job (We can help guide you on this)',
                '<strong>Diploma/Degree Certificate:</strong> Proof that you earned an Associate degree or higher from a Korean university',
                '<strong>Proof of Residence:</strong> Housing contract (Lease agreement) or confirmation of accommodation'
            ]
        },
        {
            type: 'info-box',
            style: 'success',
            content: '<strong>Note:</strong> No bank balance certificate is required for this specific category!'
        },
        {
            type: 'heading',
            content: 'Other Exemption Cases'
        },
        {
            type: 'paragraph',
            content: 'While the "New Graduate" case is the most common, the points system is also exempted if you fall into these categories:'
        },
        {
            type: 'list',
            ordered: false,
            items: [
                '<strong>High Korean Proficiency:</strong> Obtained TOPIK Level 4+ or completed KIIP Level 4+ (within the last 3 years)',
                '<strong>Promising Talent:</strong> Graduated from a Times/QS Top 200 World Ranked University (within the last 3 years)',
                '<strong>Experienced Professionals:</strong> Previous experience working in E-1~E-7 professional fields'
            ]
        },
        {
            type: 'heading',
            content: 'Skip the Immigration Office Visit'
        },
        {
            type: 'paragraph',
            content: 'Graduation season means the immigration office is fully booked. Why wait for weeks just to reserve a visit?'
        },
        {
            type: 'paragraph',
            content: '<strong>Lawyeon Visa & Immigration Center</strong> provides a direct online application service:'
        },
        {
            type: 'numbered-section',
            number: '1',
            title: 'Upload Documents',
            content: 'Upload your documents to our secure platform.'
        },
        {
            type: 'numbered-section',
            number: '2',
            title: 'Pay Online',
            content: 'Pay the service fee online.'
        },
        {
            type: 'numbered-section',
            number: '3',
            title: 'We Handle Everything',
            content: 'We file the application on your behalf immediately.'
        },
        {
            type: 'info-box',
            style: 'info',
            content: '<strong>You focus on finding your dream job. We handle the visa paperwork.</strong>'
        },
        {
            type: 'heading',
            content: 'Frequently Asked Questions'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: Can I work part-time on a D-10 visa?</strong><br>A: Generally, no. However, if you obtain a separate "Permission for Activities Outside of Status," limited internship activities may be allowed. You must report this.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: How long is the D-10 visa valid?</strong><br>A: It is usually granted for 6 months and can be extended up to a maximum of 2 years while you look for a job.'
        },
        {
            type: 'paragraph',
            content: '<strong>Q: What if I didn\'t graduate from a Korean university?</strong><br>A: If you graduated from a university abroad, you will likely need to follow the Points System or qualify under the "World Top University" exemption.'
        }
    ])
};

async function insertBlogPost() {
    console.log('Inserting D-10-1 blog post...');

    const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogPost])
        .select();

    if (error) {
        console.error('Error inserting blog post:', error);
        return;
    }

    console.log('Blog post inserted successfully!');
    console.log('Post ID:', data[0].id);
    console.log('View at: blog-post.html?slug=' + blogPost.slug);
}

insertBlogPost();
