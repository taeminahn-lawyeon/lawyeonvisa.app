/**
 * 다국어 지원 시스템 (i18n)
 * 지원 언어: 한국어, 영어, 중국어, 베트남어, 필리핀어, 태국어, 몽골어
 */

const i18n = {
    // 현재 언어
    currentLang: 'ko',
    
    // 번역 데이터
    translations: {
        // 한국어
        ko: {
            // 헤더
            'site.name': 'KoreaLanding Partners',
            'nav.services': '서비스',
            'nav.cost': '비용 안내',
            'nav.faq': 'FAQ',
            'nav.contact': '상담',
            
            // 히어로
            'hero.title': '출입국민원 전문 대행<br>외국인 전용 보험',
            'hero.subtitle': '비자부터 보험까지, 전문가가 함께합니다',
            'hero.stat1.number': '37+',
            'hero.stat1.label': '체류자격 처리',
            'hero.stat2.number': '95%',
            'hero.stat2.label': '비자 승인율',
            'hero.stat3.number': '전문',
            'hero.stat3.label': '외국인 보험',
            'hero.cta': '지금 바로 시작하기',
            'hero.guarantee': '✅ 결제 후 24시간 내 전문가 배정 보장',
            
            // 서비스 섹션
            'services.title': '무엇이 필요하신가요?',
            'services.subtitle': '서비스를 선택하시면 바로 신청할 수 있습니다',
            
            // 비자 카테고리
            'category.visa': '비자 / 체류자격',
            'visa.f6.title': 'F-6 결혼이민',
            'visa.f6.desc': '한국인과 결혼한 외국인',
            'visa.f6.price': '16만원',
            'visa.e7.title': 'E-7 취업비자',
            'visa.e7.desc': '전문직, 기술직 근로자',
            'visa.e7.price': '15만원',
            'visa.d2.title': 'D-2 유학비자',
            'visa.d2.desc': '대학교, 대학원 유학생',
            'visa.d2.price': '16만원',
            'visa.f2.title': 'F-2 거주비자',
            'visa.f2.desc': '장기 거주자',
            'visa.f2.price': '25만원',
            'visa.f5.title': 'F-5 영주권',
            'visa.f5.desc': '영구 거주 자격',
            'visa.f5.price': '50만원',
            'visa.unknown.title': '내 비자를 모르겠어요',
            'visa.unknown.desc': '전문가가 무료로 안내해드립니다',
            'visa.unknown.price': '무료 상담',
            
            // 보험 카테고리
            'category.insurance': '보험',
            'insurance.health.title': '의료보험',
            'insurance.health.desc': '병원비, 치료비 보장',
            'insurance.health.price': '상담 무료',
            'insurance.car.title': '자동차보험',
            'insurance.car.desc': '차량 사고, 손해 보장',
            'insurance.car.price': '상담 무료',
            'insurance.travel.title': '여행자보험',
            'insurance.travel.desc': '해외여행, 국내여행 보장',
            'insurance.travel.price': '상담 무료',
            'insurance.life.title': '생명보험',
            'insurance.life.desc': '사망, 암, 질병 보장',
            'insurance.life.price': '상담 무료',
            
            // 대출 카테고리
            'category.loan': '대출',
            'loan.jeonse.title': '전세자금 대출',
            'loan.jeonse.desc': '집 전세 보증금 대출',
            'loan.jeonse.price': '무료 진단',
            'loan.living.title': '생활자금 대출',
            'loan.living.desc': '생활비, 급한 돈',
            'loan.living.price': '무료 진단',
            'loan.mortgage.title': '주택담보 대출',
            'loan.mortgage.desc': '집을 담보로 대출',
            'loan.mortgage.price': '무료 진단',
            'loan.credit.title': '신용대출',
            'loan.credit.desc': '담보 없이 대출',
            'loan.credit.price': '무료 진단',
            
            // 법률 카테고리
            'category.legal': '법률 서비스',
            'legal.appeal.title': '비자거부 행정심판',
            'legal.appeal.desc': '비자 신청 거부 시',
            'legal.appeal.price': '150만원~',
            'legal.lawsuit.title': '행정소송',
            'legal.lawsuit.desc': '행정 결정 불복',
            'legal.lawsuit.price': '300만원~',
            'legal.deportation.title': '강제퇴거 대응',
            'legal.deportation.desc': '강제출국 명령 시',
            'legal.deportation.price': '200만원~',
            'legal.criminal.title': '형사 변론',
            'legal.criminal.desc': '출입국법 위반 등',
            'legal.criminal.price': '250만원~',
            
            // 버튼
            'btn.apply': '신청하기',
            'btn.consult': '상담 신청',
            'btn.diagnose': '무료 진단',
            'btn.emergency': '긴급 상담',
            'btn.free_consult': '무료 상담하기',
            
            // 배지
            'badge.popular': '인기',
            'badge.new': '신규',
            'badge.urgent': '긴급',
            
            // Trust 섹션
            'trust.title': '왜 코리아랜딩파트너스인가요?',
            'trust.item1.number': '37+',
            'trust.item1.label': '체류자격 전문 처리',
            'trust.item2.number': '변호사',
            'trust.item2.label': '법무법인 직접 운영',
            'trust.item3.number': '외국인',
            'trust.item3.label': '전용 보험 전문',
            'trust.item4.number': '100%',
            'trust.item4.label': '24시간 환불 보장',
            
            // Footer
            'footer.desc': '출입국민원 전문 대행 + 외국인 전용 보험<br>법무부 등록 대행기관 | 변호사 직접 처리',
            'footer.copyright': '© 2025 KoreaLanding Partners. All rights reserved.',
            
            // index.html 전용 번역 (하이픈 형식)
            'logo.subtitle': '코리아랜딩파트너스',
            'nav.visa.types': '체류자격',
            'nav.apply': '신청하기',
            'hero.title': '지금 바로 시작하세요',
            'hero.subtitle': '전문가가 빠르게 처리해드립니다',
            'service.categories.title': '서비스 분류',
            'cat.immigration.title': '출입국 신고/신청',
            'service.extension': '체류기간 연장',
            'service.change': '체류자격 변경',
            'service.registration': '외국인등록증 발급/재발급',
            'service.workplace': '근무처 변경 신고',
            'service.invitation': '초청장 발급 신청',
            'cat.visa.guide.title': '체류자격별 안내',
            'visa.student': '유학/어학연수 (D-2, D-4)',
            'visa.work': '취업 (E-7, E-9, H-2)',
            'visa.family': '가족/결혼 (F-1, F-3, F-6)',
            'visa.residence': '거주/영주 (F-2, F-5)',
            'visa.all.types': '전체 37개 체류자격 보기',
            'cat.financial.title': '금융 서비스',
            'financial.insurance': '보험 상담 (건강/자동차/생명)',
            'financial.loan': '대출 상담 (전세/생활자금)',
            'financial.consult': '맞춤 금융 상담',
            'cat.legal.title': '법률 서비스',
            'legal.appeal': '비자거부 행정심판',
            'legal.lawsuit': '행정소송',
            'legal.deportation': '강제퇴거 이의신청',
            'legal.criminal': '출입국법 위반 형사변론',
            'quick.apply': '온라인 신청',
            'quick.status': '진행상황 조회',
            'quick.cost': '비용 안내',
            'quick.faq': '자주 묻는 질문',
            'process.title': '서비스 이용 절차',
            'process.step1.title': '서비스 선택',
            'process.step1.desc': '필요한 출입국 민원 또는<br>금융 서비스 선택',
            'process.step2.title': '온라인 신청',
            'process.step2.desc': '정보 입력 및<br>서류 업로드',
            'process.step3.title': '결제',
            'process.step3.desc': '해외카드 포함<br>다양한 결제 수단',
            'process.step4.title': '전문가 배정',
            'process.step4.desc': '24시간 내<br>담당자 연락',
            'process.step5.title': '서비스 완료',
            'process.step5.desc': '진행상황 조회 및<br>결과 통보',
            'notice.lawfirm.title': '변호사 직접 처리',
            'notice.lawfirm.desc': '법무부 등록 대행기관<br>변호사와 금융전문가가 직접 담당',
            'notice.secure.title': '안전한 결제',
            'notice.secure.desc': '토스페이먼츠 PCI-DSS 인증<br>해외카드 결제 가능 (Visa, Master, UnionPay)',
            'notice.multilang.title': '다국어 지원',
            'notice.multilang.desc': '한국어, 영어, 중국어, 베트남어<br>WhatsApp, Telegram 상담 가능',
            'notice.refund.title': '명확한 환불',
            'notice.refund.desc': '서류 검토 전 100% 환불<br>단계별 환불 규정 명시',
            'reviews.title': '고객 후기',
            'reviews.description': '실제 이용하신 고객들의 생생한 후기',
            'review.1': '체류연장 신청부터 전세자금 대출까지 한 곳에서 해결했어요. 정말 편리했습니다!',
            'review.2': '베트남어로 상담 받을 수 있어서 정말 좋았어요. 유학생 보험도 추천받았습니다.',
            'review.3': '근무처 변경 신고가 복잡했는데, 법무법인에서 완벽하게 처리해주셨습니다.',
            'btn.view.all.reviews': '전체 후기 보기 <i class="fas fa-arrow-right"></i>',
            'payment.notice.title': '선결제 후 상담 시작',
            'payment.notice.description': '신청 시 결제를 완료하셔야 상담이 시작됩니다. 해외카드(Visa, Mastercard, UnionPay) 결제 가능합니다.',
            'payment.more': '및 기타 결제수단',
            'btn.apply.now': '지금 신청하기 <i class="fas fa-arrow-right"></i>',
            'footer.description': '출입국·금융 전문가 집단<br>변호사와 금융전문가가 직접 처리',
            'footer.company.info': '회사 정보',
            'footer.business.hours': '운영 시간',
            'footer.links.title': '바로가기',
            'footer.link.immigration': '출입국민원 서비스',
            'footer.link.financial': '금융 서비스',
            'footer.link.visa.types': '체류자격 안내',
            'footer.link.apply': '온라인 신청',
            'footer.link.faq': 'FAQ',
            'footer.link.reviews': '고객 후기',
            'footer.terms': '이용약관',
            'footer.privacy': '개인정보처리방침',
            'footer.refund': '환불규정',
            'chat.webchat': '채팅상담',
            'alert.btn.text': '체류기간 알림 설정',
            
            // 새로운 서비스 카드 (무엇이 필요하신가요?)
            'card.visa.title': '비자 신청/연장',
            'card.visa.item1': '✓ 체류기간 연장',
            'card.visa.item2': '✓ 체류자격 변경',
            'card.visa.item3': '✓ 비자 거부 대응',
            'card.visa.item4': '✓ 외국인등록증',
            'card.insurance.title': '보험',
            'card.insurance.item1': '✓ 의료보험 (건강보험)',
            'card.insurance.item2': '✓ 자동차보험',
            'card.insurance.item3': '✓ 생명보험',
            'card.insurance.item4': '✓ 여행자보험',
            'card.loan.title': '대출',
            'card.loan.item1': '✓ 전세자금 대출',
            'card.loan.item2': '✓ 생활자금 대출',
            'card.loan.item3': '✓ 주택담보 대출',
            'card.loan.item4': '✓ 신용대출',
            'card.legal.title': '법률 상담',
            'card.legal.item1': '✓ 비자거부 행정심판',
            'card.legal.item2': '✓ 행정소송',
            'card.legal.item3': '✓ 강제퇴거 대응',
            'card.legal.item4': '✓ 형사 변론',
            'card.btn.select': '선택하기 →'
        },
        
        // 영어
        en: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': 'Services',
            'nav.cost': 'Pricing',
            'nav.faq': 'FAQ',
            'nav.contact': 'Contact',
            
            'hero.title': 'Immigration Expert<br>Foreigner Insurance',
            'hero.subtitle': 'From Visa to Insurance, Experts With You',
            'hero.stat1.number': '37+',
            'hero.stat1.label': 'Visa Types',
            'hero.stat2.number': '95%',
            'hero.stat2.label': 'Approval Rate',
            'hero.stat3.number': 'Expert',
            'hero.stat3.label': 'Insurance',
            'hero.cta': 'Get Started Now',
            'hero.guarantee': '✅ Expert assigned within 24 hours after payment',
            
            'services.title': 'What do you need?',
            'services.subtitle': 'Select a service to apply immediately',
            
            'category.visa': 'Visa / Residence',
            'visa.f6.title': 'F-6 Marriage',
            'visa.f6.desc': 'Married to Korean',
            'visa.f6.price': '160,000 KRW',
            'visa.e7.title': 'E-7 Work Visa',
            'visa.e7.desc': 'Professional/Technical',
            'visa.e7.price': '150,000 KRW',
            'visa.d2.title': 'D-2 Student Visa',
            'visa.d2.desc': 'University/Graduate',
            'visa.d2.price': '160,000 KRW',
            'visa.f2.title': 'F-2 Residence',
            'visa.f2.desc': 'Long-term Resident',
            'visa.f2.price': '250,000 KRW',
            'visa.f5.title': 'F-5 Permanent',
            'visa.f5.desc': 'Permanent Residence',
            'visa.f5.price': '500,000 KRW',
            'visa.unknown.title': 'Not Sure My Visa',
            'visa.unknown.desc': 'Free consultation by expert',
            'visa.unknown.price': 'Free',
            
            'category.insurance': 'Insurance',
            'insurance.health.title': 'Health Insurance',
            'insurance.health.desc': 'Medical expenses',
            'insurance.health.price': 'Free Consult',
            'insurance.car.title': 'Car Insurance',
            'insurance.car.desc': 'Vehicle accidents',
            'insurance.car.price': 'Free Consult',
            'insurance.travel.title': 'Travel Insurance',
            'insurance.travel.desc': 'Travel protection',
            'insurance.travel.price': 'Free Consult',
            'insurance.life.title': 'Life Insurance',
            'insurance.life.desc': 'Death/Disease',
            'insurance.life.price': 'Free Consult',
            
            'category.loan': 'Loan',
            'loan.jeonse.title': 'Jeonse Loan',
            'loan.jeonse.desc': 'Housing deposit',
            'loan.jeonse.price': 'Free Check',
            'loan.living.title': 'Personal Loan',
            'loan.living.desc': 'Living expenses',
            'loan.living.price': 'Free Check',
            'loan.mortgage.title': 'Mortgage Loan',
            'loan.mortgage.desc': 'House collateral',
            'loan.mortgage.price': 'Free Check',
            'loan.credit.title': 'Credit Loan',
            'loan.credit.desc': 'No collateral',
            'loan.credit.price': 'Free Check',
            
            'category.legal': 'Legal Services',
            'legal.appeal.title': 'Visa Rejection Appeal',
            'legal.appeal.desc': 'Administrative appeal',
            'legal.appeal.price': 'From 1.5M KRW',
            'legal.lawsuit.title': 'Administrative Lawsuit',
            'legal.lawsuit.desc': 'Court litigation',
            'legal.lawsuit.price': 'From 3M KRW',
            'legal.deportation.title': 'Deportation Defense',
            'legal.deportation.desc': 'Emergency cases',
            'legal.deportation.price': 'From 2M KRW',
            'legal.criminal.title': 'Criminal Defense',
            'legal.criminal.desc': 'Immigration violations',
            'legal.criminal.price': 'From 2.5M KRW',
            
            'btn.apply': 'Apply',
            'btn.consult': 'Consult',
            'btn.diagnose': 'Free Check',
            'btn.emergency': 'Emergency',
            'btn.free_consult': 'Free Consult',
            
            'badge.popular': 'Popular',
            'badge.new': 'New',
            'badge.urgent': 'Urgent',
            
            'trust.title': 'Why Choose Us?',
            'trust.item1.number': '37+',
            'trust.item1.label': 'Visa Types',
            'trust.item2.number': 'Lawyer',
            'trust.item2.label': 'Law Firm',
            'trust.item3.number': 'Expert',
            'trust.item3.label': 'Insurance',
            'trust.item4.number': '100%',
            'trust.item4.label': '24h Refund',
            
            'footer.desc': 'Immigration Expert + Foreigner Insurance<br>Licensed Agency | Lawyer Direct',
            'footer.copyright': '© 2025 KoreaLanding Partners. All rights reserved.'
        },
        
        // 중국어 (简体)
        zh: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': '服务',
            'nav.cost': '费用',
            'nav.faq': '常见问题',
            'nav.contact': '咨询',
            
            'hero.title': '出入境专业代理<br>外国人专用保险',
            'hero.subtitle': '从签证到保险，专家与您同行',
            'hero.stat1.number': '37+',
            'hero.stat1.label': '签证类型',
            'hero.stat2.number': '95%',
            'hero.stat2.label': '批准率',
            'hero.stat3.number': '专业',
            'hero.stat3.label': '外国人保险',
            'hero.cta': '立即开始',
            'hero.guarantee': '✅ 付款后24小时内分配专家',
            
            'services.title': '您需要什么服务？',
            'services.subtitle': '选择服务即可立即申请',
            
            'category.visa': '签证 / 居留',
            'visa.f6.title': 'F-6 结婚移民',
            'visa.f6.desc': '与韩国人结婚的外国人',
            'visa.f6.price': '16万韩元',
            'visa.e7.title': 'E-7 工作签证',
            'visa.e7.desc': '专业/技术人员',
            'visa.e7.price': '15万韩元',
            'visa.d2.title': 'D-2 留学签证',
            'visa.d2.desc': '大学/研究生',
            'visa.d2.price': '16万韩元',
            'visa.f2.title': 'F-2 居住签证',
            'visa.f2.desc': '长期居住者',
            'visa.f2.price': '25万韩元',
            'visa.f5.title': 'F-5 永久居留',
            'visa.f5.desc': '永久居留资格',
            'visa.f5.price': '50万韩元',
            'visa.unknown.title': '不知道我的签证',
            'visa.unknown.desc': '专家免费指导',
            'visa.unknown.price': '免费咨询',
            
            'category.insurance': '保险',
            'insurance.health.title': '医疗保险',
            'insurance.health.desc': '医疗费用保障',
            'insurance.health.price': '免费咨询',
            'insurance.car.title': '汽车保险',
            'insurance.car.desc': '车辆事故保障',
            'insurance.car.price': '免费咨询',
            'insurance.travel.title': '旅游保险',
            'insurance.travel.desc': '旅行保障',
            'insurance.travel.price': '免费咨询',
            'insurance.life.title': '人寿保险',
            'insurance.life.desc': '死亡、疾病保障',
            'insurance.life.price': '免费咨询',
            
            'category.loan': '贷款',
            'loan.jeonse.title': '全租贷款',
            'loan.jeonse.desc': '租房保证金',
            'loan.jeonse.price': '免费诊断',
            'loan.living.title': '生活费贷款',
            'loan.living.desc': '生活费用',
            'loan.living.price': '免费诊断',
            'loan.mortgage.title': '房屋抵押贷款',
            'loan.mortgage.desc': '房屋抵押',
            'loan.mortgage.price': '免费诊断',
            'loan.credit.title': '信用贷款',
            'loan.credit.desc': '无抵押',
            'loan.credit.price': '免费诊断',
            
            'category.legal': '法律服务',
            'legal.appeal.title': '签证拒签行政诉讼',
            'legal.appeal.desc': '签证被拒时',
            'legal.appeal.price': '150万韩元起',
            'legal.lawsuit.title': '行政诉讼',
            'legal.lawsuit.desc': '行政决定不服',
            'legal.lawsuit.price': '300万韩元起',
            'legal.deportation.title': '驱逐出境应对',
            'legal.deportation.desc': '强制出境命令',
            'legal.deportation.price': '200万韩元起',
            'legal.criminal.title': '刑事辩护',
            'legal.criminal.desc': '出入境法违反',
            'legal.criminal.price': '250万韩元起',
            
            'btn.apply': '申请',
            'btn.consult': '咨询',
            'btn.diagnose': '免费诊断',
            'btn.emergency': '紧急咨询',
            'btn.free_consult': '免费咨询',
            
            'badge.popular': '热门',
            'badge.new': '新',
            'badge.urgent': '紧急',
            
            'trust.title': '为什么选择我们？',
            'trust.item1.number': '37+',
            'trust.item1.label': '签证类型处理',
            'trust.item2.number': '律师',
            'trust.item2.label': '律师事务所直营',
            'trust.item3.number': '外国人',
            'trust.item3.label': '专用保险专业',
            'trust.item4.number': '100%',
            'trust.item4.label': '24小时退款',
            
            'footer.desc': '出入境专业代理 + 外国人专用保险<br>法务部注册代理机构 | 律师直接处理',
            'footer.copyright': '© 2025 KoreaLanding Partners. 版权所有。'
        },
        
        // 베트남어
        vi: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': 'Dịch vụ',
            'nav.cost': 'Giá',
            'nav.faq': 'FAQ',
            'nav.contact': 'Tư vấn',
            
            'hero.title': 'Đại lý XNC chuyên nghiệp<br>Bảo hiểm dành riêng cho người nước ngoài',
            'hero.subtitle': 'Từ visa đến bảo hiểm, chuyên gia đồng hành',
            'hero.stat1.number': '37+',
            'hero.stat1.label': 'Loại visa',
            'hero.stat2.number': '95%',
            'hero.stat2.label': 'Tỷ lệ duyệt',
            'hero.stat3.number': 'Chuyên',
            'hero.stat3.label': 'Bảo hiểm NN',
            'hero.cta': 'Bắt đầu ngay',
            'hero.guarantee': '✅ Phân công chuyên gia trong 24h sau thanh toán',
            
            'services.title': 'Bạn cần dịch vụ gì?',
            'services.subtitle': 'Chọn dịch vụ để đăng ký ngay',
            
            'category.visa': 'Visa / Cư trú',
            'visa.f6.title': 'F-6 Kết hôn',
            'visa.f6.desc': 'Kết hôn với người Hàn',
            'visa.f6.price': '160,000 KRW',
            'visa.e7.title': 'E-7 Visa làm việc',
            'visa.e7.desc': 'Chuyên gia/Kỹ thuật',
            'visa.e7.price': '150,000 KRW',
            'visa.d2.title': 'D-2 Du học',
            'visa.d2.desc': 'Đại học/Cao học',
            'visa.d2.price': '160,000 KRW',
            'visa.f2.title': 'F-2 Cư trú',
            'visa.f2.desc': 'Cư trú dài hạn',
            'visa.f2.price': '250,000 KRW',
            'visa.f5.title': 'F-5 Vĩnh trú',
            'visa.f5.desc': 'Thẻ thường trú',
            'visa.f5.price': '500,000 KRW',
            'visa.unknown.title': 'Không biết visa của tôi',
            'visa.unknown.desc': 'Chuyên gia tư vấn miễn phí',
            'visa.unknown.price': 'Miễn phí',
            
            'category.insurance': 'Bảo hiểm',
            'insurance.health.title': 'Bảo hiểm y tế',
            'insurance.health.desc': 'Chi phí y tế',
            'insurance.health.price': 'Tư vấn miễn phí',
            'insurance.car.title': 'Bảo hiểm xe',
            'insurance.car.desc': 'Tai nạn xe',
            'insurance.car.price': 'Tư vấn miễn phí',
            'insurance.travel.title': 'Bảo hiểm du lịch',
            'insurance.travel.desc': 'Bảo vệ du lịch',
            'insurance.travel.price': 'Tư vấn miễn phí',
            'insurance.life.title': 'Bảo hiểm nhân thọ',
            'insurance.life.desc': 'Tử vong/Bệnh tật',
            'insurance.life.price': 'Tư vấn miễn phí',
            
            'category.loan': 'Vay',
            'loan.jeonse.title': 'Vay Jeonse',
            'loan.jeonse.desc': 'Tiền cọc nhà',
            'loan.jeonse.price': 'Kiểm tra miễn phí',
            'loan.living.title': 'Vay sinh hoạt',
            'loan.living.desc': 'Chi phí sinh hoạt',
            'loan.living.price': 'Kiểm tra miễn phí',
            'loan.mortgage.title': 'Vay thế chấp',
            'loan.mortgage.desc': 'Thế chấp nhà',
            'loan.mortgage.price': 'Kiểm tra miễn phí',
            'loan.credit.title': 'Vay tín dụng',
            'loan.credit.desc': 'Không thế chấp',
            'loan.credit.price': 'Kiểm tra miễn phí',
            
            'category.legal': 'Dịch vụ pháp lý',
            'legal.appeal.title': 'Khiếu nại từ chối visa',
            'legal.appeal.desc': 'Khi bị từ chối visa',
            'legal.appeal.price': 'Từ 1.5M KRW',
            'legal.lawsuit.title': 'Kiện hành chính',
            'legal.lawsuit.desc': 'Không phục quyết định',
            'legal.lawsuit.price': 'Từ 3M KRW',
            'legal.deportation.title': 'Đối phó trục xuất',
            'legal.deportation.desc': 'Lệnh trục xuất',
            'legal.deportation.price': 'Từ 2M KRW',
            'legal.criminal.title': 'Biện hộ hình sự',
            'legal.criminal.desc': 'Vi phạm luật XNC',
            'legal.criminal.price': 'Từ 2.5M KRW',
            
            'btn.apply': 'Đăng ký',
            'btn.consult': 'Tư vấn',
            'btn.diagnose': 'Kiểm tra miễn phí',
            'btn.emergency': 'Khẩn cấp',
            'btn.free_consult': 'Tư vấn miễn phí',
            
            'badge.popular': 'Phổ biến',
            'badge.new': 'Mới',
            'badge.urgent': 'Khẩn cấp',
            
            'trust.title': 'Tại sao chọn chúng tôi?',
            'trust.item1.number': '37+',
            'trust.item1.label': 'Loại visa',
            'trust.item2.number': 'Luật sư',
            'trust.item2.label': 'Công ty luật',
            'trust.item3.number': 'Chuyên',
            'trust.item3.label': 'Bảo hiểm NN',
            'trust.item4.number': '100%',
            'trust.item4.label': 'Hoàn tiền 24h',
            
            'footer.desc': 'Đại lý XNC chuyên nghiệp + Bảo hiểm dành riêng cho NN<br>Cơ quan đại lý đăng ký | Luật sư trực tiếp',
            'footer.copyright': '© 2025 KoreaLanding Partners. Bản quyền.'
        },
        
        // 필리핀어 (Tagalog)
        tl: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': 'Serbisyo',
            'nav.cost': 'Presyo',
            'nav.faq': 'FAQ',
            'nav.contact': 'Konsulta',
            
            'hero.title': 'Eksperto sa Immigration<br>Insurance para sa Dayuhan',
            'hero.subtitle': 'Visa hanggang Insurance, Eksperto kasama mo',
            'hero.stat1.number': '37+',
            'hero.stat1.label': 'Uri ng Visa',
            'hero.stat2.number': '95%',
            'hero.stat2.label': 'Approval Rate',
            'hero.stat3.number': 'Eksperto',
            'hero.stat3.label': 'Insurance',
            'hero.cta': 'Magsimula Ngayon',
            'hero.guarantee': '✅ Expert assignment sa loob ng 24 oras',
            
            'services.title': 'Ano ang kailangan mo?',
            'services.subtitle': 'Pumili ng serbisyo para mag-apply',
            
            'category.visa': 'Visa / Residence',
            'visa.f6.title': 'F-6 Marriage',
            'visa.f6.desc': 'Kasal sa Korean',
            'visa.f6.price': '160,000 KRW',
            'visa.e7.title': 'E-7 Work Visa',
            'visa.e7.desc': 'Professional/Technical',
            'visa.e7.price': '150,000 KRW',
            'visa.d2.title': 'D-2 Student',
            'visa.d2.desc': 'College/Graduate',
            'visa.d2.price': '160,000 KRW',
            'visa.f2.title': 'F-2 Residence',
            'visa.f2.desc': 'Long-term',
            'visa.f2.price': '250,000 KRW',
            'visa.f5.title': 'F-5 Permanent',
            'visa.f5.desc': 'Permanent Residence',
            'visa.f5.price': '500,000 KRW',
            'visa.unknown.title': 'Hindi ko alam visa ko',
            'visa.unknown.desc': 'Libreng konsulta',
            'visa.unknown.price': 'Libre',
            
            'category.insurance': 'Insurance',
            'insurance.health.title': 'Health Insurance',
            'insurance.health.desc': 'Medical expenses',
            'insurance.health.price': 'Libreng Konsulta',
            'insurance.car.title': 'Car Insurance',
            'insurance.car.desc': 'Vehicle accidents',
            'insurance.car.price': 'Libreng Konsulta',
            'insurance.travel.title': 'Travel Insurance',
            'insurance.travel.desc': 'Travel protection',
            'insurance.travel.price': 'Libreng Konsulta',
            'insurance.life.title': 'Life Insurance',
            'insurance.life.desc': 'Death/Disease',
            'insurance.life.price': 'Libreng Konsulta',
            
            'category.loan': 'Loan',
            'loan.jeonse.title': 'Jeonse Loan',
            'loan.jeonse.desc': 'Housing deposit',
            'loan.jeonse.price': 'Libreng Check',
            'loan.living.title': 'Personal Loan',
            'loan.living.desc': 'Living expenses',
            'loan.living.price': 'Libreng Check',
            'loan.mortgage.title': 'Mortgage',
            'loan.mortgage.desc': 'House collateral',
            'loan.mortgage.price': 'Libreng Check',
            'loan.credit.title': 'Credit Loan',
            'loan.credit.desc': 'No collateral',
            'loan.credit.price': 'Libreng Check',
            
            'category.legal': 'Legal Services',
            'legal.appeal.title': 'Visa Rejection Appeal',
            'legal.appeal.desc': 'Administrative',
            'legal.appeal.price': 'From 1.5M KRW',
            'legal.lawsuit.title': 'Lawsuit',
            'legal.lawsuit.desc': 'Court litigation',
            'legal.lawsuit.price': 'From 3M KRW',
            'legal.deportation.title': 'Deportation',
            'legal.deportation.desc': 'Emergency',
            'legal.deportation.price': 'From 2M KRW',
            'legal.criminal.title': 'Criminal Defense',
            'legal.criminal.desc': 'Violations',
            'legal.criminal.price': 'From 2.5M KRW',
            
            'btn.apply': 'Mag-apply',
            'btn.consult': 'Konsulta',
            'btn.diagnose': 'Libreng Check',
            'btn.emergency': 'Emergency',
            'btn.free_consult': 'Libreng Konsulta',
            
            'badge.popular': 'Popular',
            'badge.new': 'Bago',
            'badge.urgent': 'Urgent',
            
            'trust.title': 'Bakit kami?',
            'trust.item1.number': '37+',
            'trust.item1.label': 'Visa Types',
            'trust.item2.number': 'Abogado',
            'trust.item2.label': 'Law Firm',
            'trust.item3.number': 'Eksperto',
            'trust.item3.label': 'Insurance',
            'trust.item4.number': '100%',
            'trust.item4.label': '24h Refund',
            
            'footer.desc': 'Immigration Expert + Foreigner Insurance<br>Licensed Agency | Lawyer Direct',
            'footer.copyright': '© 2025 KoreaLanding Partners. All rights reserved.'
        },
        
        // 태국어
        th: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': 'บริการ',
            'nav.cost': 'ราคา',
            'nav.faq': 'FAQ',
            'nav.contact': 'ปรึกษา',
            
            'hero.title': 'ผู้เชี่ยวชาญตรวจคนเข้าเมือง<br>ประกันสำหรับชาวต่างชาติ',
            'hero.subtitle': 'วีซ่าถึงประกัน ผู้เชี่ยวชาญอยู่กับคุณ',
            'hero.stat1.number': '37+',
            'hero.stat1.label': 'ประเภทวีซ่า',
            'hero.stat2.number': '95%',
            'hero.stat2.label': 'อัตราอนุมัติ',
            'hero.stat3.number': 'ผู้เชี่ยวชาญ',
            'hero.stat3.label': 'ประกัน',
            'hero.cta': 'เริ่มตอนนี้',
            'hero.guarantee': '✅ มอบหมายผู้เชี่ยวชาญภายใน 24 ชั่วโมง',
            
            'services.title': 'คุณต้องการอะไร?',
            'services.subtitle': 'เลือกบริการเพื่อสมัครทันที',
            
            'category.visa': 'วีซ่า / การพำนัก',
            'visa.f6.title': 'F-6 แต่งงาน',
            'visa.f6.desc': 'แต่งงานกับคนเกาหลี',
            'visa.f6.price': '160,000 วอน',
            'visa.e7.title': 'E-7 วีซ่าทำงาน',
            'visa.e7.desc': 'มืออาชีพ/เทคนิค',
            'visa.e7.price': '150,000 วอน',
            'visa.d2.title': 'D-2 นักเรียน',
            'visa.d2.desc': 'มหาวิทยาลัย/บัณฑิต',
            'visa.d2.price': '160,000 วอน',
            'visa.f2.title': 'F-2 พำนัก',
            'visa.f2.desc': 'พำนักระยะยาว',
            'visa.f2.price': '250,000 วอน',
            'visa.f5.title': 'F-5 ถาวร',
            'visa.f5.desc': 'การพำนักถาวร',
            'visa.f5.price': '500,000 วอน',
            'visa.unknown.title': 'ไม่แน่ใจวีซ่าของฉัน',
            'visa.unknown.desc': 'ปรึกษาฟรี',
            'visa.unknown.price': 'ฟรี',
            
            'category.insurance': 'ประกัน',
            'insurance.health.title': 'ประกันสุขภาพ',
            'insurance.health.desc': 'ค่ารักษาพยาบาล',
            'insurance.health.price': 'ปรึกษาฟรี',
            'insurance.car.title': 'ประกันรถ',
            'insurance.car.desc': 'อุบัติเหตุรถ',
            'insurance.car.price': 'ปรึกษาฟรี',
            'insurance.travel.title': 'ประกันการเดินทาง',
            'insurance.travel.desc': 'ป้องกันการเดินทาง',
            'insurance.travel.price': 'ปรึกษาฟรี',
            'insurance.life.title': 'ประกันชีวิต',
            'insurance.life.desc': 'เสียชีวิต/เจ็บป่วย',
            'insurance.life.price': 'ปรึกษาฟรี',
            
            'category.loan': 'สินเชื่อ',
            'loan.jeonse.title': 'สินเชื่อ Jeonse',
            'loan.jeonse.desc': 'เงินมัดจำที่อยู่อาศัย',
            'loan.jeonse.price': 'ตรวจสอบฟรี',
            'loan.living.title': 'สินเชื่อส่วนบุคคล',
            'loan.living.desc': 'ค่าครองชีพ',
            'loan.living.price': 'ตรวจสอบฟรี',
            'loan.mortgage.title': 'สินเชื่อจำนอง',
            'loan.mortgage.desc': 'จำนองบ้าน',
            'loan.mortgage.price': 'ตรวจสอบฟรี',
            'loan.credit.title': 'สินเชื่อเครดิต',
            'loan.credit.desc': 'ไม่มีหลักประกัน',
            'loan.credit.price': 'ตรวจสอบฟรี',
            
            'category.legal': 'บริการทางกฎหมาย',
            'legal.appeal.title': 'อุทธรณ์วีซ่าถูกปฏิเสธ',
            'legal.appeal.desc': 'อุทธรณ์ทางปกครอง',
            'legal.appeal.price': 'ตั้งแต่ 1.5M วอน',
            'legal.lawsuit.title': 'คดีทางปกครอง',
            'legal.lawsuit.desc': 'คดีศาล',
            'legal.lawsuit.price': 'ตั้งแต่ 3M วอน',
            'legal.deportation.title': 'ป้องกันการเนรเทศ',
            'legal.deportation.desc': 'กรณีฉุกเฉิน',
            'legal.deportation.price': 'ตั้งแต่ 2M วอน',
            'legal.criminal.title': 'ว่าความคดีอาญา',
            'legal.criminal.desc': 'ละเมิดกฎหมาย',
            'legal.criminal.price': 'ตั้งแต่ 2.5M วอน',
            
            'btn.apply': 'สมัคร',
            'btn.consult': 'ปรึกษา',
            'btn.diagnose': 'ตรวจสอบฟรี',
            'btn.emergency': 'ฉุกเฉิน',
            'btn.free_consult': 'ปรึกษาฟรี',
            
            'badge.popular': 'ยอดนิยม',
            'badge.new': 'ใหม่',
            'badge.urgent': 'ฉุกเฉิน',
            
            'trust.title': 'ทำไมต้องเลือกเรา?',
            'trust.item1.number': '37+',
            'trust.item1.label': 'ประเภทวีซ่า',
            'trust.item2.number': 'ทนาย',
            'trust.item2.label': 'สำนักงานกฎหมาย',
            'trust.item3.number': 'ผู้เชี่ยวชาญ',
            'trust.item3.label': 'ประกัน',
            'trust.item4.number': '100%',
            'trust.item4.label': 'คืนเงิน 24 ชม.',
            
            'footer.desc': 'ผู้เชี่ยวชาญตรวจคนเข้าเมือง + ประกันชาวต่างชาติ<br>หน่วยงานที่ได้รับอนุญาต | ทนายโดยตรง',
            'footer.copyright': '© 2025 KoreaLanding Partners. สงวนลิขสิทธิ์.'
        },
        
        // 몽골어
        mn: {
            'site.name': 'KoreaLanding Partners',
            'nav.services': 'Үйлчилгээ',
            'nav.cost': 'Үнэ',
            'nav.faq': 'FAQ',
            'nav.contact': 'Зөвлөгөө',
            
            'hero.title': 'Цагаачлалын мэргэжилтэн<br>Гадаадын иргэдэд зориулсан даатгал',
            'hero.subtitle': 'Виз-ээс даатгал хүртэл, мэргэжилтэн хамт',
            'hero.stat1.number': '37+',
            'hero.stat1.label': 'Визийн төрөл',
            'hero.stat2.number': '95%',
            'hero.stat2.label': 'Батлах хувь',
            'hero.stat3.number': 'Мэргэжилтэн',
            'hero.stat3.label': 'Даатгал',
            'hero.cta': 'Одоо эхлэх',
            'hero.guarantee': '✅ Төлбөрийн дараа 24 цагт мэргэжилтэн томилох',
            
            'services.title': 'Танд юу хэрэгтэй вэ?',
            'services.subtitle': 'Үйлчилгээ сонгоход шууд бүртгүүлэх',
            
            'category.visa': 'Виз / Оршин суух',
            'visa.f6.title': 'F-6 Гэрлэлт',
            'visa.f6.desc': 'Солонгостой гэрлэсэн',
            'visa.f6.price': '160,000 вон',
            'visa.e7.title': 'E-7 Ажлын виз',
            'visa.e7.desc': 'Мэргэжлийн/Техникийн',
            'visa.e7.price': '150,000 вон',
            'visa.d2.title': 'D-2 Суралцагчийн виз',
            'visa.d2.desc': 'Их сургууль/Магистр',
            'visa.d2.price': '160,000 вон',
            'visa.f2.title': 'F-2 Оршин суух',
            'visa.f2.desc': 'Урт хугацаа',
            'visa.f2.price': '250,000 вон',
            'visa.f5.title': 'F-5 Байнгын',
            'visa.f5.desc': 'Байнгын оршин суух',
            'visa.f5.price': '500,000 вон',
            'visa.unknown.title': 'Визээ мэдэхгүй байна',
            'visa.unknown.desc': 'Үнэгүй зөвлөгөө',
            'visa.unknown.price': 'Үнэгүй',
            
            'category.insurance': 'Даатгал',
            'insurance.health.title': 'Эрүүл мэндийн даатгал',
            'insurance.health.desc': 'Эмчилгээний зардал',
            'insurance.health.price': 'Үнэгүй зөвлөгөө',
            'insurance.car.title': 'Автомашины даатгал',
            'insurance.car.desc': 'Тээврийн хэрэгсэл',
            'insurance.car.price': 'Үнэгүй зөвлөгөө',
            'insurance.travel.title': 'Аялалын даатгал',
            'insurance.travel.desc': 'Аялалын хамгаалалт',
            'insurance.travel.price': 'Үнэгүй зөвлөгөө',
            'insurance.life.title': 'Амьдралын даатгал',
            'insurance.life.desc': 'Нас барах/Өвчлөл',
            'insurance.life.price': 'Үнэгүй зөвлөгөө',
            
            'category.loan': 'Зээл',
            'loan.jeonse.title': 'Jeonse зээл',
            'loan.jeonse.desc': 'Орон сууцны барьцаа',
            'loan.jeonse.price': 'Үнэгүй шалгах',
            'loan.living.title': 'Хувийн зээл',
            'loan.living.desc': 'Амьжиргааны зардал',
            'loan.living.price': 'Үнэгүй шалгах',
            'loan.mortgage.title': 'Моргежийн зээл',
            'loan.mortgage.desc': 'Орон сууцны барьцаа',
            'loan.mortgage.price': 'Үнэгүй шалгах',
            'loan.credit.title': 'Зээлийн зээл',
            'loan.credit.desc': 'Барьцаагүй',
            'loan.credit.price': 'Үнэгүй шалгах',
            
            'category.legal': 'Хууль зүйн үйлчилгээ',
            'legal.appeal.title': 'Виз татгалзсан давж заалдах',
            'legal.appeal.desc': 'Захиргааны давж заалдах',
            'legal.appeal.price': '1.5M вон-оос',
            'legal.lawsuit.title': 'Захиргааны нэхэмжлэл',
            'legal.lawsuit.desc': 'Шүүхийн маргаан',
            'legal.lawsuit.price': '3M вон-оос',
            'legal.deportation.title': 'Албадан гаргахаас хамгаалах',
            'legal.deportation.desc': 'Яаралтай тохиолдол',
            'legal.deportation.price': '2M вон-оос',
            'legal.criminal.title': 'Эрүүгийн өмгөөлөл',
            'legal.criminal.desc': 'Зөрчил',
            'legal.criminal.price': '2.5M вон-оос',
            
            'btn.apply': 'Бүртгүүлэх',
            'btn.consult': 'Зөвлөгөө',
            'btn.diagnose': 'Үнэгүй шалгах',
            'btn.emergency': 'Яаралтай',
            'btn.free_consult': 'Үнэгүй зөвлөгөө',
            
            'badge.popular': 'Алдартай',
            'badge.new': 'Шинэ',
            'badge.urgent': 'Яаралтай',
            
            'trust.title': 'Яагаад биднийг сонгох вэ?',
            'trust.item1.number': '37+',
            'trust.item1.label': 'Визийн төрөл',
            'trust.item2.number': 'Өмгөөлөгч',
            'trust.item2.label': 'Хуулийн фирм',
            'trust.item3.number': 'Мэргэжилтэн',
            'trust.item3.label': 'Даатгал',
            'trust.item4.number': '100%',
            'trust.item4.label': '24ц буцаалт',
            
            'footer.desc': 'Цагаачлалын мэргэжилтэн + Гадаадын иргэдийн даатгал<br>Лицензтэй агентлаг | Өмгөөлөгч шууд',
            'footer.copyright': '© 2025 KoreaLanding Partners. Бүх эрх хуулиар хамгаалагдсан.'
        }
    },
    
    // 언어 전환
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('preferredLang', lang);
            this.updatePage();
            this.updateLangButtons();
        }
    },
    
    // 번역 가져오기
    t(key) {
        // 하이픈(-)을 점(.)으로 변환하여 호환성 지원
        const normalizedKey = key.replace(/-/g, '.');
        return this.translations[this.currentLang][normalizedKey] || 
               this.translations[this.currentLang][key] || 
               key;
    },
    
    // 페이지 업데이트
    updatePage() {
        // data-i18n 속성을 가진 모든 요소 업데이트
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = translation;
            } else {
                element.innerHTML = translation;
            }
        });
    },
    
    // 언어 버튼 업데이트
    updateLangButtons() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const btnLang = btn.getAttribute('data-lang');
            if (btnLang === this.currentLang) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    },
    
    // 초기화
    init() {
        // 저장된 언어 또는 브라우저 언어 감지
        const savedLang = localStorage.getItem('preferredLang');
        const browserLang = navigator.language.split('-')[0];
        
        if (savedLang && this.translations[savedLang]) {
            this.currentLang = savedLang;
        } else if (this.translations[browserLang]) {
            this.currentLang = browserLang;
        }
        
        // 페이지 업데이트
        this.updatePage();
        this.updateLangButtons();
        
        // 언어 버튼 이벤트 리스너
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lang = btn.getAttribute('data-lang');
                this.setLanguage(lang);
            });
        });
    }
};

// DOM 로드 후 초기화
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
    i18n.init();
}
