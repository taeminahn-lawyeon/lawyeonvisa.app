/**
 * Blog SSG Build Script
 * Supabase에서 블로그 포스트를 가져와 정적 HTML 파일을 생성합니다.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase 설정
const SUPABASE_URL = 'https://gqistzsergddnpcvuzba.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxaXN0enNlcmdkZG5wY3Z1emJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNTEyMjEsImV4cCI6MjA4MDcyNzIyMX0.X_GgShObq9OJ6z7aEKdUCoyHYo-OJL-I5hcIDt4komg';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 카테고리 매핑
const categoryNames = {
    'citizenship': '국적·귀화·난민',
    'admin': '공통 행정 신고',
    'work': '취업·워크',
    'education': '교육·구직',
    'business': '사업·투자',
    'family': '동포·가족·결혼',
    'residence': '거주·영주'
};

const categoryEmojis = {
    'citizenship': '🛂',
    'admin': '📋',
    'work': '💼',
    'education': '🎓',
    'business': '🏢',
    'family': '👨‍👩‍👧',
    'residence': '🏠'
};

// 날짜 포맷
function formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

// ISO 날짜 포맷
function formatISODate(dateString) {
    return new Date(dateString).toISOString();
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// JSON 내 문자열 이스케이프 (Schema.org용)
function escapeJsonString(text) {
    if (!text) return '';
    return text
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

// 콘텐츠 블록 렌더링
function renderBlock(block, index) {
    switch (block.type) {
        case 'heading':
            return `<h2 id="section-${index}">${escapeHtml(block.content)}</h2>`;

        case 'paragraph':
            return `<p>${block.content}</p>`;

        case 'numbered-section':
            return `
                <div class="block-numbered-section" id="section-${index}">
                    <div class="number-badge">${block.number}</div>
                    <div class="section-content">
                        <div class="section-title">${escapeHtml(block.title)}</div>
                        <div class="section-text">${block.content}</div>
                    </div>
                </div>
            `;

        case 'table':
            return `
                <div class="block-table">
                    <table>
                        <thead>
                            <tr>${block.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr>
                        </thead>
                        <tbody>
                            ${block.rows.map(row => `
                                <tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

        case 'info-box':
            const icons = { info: 'ℹ️', warning: '⚠️', danger: '🚨', success: '✅' };
            return `
                <div class="block-info-box ${block.style || 'info'}">
                    <span class="block-info-box-icon">${icons[block.style] || 'ℹ️'}</span>
                    <div class="block-info-box-content">${block.content}</div>
                </div>
            `;

        case 'link-button':
            return `
                <a href="${escapeHtml(block.url)}" class="block-link-button" target="_blank" rel="noopener">
                    ${escapeHtml(block.text)} →
                </a>
            `;

        case 'image':
            return `
                <figure class="block-image">
                    <img src="${escapeHtml(block.url)}" alt="${escapeHtml(block.alt || '')}" loading="lazy">
                    ${block.caption ? `<figcaption class="block-image-caption">${escapeHtml(block.caption)}</figcaption>` : ''}
                </figure>
            `;

        case 'list':
            const tag = block.ordered ? 'ol' : 'ul';
            return `<${tag}>${block.items.map(item => `<li>${item}</li>`).join('')}</${tag}>`;

        default:
            return `<p>${block.content || ''}</p>`;
    }
}

// 블로그 언어 감지 (제목 기준)
function getCTAText(title) {
    const isKorean = /[가-힣]/.test(title);
    return isKorean
        ? { apply: '신청하기', midQ: '대행 서비스가 필요하신가요?', midBtn: '신청하기 →', bottomTitle: '관련 서비스 신청', bottomDesc: '전문가의 도움이 필요하신가요? 지금 바로 서비스를 신청하세요.' }
        : { apply: 'Apply Now', midQ: 'Need help with your application?', midBtn: 'Apply Now →', bottomTitle: 'Related Services', bottomDesc: 'Need professional assistance? Apply for our service now.' };
}

// 콘텐츠 렌더링
function renderContent(content, services, cta) {
    try {
        const blocks = JSON.parse(content);
        const hasLinkButton = blocks.some(b => b.type === 'link-button');
        const midIndex = Math.floor(blocks.length / 2);
        const service = (services && services.length > 0) ? services[0] : null;
        const insertMidCTA = service && !hasLinkButton && blocks.length >= 6;

        return blocks.map((block, index) => {
            let html = renderBlock(block, index);
            if (insertMidCTA && index === midIndex) {
                html += `
                <div class="mid-cta-banner">
                    <div class="mid-cta-text"><strong>${escapeHtml(service.name)}</strong> — ${cta.midQ}</div>
                    <a href="/service-apply-general.html?service=${escapeHtml(service.id)}" class="mid-cta-link">
                        ${cta.midBtn}
                    </a>
                </div>`;
            }
            return html;
        }).join('\n');
    } catch {
        // HTML 형식인 경우 그대로 반환
        return content;
    }
}

// 목차 생성
function generateTOC(content) {
    const headings = [];

    try {
        const blocks = JSON.parse(content);
        blocks.forEach((block, index) => {
            if (block.type === 'heading' || block.type === 'numbered-section') {
                const id = `section-${index}`;
                headings.push({ id, title: block.title || block.content });
            }
        });
    } catch {
        // HTML 형식인 경우 정규식으로 추출
        const regex = /<h2[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h2>/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            headings.push({ id: match[1], title: match[2] });
        }
    }

    const html = headings.map(h => `
                            <li class="toc-item">
                                <a href="#${h.id}" class="toc-link" data-id="${h.id}">${escapeHtml(h.title)}</a>
                            </li>`).join('');

    return { headings, html };
}

// 서비스 버튼 렌더링
function renderServiceButtons(relatedServices, cta) {
    if (!relatedServices || relatedServices.length === 0) {
        const browseText = cta.apply === 'Apply Now' ? 'Browse Services' : '서비스 둘러보기';
        return `
                                <a href="/index.html#services" class="service-cta-btn">
                                    <span>${browseText}</span>
                                    <span class="arrow">→</span>
                                </a>
        `;
    }

    return relatedServices.map(service => `
                                <a href="/service-apply-general.html?service=${escapeHtml(service.id)}" class="service-cta-btn">
                                    <span>${escapeHtml(service.name)} ${cta.apply}</span>
                                    <span class="arrow">→</span>
                                </a>
    `).join('');
}

// 블로그 포스트 HTML 생성
function generatePostHTML(post, relatedPosts) {
    const pageUrl = `https://www.lawyeonvisa.app/blog/${post.slug}.html`;
    const description = post.excerpt || post.title;
    const imageUrl = post.featured_image || 'https://www.lawyeonvisa.app/images/og-default.png';
    const publishDate = formatISODate(post.created_at);
    const modifiedDate = formatISODate(post.updated_at || post.created_at);

    const toc = generateTOC(post.content);
    const relatedServices = post.related_services ? JSON.parse(post.related_services) : [];
    const ctaText = getCTAText(post.title);

    // 관련 글 HTML
    const relatedPostsHTML = relatedPosts.length > 0 ? `
                        <div class="related-posts">
                            <h3 class="related-posts-title">관련 글</h3>
                            <div class="related-posts-grid">
                                ${relatedPosts.map(rp => `
                                <a href="/blog/${rp.slug}.html" class="related-post-card">
                                    <div class="related-post-thumb">
                                        ${rp.thumbnail_url
                                            ? `<img src="${escapeHtml(rp.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" alt="">`
                                            : categoryEmojis[rp.category] || '📄'
                                        }
                                    </div>
                                    <div class="related-post-content">
                                        <div class="related-post-category">${categoryNames[rp.category] || rp.category}</div>
                                        <div class="related-post-title">${escapeHtml(rp.title)}</div>
                                    </div>
                                </a>
                                `).join('')}
                            </div>
                        </div>` : '';

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(post.title)} | 법무법인 로연</title>

    <!-- SEO 메타 태그 -->
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="비자, 체류자격, ${escapeHtml(categoryNames[post.category] || '')}, 출입국, 이민법, 법무법인 로연">
    <meta name="author" content="법무법인 로연 출입국이민지원센터">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${pageUrl}">

    <!-- Open Graph -->
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(post.title)} | 법무법인 로연">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:site_name" content="법무법인 로연 출입국이민지원센터">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="article:author" content="법무법인 로연">
    <meta property="article:publisher" content="https://www.lawyeonvisa.app">
    <meta property="article:published_time" content="${publishDate}">
    <meta property="article:modified_time" content="${modifiedDate}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(post.title)} | 법무법인 로연">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">

    <!-- Schema.org 구조화된 데이터 -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "${escapeJsonString(post.title)}",
        "description": "${escapeJsonString(description)}",
        "image": "${escapeJsonString(imageUrl)}",
        "author": {
            "@type": "Organization",
            "name": "법무법인 로연 출입국이민지원센터",
            "url": "https://www.lawyeonvisa.app"
        },
        "publisher": {
            "@type": "Organization",
            "name": "법무법인 로연",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.lawyeonvisa.app/images/logo.png"
            }
        },
        "datePublished": "${publishDate}",
        "dateModified": "${modifiedDate}",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "${pageUrl}"
        }
    }
    </script>

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="/favicon.png?v=3" type="image/svg+xml">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif;
            background: #ffffff;
            color: #191f28;
            line-height: 1.8;
        }

        /* 헤더 */
        .header {
            background: white;
            border-bottom: 1px solid #e5e8eb;
            padding: 16px 24px;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
            color: #191f28;
        }

        .header h1 a {
            color: #191f28;
            text-decoration: none;
        }

        .header-nav {
            display: flex;
            gap: 24px;
        }

        .header-nav a {
            color: #6b7684;
            text-decoration: none;
            font-size: 14px;
            transition: color 0.2s;
        }

        .header-nav a:hover {
            color: #191f28;
        }

        /* 메인 레이아웃 */
        .main-layout {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 48px;
            padding: 48px 24px;
        }

        @media (max-width: 900px) {
            .main-layout {
                grid-template-columns: 1fr;
            }
            .sidebar {
                display: none;
            }
        }

        /* 아티클 */
        .article {
            max-width: 720px;
        }

        /* 아티클 헤더 */
        .article-header {
            margin-bottom: 40px;
            padding-bottom: 32px;
            border-bottom: 1px solid #e5e8eb;
        }

        .article-category {
            display: inline-block;
            padding: 6px 12px;
            background: #f2f4f6;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            color: #3182f6;
            margin-bottom: 16px;
        }

        .article-title {
            font-size: 32px;
            font-weight: 700;
            line-height: 1.4;
            margin-bottom: 16px;
            color: #191f28;
        }

        .article-meta {
            display: flex;
            align-items: center;
            gap: 16px;
            color: #8b95a1;
            font-size: 14px;
        }

        .article-meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        /* 공유 버튼 */
        .share-buttons {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }

        .share-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: #f8f9fa;
            border: 1px solid #e5e8eb;
            border-radius: 8px;
            font-size: 13px;
            color: #4e5968;
            cursor: pointer;
            transition: all 0.2s;
        }

        .share-btn:hover {
            background: #e5e8eb;
        }

        .header-cta-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 14px;
            background: #eef4ff;
            border: 1px solid #3182f6;
            border-radius: 8px;
            font-size: 13px;
            color: #3182f6;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }

        .header-cta-btn:hover {
            background: #3182f6;
            color: white;
        }

        .header-cta-btn .arrow {
            transition: transform 0.2s;
            font-size: 12px;
        }

        .header-cta-btn:hover .arrow {
            transform: translateX(3px);
        }

        /* 중간 인라인 CTA */
        .mid-cta-banner {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            margin: 48px 0;
            padding: 24px 28px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(26, 26, 46, 0.15);
        }

        .mid-cta-text {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.85);
            line-height: 1.5;
        }

        .mid-cta-text strong {
            color: #ffffff;
        }

        .mid-cta-link {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 12px 24px;
            background: white;
            color: #1a1a2e;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s;
        }

        .mid-cta-link:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
        }

        @media (max-width: 768px) {
            .mid-cta-banner {
                flex-direction: column;
                align-items: flex-start;
                padding: 20px;
            }

            .mid-cta-link {
                width: 100%;
                justify-content: center;
            }
        }

        /* 아티클 본문 */
        .article-content {
            font-size: 17px;
            line-height: 1.9;
            color: #333d4b;
        }

        /* 블록 스타일 */
        .article-content h2 {
            font-size: 24px;
            font-weight: 700;
            margin: 48px 0 20px;
            color: #191f28;
            scroll-margin-top: 80px;
        }

        .article-content h3 {
            font-size: 20px;
            font-weight: 600;
            margin: 32px 0 16px;
            color: #191f28;
        }

        .article-content p {
            margin-bottom: 20px;
        }

        .article-content ul, .article-content ol {
            margin: 16px 0 24px 24px;
        }

        .article-content li {
            margin-bottom: 8px;
        }

        .article-content a {
            color: #3182f6;
            text-decoration: none;
        }

        .article-content a:hover {
            text-decoration: underline;
        }

        /* 번호 섹션 블록 */
        .block-numbered-section {
            display: flex;
            gap: 16px;
            margin: 32px 0;
            padding: 24px;
            background: #f8f9fa;
            border-radius: 12px;
        }

        .block-numbered-section .number-badge {
            width: 32px;
            height: 32px;
            min-width: 32px;
            background: linear-gradient(135deg, #3182f6, #1b64da);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 15px;
        }

        .block-numbered-section .section-content {
            flex: 1;
        }

        .block-numbered-section .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #191f28;
            margin-bottom: 8px;
        }

        .block-numbered-section .section-text {
            color: #4e5968;
            font-size: 15px;
        }

        /* 표 블록 */
        .block-table {
            margin: 24px 0;
            overflow-x: auto;
        }

        .block-table table {
            width: 100%;
            border-collapse: collapse;
            font-size: 15px;
        }

        .block-table th {
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            padding: 14px 16px;
            text-align: left;
            font-weight: 600;
        }

        .block-table td {
            padding: 14px 16px;
            border-bottom: 1px solid #e5e8eb;
        }

        .block-table tr:nth-child(even) {
            background: #f8f9fa;
        }

        .block-table tr:hover {
            background: #f2f4f6;
        }

        /* 안내 박스 블록 */
        .block-info-box {
            margin: 24px 0;
            padding: 20px 24px;
            border-radius: 12px;
            display: flex;
            gap: 12px;
        }

        .block-info-box.info {
            background: #e8f4fd;
            border-left: 4px solid #3182f6;
        }

        .block-info-box.warning {
            background: #fff8e6;
            border-left: 4px solid #f59f00;
        }

        .block-info-box.danger {
            background: #ffeaea;
            border-left: 4px solid #f03e3e;
        }

        .block-info-box.success {
            background: #e6fcf5;
            border-left: 4px solid #20c997;
        }

        .block-info-box-icon {
            font-size: 20px;
        }

        .block-info-box-content {
            flex: 1;
            font-size: 15px;
            color: #333d4b;
        }

        /* 링크 버튼 블록 */
        .block-link-button {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            background: #3182f6;
            color: white;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            margin: 16px 0;
            transition: background 0.2s;
        }

        .block-link-button:hover {
            background: #1b64da;
            text-decoration: none;
        }

        /* 이미지 블록 */
        .block-image {
            margin: 24px 0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .block-image img {
            width: 100%;
            display: block;
        }

        .block-image-caption {
            padding: 12px 16px;
            background: #f8f9fa;
            font-size: 14px;
            color: #6b7684;
            text-align: center;
        }

        /* 사이드바 */
        .sidebar {
            position: sticky;
            top: 80px;
            height: fit-content;
        }

        /* 목차 */
        .toc {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 24px;
        }

        .toc-title {
            font-size: 14px;
            font-weight: 700;
            color: #191f28;
            margin-bottom: 16px;
            padding-bottom: 12px;
            border-bottom: 1px solid #e5e8eb;
        }

        .toc-list {
            list-style: none;
        }

        .toc-item {
            margin-bottom: 8px;
        }

        .toc-link {
            display: block;
            padding: 8px 12px;
            font-size: 14px;
            color: #6b7684;
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.2s;
        }

        .toc-link:hover {
            background: #e5e8eb;
            color: #191f28;
        }

        .toc-link.active {
            background: #3182f6;
            color: white;
        }

        /* 서비스 CTA 섹션 */
        .service-cta-section {
            margin-top: 64px;
            padding: 40px;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            border-radius: 16px;
            color: white;
        }

        .service-cta-title {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 8px;
        }

        .service-cta-desc {
            font-size: 15px;
            opacity: 0.8;
            margin-bottom: 24px;
        }

        .service-cta-buttons {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }

        .service-cta-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 24px;
            background: white;
            color: #1a1a2e;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            font-size: 15px;
            transition: all 0.2s;
        }

        .service-cta-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
        }

        .service-cta-btn .arrow {
            transition: transform 0.2s;
        }

        .service-cta-btn:hover .arrow {
            transform: translateX(4px);
        }

        /* 관련 글 섹션 */
        .related-posts {
            margin-top: 64px;
            padding-top: 48px;
            border-top: 1px solid #e5e8eb;
        }

        .related-posts-title {
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 24px;
            color: #191f28;
        }

        .related-posts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
        }

        @media (max-width: 600px) {
            .related-posts-grid {
                grid-template-columns: 1fr;
            }
        }

        .related-post-card {
            display: flex;
            gap: 16px;
            padding: 16px;
            background: #f8f9fa;
            border-radius: 12px;
            text-decoration: none;
            transition: all 0.2s;
        }

        .related-post-card:hover {
            background: #f2f4f6;
            transform: translateY(-2px);
        }

        .related-post-thumb {
            width: 80px;
            height: 80px;
            min-width: 80px;
            background: linear-gradient(135deg, #e8f4f8, #d1e8ff);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28px;
        }

        .related-post-content {
            flex: 1;
        }

        .related-post-category {
            font-size: 12px;
            color: #3182f6;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .related-post-title {
            font-size: 15px;
            font-weight: 600;
            color: #191f28;
            line-height: 1.4;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }

        /* 목록 버튼 */
        .back-to-list {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-top: 48px;
            padding: 12px 20px;
            background: #f8f9fa;
            border: 1px solid #e5e8eb;
            border-radius: 8px;
            color: #4e5968;
            text-decoration: none;
            font-size: 14px;
            transition: all 0.2s;
        }

        .back-to-list:hover {
            background: #e5e8eb;
        }

        /* 모바일 목차 토글 */
        @media (max-width: 900px) {
            .mobile-toc-toggle {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 16px;
                background: #f8f9fa;
                border: 1px solid #e5e8eb;
                border-radius: 8px;
                font-size: 14px;
                color: #4e5968;
                cursor: pointer;
                margin-bottom: 24px;
                width: 100%;
                border: none;
            }

            .mobile-toc {
                display: none;
                background: #f8f9fa;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 24px;
            }

            .mobile-toc.show {
                display: block;
            }
        }

        @media (min-width: 901px) {
            .mobile-toc-toggle, .mobile-toc {
                display: none !important;
            }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-content">
            <h1><a href="/">법무법인 로연</a></h1>
            <nav class="header-nav">
                <a href="/">서비스</a>
                <a href="/blog.html">뉴스 & 인사이트</a>
            </nav>
        </div>
    </header>

    <main class="main-layout">
        <article class="article">
            <!-- 모바일 목차 토글 -->
            <button class="mobile-toc-toggle" onclick="document.getElementById('mobileToc').classList.toggle('show')">
                <span>📑</span>
                <span>목차 보기</span>
            </button>
            <div class="mobile-toc" id="mobileToc">
                <div class="toc-title">목차</div>
                <ul class="toc-list">${toc.html}</ul>
            </div>

            <header class="article-header">
                <span class="article-category">${categoryNames[post.category] || post.category}</span>
                <h1 class="article-title">${escapeHtml(post.title)}</h1>
                <div class="article-meta">
                    <span class="article-meta-item">
                        <span>📅</span>
                        <span>${formatDate(post.created_at)}</span>
                    </span>
                    ${post.updated_at !== post.created_at ? `
                    <span class="article-meta-item">
                        <span>수정:</span>
                        <span>${formatDate(post.updated_at)}</span>
                    </span>
                    ` : ''}
                </div>
                <div class="share-buttons">
                    <button class="share-btn" onclick="navigator.clipboard.writeText(window.location.href).then(()=>alert('링크가 복사되었습니다.'))">
                        <span>🔗</span>
                        <span>링크 복사</span>
                    </button>
                    ${relatedServices.length > 0 ? `
                    <a href="/service-apply-general.html?service=${escapeHtml(relatedServices[0].id)}" class="header-cta-btn">
                        <span>${escapeHtml(relatedServices[0].name)} ${ctaText.apply}</span>
                        <span class="arrow">→</span>
                    </a>` : ''}
                </div>
            </header>

            <div class="article-content">
                ${renderContent(post.content, relatedServices, ctaText)}
            </div>

            <!-- 서비스 CTA -->
            <div class="service-cta-section">
                <div class="service-cta-title">${ctaText.bottomTitle}</div>
                <div class="service-cta-desc">${ctaText.bottomDesc}</div>
                <div class="service-cta-buttons">
                    ${renderServiceButtons(relatedServices, ctaText)}
                </div>
            </div>

            <!-- 관련 글 -->
            ${relatedPostsHTML}

            <a href="/blog.html" class="back-to-list">← 목록으로 돌아가기</a>
        </article>

        <aside class="sidebar">
            <nav class="toc">
                <div class="toc-title">목차</div>
                <ul class="toc-list" id="tocList">${toc.html}</ul>
            </nav>
        </aside>
    </main>

    <script>
        // 목차 스크롤 하이라이트
        (function() {
            const tocLinks = document.querySelectorAll('.toc-link');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        tocLinks.forEach(link => {
                            link.classList.toggle('active', link.dataset.id === id);
                        });
                    }
                });
            }, { rootMargin: '-80px 0px -80% 0px' });

            document.querySelectorAll('[id^="section-"]').forEach(section => {
                observer.observe(section);
            });
        })();
    </script>
</body>
</html>`;
}

// sitemap.xml 생성
function generateSitemap(posts) {
    const today = new Date().toISOString().split('T')[0];

    const staticPages = [
        { loc: 'https://www.lawyeonvisa.app/', priority: '1.0', changefreq: 'weekly' },
        { loc: 'https://www.lawyeonvisa.app/blog.html', priority: '0.9', changefreq: 'daily' },
        { loc: 'https://www.lawyeonvisa.app/price-list.html', priority: '0.8', changefreq: 'monthly' },
        { loc: 'https://www.lawyeonvisa.app/partnership-apply.html', priority: '0.7', changefreq: 'monthly' },
        { loc: 'https://www.lawyeonvisa.app/terms-of-service.html', priority: '0.3', changefreq: 'yearly' },
        { loc: 'https://www.lawyeonvisa.app/privacy-policy.html', priority: '0.3', changefreq: 'yearly' },
        { loc: 'https://www.lawyeonvisa.app/refund-policy.html', priority: '0.3', changefreq: 'yearly' },
    ];

    const blogUrls = posts.map(post => {
        const lastmod = new Date(post.updated_at || post.created_at).toISOString().split('T')[0];
        return `
  <url>
    <loc>https://www.lawyeonvisa.app/blog/${post.slug}.html</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('');

    const staticUrls = staticPages.map(page => `
  <url>
    <loc>${page.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${staticUrls}
${blogUrls}
</urlset>
`;
}

// 메인 빌드 함수
async function build() {
    console.log('🚀 블로그 SSG 빌드 시작...\n');

    // 1. 블로그 디렉토리 생성
    const blogDir = path.join(__dirname, '..', 'blog');
    if (!fs.existsSync(blogDir)) {
        fs.mkdirSync(blogDir, { recursive: true });
        console.log('📁 /blog 디렉토리 생성됨');
    }

    // 2. Supabase에서 블로그 포스트 가져오기
    console.log('📥 Supabase에서 블로그 포스트 가져오는 중...');
    const { data: posts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Supabase 오류:', error);
        process.exit(1);
    }

    console.log(`✅ ${posts.length}개의 블로그 포스트 발견\n`);

    // 3. 각 포스트에 대해 정적 HTML 생성
    for (const post of posts) {
        // 관련 글 가져오기 (같은 카테고리, 최대 4개)
        const relatedPosts = posts
            .filter(p => p.category === post.category && p.id !== post.id)
            .slice(0, 4);

        const html = generatePostHTML(post, relatedPosts);
        const filePath = path.join(blogDir, `${post.slug}.html`);

        fs.writeFileSync(filePath, html, 'utf-8');
        console.log(`📝 생성됨: /blog/${post.slug}.html`);
    }

    // 4. sitemap.xml 업데이트
    console.log('\n📋 sitemap.xml 업데이트 중...');
    const sitemap = generateSitemap(posts);
    const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
    console.log('✅ sitemap.xml 업데이트 완료');

    // 5. 빌드 완료
    console.log(`\n✨ 빌드 완료! ${posts.length}개의 정적 HTML 파일이 생성되었습니다.`);
}

// 실행
build().catch(err => {
    console.error('❌ 빌드 실패:', err);
    process.exit(1);
});
