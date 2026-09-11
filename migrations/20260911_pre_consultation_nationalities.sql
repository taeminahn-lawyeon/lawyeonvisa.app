-- Canonical Ministry of Justice country names and pre-consultation citizenship.
-- Apply BEFORE publishing the new form or deploying send-admin-email.
-- Verified 2026-09-11: HiKorea Korean labels, Visa Portal active country list.
BEGIN;

CREATE TABLE IF NOT EXISTS public.moj_country_names (
  code text PRIMARY KEY,
  name_ko text NOT NULL UNIQUE,
  name_en text NOT NULL,
  iso2 text UNIQUE,
  is_residence boolean NOT NULL,
  supports_dual boolean NOT NULL,
  aliases text[] NOT NULL
);
ALTER TABLE public.moj_country_names ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.moj_country_names FROM anon, authenticated;
GRANT SELECT ON public.moj_country_names TO anon, authenticated;
DROP POLICY IF EXISTS moj_country_names_read ON public.moj_country_names;
CREATE POLICY moj_country_names_read ON public.moj_country_names
  FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.moj_country_names
  (code, name_ko, name_en, iso2, is_residence, supports_dual, aliases)
VALUES
('101', '아프가니스탄', 'Afghanistan', 'AF', true, true, ARRAY['아프가니스탄', 'afghanistan', '101', 'af']::text[]),
('301', '알바니아', 'Albania', 'AL', true, true, ARRAY['알바니아', 'albania', '301', 'al']::text[]),
('502', '알제리', 'Algeria', 'DZ', true, true, ARRAY['알제리', 'algeria', '502', 'dz']::text[]),
('302', '안도라', 'Andorra', 'AD', true, true, ARRAY['안도라', 'andorra', '302', 'ad']::text[]),
('503', '앙골라', 'Angola', 'AO', true, true, ARRAY['앙골라', 'angola', '503', 'ao']::text[]),
('201', '앤티카바부다', 'Antigua and Barbuda', 'AG', true, true, ARRAY['앤티카바부다', 'antigua and barbuda', 'antigua-barbuda', '201', 'ag', '앤티가 바부다']::text[]),
('202', '아르헨티나', 'Argentina', 'AR', true, true, ARRAY['아르헨티나', 'argentina', '202', 'ar']::text[]),
('304', '아르메니아', 'Armenia', 'AM', true, true, ARRAY['아르메니아', 'armenia', '304', 'am']::text[]),
('404', '오스트레일리아', 'Australia', 'AU', true, true, ARRAY['오스트레일리아', 'australia', '404', 'au']::text[]),
('303', '오스트리아', 'Austria', 'AT', true, true, ARRAY['오스트리아', 'austria', '303', 'at']::text[]),
('305', '아제르바이잔', 'Azerbaijan', 'AZ', true, true, ARRAY['아제르바이잔', 'azerbaijan', '305', 'az']::text[]),
('205', '바하마', 'Bahamas', 'BS', true, true, ARRAY['바하마', 'bahamas', '205', 'bs']::text[]),
('104', '바레인', 'Bahrain', 'BH', true, true, ARRAY['바레인', 'bahrain', '104', 'bh']::text[]),
('105', '방글라데시', 'Bangladesh', 'BD', true, true, ARRAY['방글라데시', 'bangladesh', '105', 'bd']::text[]),
('206', '바베이도스', 'Barbados', 'BB', true, true, ARRAY['바베이도스', 'barbados', '206', 'bb']::text[]),
('308', '벨라루스', 'Belarus', 'BY', true, true, ARRAY['벨라루스', 'belarus', '308', 'by']::text[]),
('306', '벨기에', 'Belgium', 'BE', true, true, ARRAY['벨기에', 'belgium', '306', 'be']::text[]),
('207', '벨리즈', 'Belize', 'BZ', true, true, ARRAY['벨리즈', 'belize', '207', 'bz']::text[]),
('520', '베냉', 'Benin', 'BJ', true, true, ARRAY['베냉', 'benin', '520', 'bj']::text[]),
('210', '버뮤다', 'Bermuda', 'BM', true, true, ARRAY['버뮤다', 'bermuda', '210', 'bm']::text[]),
('106', '부탄', 'Bhutan', 'BT', true, true, ARRAY['부탄', 'bhutan', '106', 'bt']::text[]),
('208', '볼리비아', 'Bolivia', 'BO', true, true, ARRAY['볼리비아', 'bolivia', '208', 'bo']::text[]),
('309', '보스니아-헤르체고비나', 'Bosnia and Herzegovina', 'BA', true, true, ARRAY['보스니아-헤르체고비나', 'bosnia and herzegovina', 'bosnia-hercegovina', '309', 'ba', '보스니아 헤르체고비나']::text[]),
('506', '보츠와나', 'Botswana', 'BW', true, true, ARRAY['보츠와나', 'botswana', '506', 'bw']::text[]),
('209', '브라질', 'Brazil', 'BR', true, true, ARRAY['브라질', 'brazil', '209', 'br']::text[]),
('318', '영국외지민', 'British National Overseas', NULL, false, true, ARRAY['영국외지민', 'british national overseas', '318']::text[]),
('319', '영국외지시민', 'British Overseas Citizen', NULL, false, true, ARRAY['영국외지시민', 'british overseas citizen', '319']::text[]),
('317', '영국해외영토시민', 'British Overseas Territories Citizen', NULL, false, true, ARRAY['영국해외영토시민', 'british overseas territories citizen', '317']::text[]),
('314', '영국보호민', 'British Protected Person', NULL, false, true, ARRAY['영국보호민', 'british protected person', '314']::text[]),
('315', '영국속국민', 'British Subject', NULL, false, true, ARRAY['영국속국민', 'british subject', '315']::text[]),
('107', '브루나이', 'Brunei', 'BN', true, true, ARRAY['브루나이', 'brunei', '107', 'bn']::text[]),
('307', '불가리아', 'Bulgaria', 'BG', true, true, ARRAY['불가리아', 'bulgaria', '307', 'bg']::text[]),
('589', '부르키나파소', 'Burkina Faso', 'BF', true, true, ARRAY['부르키나파소', 'burkina faso', '589', 'bf']::text[]),
('507', '부룬디', 'Burundi', 'BI', true, true, ARRAY['부룬디', 'burundi', '507', 'bi']::text[]),
('110', '캄보디아', 'Cambodia', 'KH', true, true, ARRAY['캄보디아', 'cambodia', '110', 'kh']::text[]),
('510', '카메룬', 'Cameroon', 'CM', true, true, ARRAY['카메룬', 'cameroon', '510', 'cm']::text[]),
('213', '캐나다', 'Canada', 'CA', true, true, ARRAY['캐나다', 'canada', '213', 'ca']::text[]),
('511', '카나리아군도', 'Canary Islands', NULL, true, true, ARRAY['카나리아군도', 'canary islands', 'canary is.', '511']::text[]),
('512', '카보베르데', 'Cabo Verde', 'CV', true, true, ARRAY['카보베르데', 'cabo verde', 'cape verde', '512', 'cv']::text[]),
('513', '중앙아프리카공화국', 'Central African Republic', 'CF', true, true, ARRAY['중앙아프리카공화국', 'central african republic', 'central africa', '513', 'cf']::text[]),
('514', '차드', 'Chad', 'TD', true, true, ARRAY['차드', 'chad', '514', 'td']::text[]),
('214', '칠레', 'Chile', 'CL', true, true, ARRAY['칠레', 'chile', '214', 'cl']::text[]),
('112', '중국', 'China', 'CN', true, true, ARRAY['중국', 'china', 'china p. r.', '112', 'cn']::text[]),
('120', '홍콩', 'Hong Kong', 'HK', true, true, ARRAY['홍콩', 'hong kong', 'china p. r.(hong kong)', '120', 'hk']::text[]),
('142', '마카오', 'Macao', 'MO', true, true, ARRAY['마카오', 'macao', 'china p. r.(macao)', '142', 'mo']::text[]),
('113', '타이완', 'Taiwan', 'TW', true, true, ARRAY['타이완', 'taiwan', 'china(taiwan)', '113', 'tw', '대만']::text[]),
('215', '콜롬비아', 'Colombia', 'CO', true, true, ARRAY['콜롬비아', 'colombia', '215', 'co']::text[]),
('515', '코모로', 'Comoros', 'KM', true, true, ARRAY['코모로', 'comoros', '515', 'km']::text[]),
('517', '콩고민주공화국', 'Democratic Republic of the Congo', 'CD', true, true, ARRAY['콩고민주공화국', 'democratic republic of the congo', 'congo d r', '517', 'cd']::text[]),
('412', '쿡아일랜드', 'Cook Islands', 'CK', true, true, ARRAY['쿡아일랜드', 'cook islands', 'cook is.', '412', 'ck']::text[]),
('216', '코스타리카', 'Costa Rica', 'CR', true, true, ARRAY['코스타리카', 'costa rica', '216', 'cr']::text[]),
('537', '코트디부아르', 'Côte d''Ivoire', 'CI', true, true, ARRAY['코트디부아르', 'côte d''ivoire', 'cote d''ivoire', '537', 'ci']::text[]),
('391', '크로아티아', 'Croatia', 'HR', true, true, ARRAY['크로아티아', 'croatia', '391', 'hr']::text[]),
('217', '쿠바', 'Cuba', 'CU', true, true, ARRAY['쿠바', 'cuba', '217', 'cu']::text[]),
('114', '키프로스', 'Cyprus', 'CY', true, true, ARRAY['키프로스', 'cyprus', '114', 'cy']::text[]),
('310', '체코', 'Czechia', 'CZ', true, true, ARRAY['체코', 'czechia', 'czech', '310', 'cz']::text[]),
('313', '덴마크', 'Denmark', 'DK', true, true, ARRAY['덴마크', 'denmark', '313', 'dk']::text[]),
('521', '지부티', 'Djibouti', 'DJ', true, true, ARRAY['지부티', 'djibouti', '521', 'dj']::text[]),
('220', '도미니카연방', 'Dominica', 'DM', true, true, ARRAY['도미니카연방', 'dominica', '220', 'dm']::text[]),
('221', '도미니카공화국', 'Dominican Republic', 'DO', true, true, ARRAY['도미니카공화국', 'dominican republic', 'dominican rep.', '221', 'do']::text[]),
('156', '티모르민주공화국', 'Timor-Leste', 'TL', true, true, ARRAY['티모르민주공화국', 'timor-leste', 'east-timor', '156', 'tl', '동티모르']::text[]),
('224', '에콰도르', 'Ecuador', 'EC', true, true, ARRAY['에콰도르', 'ecuador', '224', 'ec']::text[]),
('525', '이집트', 'Egypt', 'EG', true, true, ARRAY['이집트', 'egypt', '525', 'eg']::text[]),
('225', '엘살바도르', 'El Salvador', 'SV', true, true, ARRAY['엘살바도르', 'el salvador', '225', 'sv']::text[]),
('526', '적도기니', 'Equatorial Guinea', 'GQ', true, true, ARRAY['적도기니', 'equatorial guinea', 'equator-guinea', '526', 'gq']::text[]),
('528', '에리트레아', 'Eritrea', 'ER', true, true, ARRAY['에리트레아', 'eritrea', '528', 'er']::text[]),
('312', '에스토니아', 'Estonia', 'EE', true, true, ARRAY['에스토니아', 'estonia', '312', 'ee']::text[]),
('579', '에스와티니', 'Eswatini', 'SZ', true, true, ARRAY['에스와티니', 'eswatini', '579', 'sz']::text[]),
('527', '에티오피아', 'Ethiopia', 'ET', true, true, ARRAY['에티오피아', 'ethiopia', '527', 'et']::text[]),
('418', '피지', 'Fiji', 'FJ', true, true, ARRAY['피지', 'fiji', '418', 'fj']::text[]),
('320', '핀란드', 'Finland', 'FI', true, true, ARRAY['핀란드', 'finland', '320', 'fi']::text[]),
('321', '프랑스', 'France', 'FR', true, true, ARRAY['프랑스', 'france', '321', 'fr']::text[]),
('530', '가봉', 'Gabon', 'GA', true, true, ARRAY['가봉', 'gabon', '530', 'ga']::text[]),
('531', '감비아', 'Gambia', 'GM', true, true, ARRAY['감비아', 'gambia', '531', 'gm']::text[]),
('323', '조지아', 'Georgia', 'GE', true, true, ARRAY['조지아', 'georgia', '323', 'ge']::text[]),
('324', '독일', 'Germany', 'DE', true, true, ARRAY['독일', 'germany', 'germany f.r', '324', 'de']::text[]),
('532', '가나', 'Ghana', 'GH', true, true, ARRAY['가나', 'ghana', '532', 'gh']::text[]),
('326', '그리스', 'Greece', 'GR', true, true, ARRAY['그리스', 'greece', '326', 'gr']::text[]),
('328', '그린란드', 'Greenland', 'GL', true, true, ARRAY['그린란드', 'greenland', '328', 'gl']::text[]),
('229', '그레나다', 'Grenada', 'GD', true, true, ARRAY['그레나다', 'grenada', '229', 'gd']::text[]),
('423', '괌', 'Guam', 'GU', true, true, ARRAY['괌', 'guam', '423', 'gu']::text[]),
('231', '과테말라', 'Guatemala', 'GT', true, true, ARRAY['과테말라', 'guatemala', '231', 'gt']::text[]),
('533', '기니', 'Guinea', 'GN', true, true, ARRAY['기니', 'guinea', '533', 'gn']::text[]),
('534', '기니비사우', 'Guinea-Bissau', 'GW', true, true, ARRAY['기니비사우', 'guinea-bissau', 'guinea bissau', '534', 'gw']::text[]),
('232', '가이아나', 'Guyana', 'GY', true, true, ARRAY['가이아나', 'guyana', '232', 'gy']::text[]),
('235', '아이티', 'Haiti', 'HT', true, true, ARRAY['아이티', 'haiti', '235', 'ht']::text[]),
('390', '교황청', 'Holy See', 'VA', true, true, ARRAY['교황청', 'holy see', '390', 'va', '바티칸']::text[]),
('236', '온두라스', 'Honduras', 'HN', true, true, ARRAY['온두라스', 'honduras', '236', 'hn']::text[]),
('121', '홍콩거주난민', 'Hong Kong Document of Identity', NULL, false, false, ARRAY['홍콩거주난민', 'hong kong document of identity', 'hong kong d.i.', '121']::text[]),
('329', '헝가리', 'Hungary', 'HU', true, true, ARRAY['헝가리', 'hungary', '329', 'hu']::text[]),
('333', '아이슬란드', 'Iceland', 'IS', true, true, ARRAY['아이슬란드', 'iceland', '333', 'is']::text[]),
('124', '인도', 'India', 'IN', true, true, ARRAY['인도', 'india', '124', 'in']::text[]),
('125', '인도네시아', 'Indonesia', 'ID', true, true, ARRAY['인도네시아', 'indonesia', '125', 'id']::text[]),
('126', '이란', 'Iran', 'IR', true, true, ARRAY['이란', 'iran', '126', 'ir']::text[]),
('127', '이라크', 'Iraq', 'IQ', true, true, ARRAY['이라크', 'iraq', '127', 'iq']::text[]),
('334', '아일랜드', 'Ireland', 'IE', true, true, ARRAY['아일랜드', 'ireland', '334', 'ie']::text[]),
('128', '이스라엘', 'Israel', 'IL', true, true, ARRAY['이스라엘', 'israel', '128', 'il']::text[]),
('335', '이탈리아', 'Italy', 'IT', true, true, ARRAY['이탈리아', 'italy', '335', 'it']::text[]),
('240', '자메이카', 'Jamaica', 'JM', true, true, ARRAY['자메이카', 'jamaica', '240', 'jm']::text[]),
('130', '일본', 'Japan', 'JP', true, true, ARRAY['일본', 'japan', '130', 'jp']::text[]),
('131', '요르단', 'Jordan', 'JO', true, true, ARRAY['요르단', 'jordan', '131', 'jo']::text[]),
('133', '카자흐스탄', 'Kazakhstan', 'KZ', true, true, ARRAY['카자흐스탄', 'kazakhstan', '133', 'kz']::text[]),
('540', '케냐', 'Kenya', 'KE', true, true, ARRAY['케냐', 'kenya', '540', 'ke']::text[]),
('429', '키리바시', 'Kiribati', 'KI', true, true, ARRAY['키리바시', 'kiribati', '429', 'ki']::text[]),
('135', '쿠웨이트', 'Kuwait', 'KW', true, true, ARRAY['쿠웨이트', 'kuwait', '135', 'kw']::text[]),
('134', '키르기즈', 'Kyrgyzstan', 'KG', true, true, ARRAY['키르기즈', 'kyrgyzstan', 'kyrgyz republic', '134', 'kg', '키르기스스탄']::text[]),
('138', '라오스', 'Laos', 'LA', true, true, ARRAY['라오스', 'laos', '138', 'la']::text[]),
('339', '라트비아', 'Latvia', 'LV', true, true, ARRAY['라트비아', 'latvia', '339', 'lv']::text[]),
('139', '레바논', 'Lebanon', 'LB', true, true, ARRAY['레바논', 'lebanon', '139', 'lb']::text[]),
('542', '레소토', 'Lesotho', 'LS', true, true, ARRAY['레소토', 'lesotho', '542', 'ls']::text[]),
('543', '라이베리아', 'Liberia', 'LR', true, true, ARRAY['라이베리아', 'liberia', '543', 'lr']::text[]),
('544', '리비아', 'Libya', 'LY', true, true, ARRAY['리비아', 'libya', '544', 'ly']::text[]),
('340', '리히텐슈타인', 'Liechtenstein', 'LI', true, true, ARRAY['리히텐슈타인', 'liechtenstein', '340', 'li']::text[]),
('342', '리투아니아', 'Lithuania', 'LT', true, true, ARRAY['리투아니아', 'lithuania', '342', 'lt']::text[]),
('341', '룩셈부르크', 'Luxembourg', 'LU', true, true, ARRAY['룩셈부르크', 'luxembourg', '341', 'lu']::text[]),
('343', '북마케도니아', 'North Macedonia', 'MK', true, true, ARRAY['북마케도니아', 'north macedonia', 'macedonia', '343', 'mk']::text[]),
('550', '마다가스카르', 'Madagascar', 'MG', true, true, ARRAY['마다가스카르', 'madagascar', '550', 'mg']::text[]),
('551', '말라위', 'Malawi', 'MW', true, true, ARRAY['말라위', 'malawi', '551', 'mw']::text[]),
('143', '말레이시아', 'Malaysia', 'MY', true, true, ARRAY['말레이시아', 'malaysia', '143', 'my']::text[]),
('144', '몰디브', 'Maldives', 'MV', true, true, ARRAY['몰디브', 'maldives', '144', 'mv']::text[]),
('552', '말리', 'Mali', 'ML', true, true, ARRAY['말리', 'mali', '552', 'ml']::text[]),
('344', '몰타', 'Malta', 'MT', true, true, ARRAY['몰타', 'malta', '344', 'mt']::text[]),
('437', '마샬군도', 'Marshall Islands', 'MH', true, true, ARRAY['마샬군도', 'marshall islands', '437', 'mh', '마셜제도']::text[]),
('553', '모리타니', 'Mauritania', 'MR', true, true, ARRAY['모리타니', 'mauritania', '553', 'mr']::text[]),
('554', '모리셔스', 'Mauritius', 'MU', true, true, ARRAY['모리셔스', 'mauritius', '554', 'mu']::text[]),
('248', '멕시코', 'Mexico', 'MX', true, true, ARRAY['멕시코', 'mexico', '248', 'mx']::text[]),
('435', '미이크로네시아', 'Micronesia', 'FM', true, true, ARRAY['미이크로네시아', 'micronesia', '435', 'fm', '미크로네시아']::text[]),
('346', '몰도바', 'Moldova', 'MD', true, true, ARRAY['몰도바', 'moldova', '346', 'md']::text[]),
('345', '모나코', 'Monaco', 'MC', true, true, ARRAY['모나코', 'monaco', '345', 'mc']::text[]),
('145', '몽골', 'Mongolia', 'MN', true, true, ARRAY['몽골', 'mongolia', '145', 'mn']::text[]),
('347', '몬테네그로', 'Montenegro', 'ME', true, true, ARRAY['몬테네그로', 'montenegro', '347', 'me']::text[]),
('555', '모로코', 'Morocco', 'MA', true, true, ARRAY['모로코', 'morocco', '555', 'ma']::text[]),
('556', '모잠비크', 'Mozambique', 'MZ', true, true, ARRAY['모잠비크', 'mozambique', '556', 'mz']::text[]),
('108', '미얀마', 'Myanmar', 'MM', true, true, ARRAY['미얀마', 'myanmar', '108', 'mm']::text[]),
('560', '나미비아', 'Namibia', 'NA', true, true, ARRAY['나미비아', 'namibia', '560', 'na']::text[]),
('441', '나우루', 'Nauru', 'NR', true, true, ARRAY['나우루', 'nauru', '441', 'nr']::text[]),
('148', '네팔', 'Nepal', 'NP', true, true, ARRAY['네팔', 'nepal', '148', 'np']::text[]),
('350', '네덜란드', 'Netherlands', 'NL', true, true, ARRAY['네덜란드', 'netherlands', '350', 'nl']::text[]),
('443', '뉴칼레도니아', 'New Caledonia', 'NC', true, true, ARRAY['뉴칼레도니아', 'new caledonia', '443', 'nc']::text[]),
('446', '뉴질랜드', 'New Zealand', 'NZ', true, true, ARRAY['뉴질랜드', 'new zealand', '446', 'nz']::text[]),
('252', '니카라과', 'Nicaragua', 'NI', true, true, ARRAY['니카라과', 'nicaragua', '252', 'ni']::text[]),
('561', '니제르', 'Niger', 'NE', true, true, ARRAY['니제르', 'niger', '561', 'ne']::text[]),
('562', '나이지리아', 'Nigeria', 'NG', true, true, ARRAY['나이지리아', 'nigeria', '562', 'ng']::text[]),
('447', '니우에', 'Niue', 'NU', true, true, ARRAY['니우에', 'niue', '447', 'nu']::text[]),
('352', '노르웨이', 'Norway', 'NO', true, true, ARRAY['노르웨이', 'norway', '352', 'no']::text[]),
('150', '오만', 'Oman', 'OM', true, true, ARRAY['오만', 'oman', '150', 'om']::text[]),
('153', '파키스탄', 'Pakistan', 'PK', true, true, ARRAY['파키스탄', 'pakistan', '153', 'pk']::text[]),
('451', '팔라우', 'Palau', 'PW', true, true, ARRAY['팔라우', 'palau', '451', 'pw']::text[]),
('154', '팔레스타인', 'Palestine', 'PS', true, true, ARRAY['팔레스타인', 'palestine', '154', 'ps']::text[]),
('255', '파나마', 'Panama', 'PA', true, true, ARRAY['파나마', 'panama', '255', 'pa']::text[]),
('452', '파푸아뉴기니', 'Papua New Guinea', 'PG', true, true, ARRAY['파푸아뉴기니', 'papua new guinea', '452', 'pg']::text[]),
('256', '파라과이', 'Paraguay', 'PY', true, true, ARRAY['파라과이', 'paraguay', '256', 'py']::text[]),
('257', '페루', 'Peru', 'PE', true, true, ARRAY['페루', 'peru', '257', 'pe']::text[]),
('155', '필리핀', 'Philippines', 'PH', true, true, ARRAY['필리핀', 'philippines', '155', 'ph']::text[]),
('360', '폴란드', 'Poland', 'PL', true, true, ARRAY['폴란드', 'poland', '360', 'pl']::text[]),
('361', '포르투갈', 'Portugal', 'PT', true, true, ARRAY['포르투갈', 'portugal', '361', 'pt']::text[]),
('258', '푸에르토리코', 'Puerto Rico', 'PR', true, true, ARRAY['푸에르토리코', 'puerto rico', '258', 'pr']::text[]),
('159', '카타르', 'Qatar', 'QA', true, true, ARRAY['카타르', 'qatar', '159', 'qa']::text[]),
('337', '코소보', 'Republic of Kosovo', 'XK', true, true, ARRAY['코소보', 'republic of kosovo', '337', 'xk']::text[]),
('367', '세르비아', 'Serbia', 'RS', true, true, ARRAY['세르비아', 'serbia', 'republic of serbia', '367', 'rs']::text[]),
('580', '남수단공화국', 'South Sudan', 'SS', true, true, ARRAY['남수단공화국', 'south sudan', 'republic of south sudan', '580', 'ss', '남수단']::text[]),
('516', '콩고', 'Republic of the Congo', 'CG', true, true, ARRAY['콩고', 'republic of the congo', '516', 'cg', '콩고공화국']::text[]),
('365', '루마니아', 'Romania', 'RO', true, true, ARRAY['루마니아', 'romania', '365', 'ro']::text[]),
('366', '러시아(연방)', 'Russia', 'RU', true, true, ARRAY['러시아(연방)', 'russia', '366', 'ru', '러시아']::text[]),
('566', '르완다', 'Rwanda', 'RW', true, true, ARRAY['르완다', 'rwanda', '566', 'rw']::text[]),
('461', '사모아', 'Samoa', 'WS', true, true, ARRAY['사모아', 'samoa', '461', 'ws']::text[]),
('371', '산마리노', 'San Marino', 'SM', true, true, ARRAY['산마리노', 'san marino', '371', 'sm']::text[]),
('571', '상투메프린시페', 'Sao Tome and Principe', 'ST', true, true, ARRAY['상투메프린시페', 'sao tome and principe', 'saotome-principe', '571', 'st', '상투메 프린시페']::text[]),
('162', '사우디아라비아', 'Saudi Arabia', 'SA', true, true, ARRAY['사우디아라비아', 'saudi arabia', '162', 'sa']::text[]),
('572', '세네갈', 'Senegal', 'SN', true, true, ARRAY['세네갈', 'senegal', '572', 'sn']::text[]),
('573', '세이셸', 'Seychelles', 'SC', true, true, ARRAY['세이셸', 'seychelles', '573', 'sc']::text[]),
('574', '시에라리온', 'Sierra Leone', 'SL', true, true, ARRAY['시에라리온', 'sierra leone', '574', 'sl']::text[]),
('164', '싱가포르', 'Singapore', 'SG', true, true, ARRAY['싱가포르', 'singapore', '164', 'sg']::text[]),
('368', '슬로바크', 'Slovakia', 'SK', true, true, ARRAY['슬로바크', 'slovakia', 'slovak', '368', 'sk', '슬로바키아']::text[]),
('370', '슬로베니아', 'Slovenia', 'SI', true, true, ARRAY['슬로베니아', 'slovenia', '370', 'si']::text[]),
('463', '솔로몬군도', 'Solomon Islands', 'SB', true, true, ARRAY['솔로몬군도', 'solomon islands', 'solomon is.', '463', 'sb', '솔로몬제도']::text[]),
('575', '소말리아', 'Somalia', 'SO', true, true, ARRAY['소말리아', 'somalia', '575', 'so']::text[]),
('576', '남아프리카공화국', 'South Africa', 'ZA', true, true, ARRAY['남아프리카공화국', 'south africa', '576', 'za']::text[]),
('372', '스페인', 'Spain', 'ES', true, true, ARRAY['스페인', 'spain', '372', 'es']::text[]),
('111', '스리랑카', 'Sri Lanka', 'LK', true, true, ARRAY['스리랑카', 'sri lanka', '111', 'lk']::text[]),
('262', '세인트크리스토퍼네비스', 'Saint Kitts and Nevis', 'KN', true, true, ARRAY['세인트크리스토퍼네비스', 'saint kitts and nevis', 'st. kitts-nevis', '262', 'kn', '세인트키츠 네비스']::text[]),
('263', '세인트루시아', 'Saint Lucia', 'LC', true, true, ARRAY['세인트루시아', 'saint lucia', 'st. lucia', '263', 'lc']::text[]),
('264', '세인트빈센트그레나딘', 'Saint Vincent and the Grenadines', 'VC', true, true, ARRAY['세인트빈센트그레나딘', 'saint vincent and the grenadines', 'st. vincent', '264', 'vc', '세인트빈센트 그레나딘']::text[]),
('578', '수단', 'Sudan', 'SD', true, true, ARRAY['수단', 'sudan', '578', 'sd']::text[]),
('265', '수리남', 'Suriname', 'SR', true, true, ARRAY['수리남', 'suriname', 'surinam', '265', 'sr']::text[]),
('375', '스발바르', 'Svalbard and Jan Mayen', 'SJ', true, true, ARRAY['스발바르', 'svalbard and jan mayen', 'svalbard and jan mayen i.', '375', 'sj']::text[]),
('373', '스웨덴', 'Sweden', 'SE', true, true, ARRAY['스웨덴', 'sweden', '373', 'se']::text[]),
('374', '스위스', 'Switzerland', 'CH', true, true, ARRAY['스위스', 'switzerland', '374', 'ch']::text[]),
('165', '시리아', 'Syria', 'SY', true, true, ARRAY['시리아', 'syria', '165', 'sy']::text[]),
('169', '타지키스탄', 'Tajikistan', 'TJ', true, true, ARRAY['타지키스탄', 'tajikistan', '169', 'tj']::text[]),
('583', '탄자니아', 'Tanzania', 'TZ', true, true, ARRAY['탄자니아', 'tanzania', '583', 'tz']::text[]),
('170', '타이', 'Thailand', 'TH', true, true, ARRAY['타이', 'thailand', '170', 'th', '태국']::text[]),
('584', '토고', 'Togo', 'TG', true, true, ARRAY['토고', 'togo', '584', 'tg']::text[]),
('473', '통가', 'Tonga', 'TO', true, true, ARRAY['통가', 'tonga', '473', 'to']::text[]),
('268', '트리니다드토바고', 'Trinidad and Tobago', 'TT', true, true, ARRAY['트리니다드토바고', 'trinidad and tobago', 'trinidad-tobago', '268', 'tt', '트리니다드 토바고']::text[]),
('585', '튀니지', 'Tunisia', 'TN', true, true, ARRAY['튀니지', 'tunisia', '585', 'tn']::text[]),
('171', '튀르키예', 'Türkiye', 'TR', true, true, ARRAY['튀르키예', 'türkiye', 'turkiye', '171', 'tr']::text[]),
('172', '투르크메니스탄', 'Turkmenistan', 'TM', true, true, ARRAY['투르크메니스탄', 'turkmenistan', '172', 'tm']::text[]),
('475', '투발루', 'Tuvalu', 'TV', true, true, ARRAY['투발루', 'tuvalu', '475', 'tv']::text[]),
('180', '아랍에미리트연합', 'United Arab Emirates', 'AE', true, true, ARRAY['아랍에미리트연합', 'united arab emirates', 'u.a.e', '180', 'ae', '아랍에미리트']::text[]),
('588', '우간다', 'Uganda', 'UG', true, true, ARRAY['우간다', 'uganda', '588', 'ug']::text[]),
('378', '우크라이나', 'Ukraine', 'UA', true, true, ARRAY['우크라이나', 'ukraine', '378', 'ua']::text[]),
('316', '영국', 'United Kingdom', 'GB', true, true, ARRAY['영국', 'united kingdom', '316', 'gb']::text[]),
('275', '미국', 'United States', 'US', true, true, ARRAY['미국', 'united states', '275', 'us']::text[]),
('274', '우루과이', 'Uruguay', 'UY', true, true, ARRAY['우루과이', 'uruguay', '274', 'uy']::text[]),
('181', '우즈베키스탄', 'Uzbekistan', 'UZ', true, true, ARRAY['우즈베키스탄', 'uzbekistan', '181', 'uz']::text[]),
('485', '바누아투', 'Vanuatu', 'VU', true, true, ARRAY['바누아투', 'vanuatu', '485', 'vu']::text[]),
('280', '베네수엘라', 'Venezuela', 'VE', true, true, ARRAY['베네수엘라', 'venezuela', '280', 've']::text[]),
('185', '베트남', 'Vietnam', 'VN', true, true, ARRAY['베트남', 'vietnam', '185', 'vn']::text[]),
('191', '예멘공화국', 'Yemen', 'YE', true, true, ARRAY['예멘공화국', 'yemen', '191', 'ye', '예멘']::text[]),
('595', '잠비아', 'Zambia', 'ZM', true, true, ARRAY['잠비아', 'zambia', '595', 'zm']::text[]),
('565', '짐바브웨', 'Zimbabwe', 'ZW', true, true, ARRAY['짐바브웨', 'zimbabwe', '565', 'zw']::text[]),
('100', '한국', 'Republic of Korea', 'KR', true, true, ARRAY['한국', 'republic of korea', '100', 'kr', '대한민국']::text[]),
('118', '북한', 'Democratic People''s Republic of Korea', 'KP', true, true, ARRAY['북한', 'democratic people''s republic of korea', '118', 'kp']::text[]),
('600', '무국적', 'Stateless', NULL, false, false, ARRAY['무국적', 'stateless', '600']::text[]),
('999', '국적불명', 'Unknown nationality', NULL, false, false, ARRAY['국적불명', 'unknown nationality', '999']::text[])
ON CONFLICT (code) DO UPDATE SET
  name_ko=EXCLUDED.name_ko, name_en=EXCLUDED.name_en, iso2=EXCLUDED.iso2,
  is_residence=EXCLUDED.is_residence, supports_dual=EXCLUDED.supports_dual,
  aliases=EXCLUDED.aliases;

ALTER TABLE public.pre_consultations
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS has_dual_nationality boolean,
  ADD COLUMN IF NOT EXISTS second_nationality text;

COMMENT ON COLUMN public.pre_consultations.country IS 'Current residence country; exact Ministry of Justice Korean name.';
COMMENT ON COLUMN public.pre_consultations.nationality IS 'Current nationality; exact Ministry of Justice Korean name. NULL means not collected.';
COMMENT ON COLUMN public.pre_consultations.has_dual_nationality IS 'Explicit dual-nationality answer. NULL means not collected on the legacy form.';
COMMENT ON COLUMN public.pre_consultations.second_nationality IS 'Second nationality when has_dual_nationality=true; exact Ministry of Justice Korean name.';

-- Only recognised old values are converted; missing/unknown legacy values stay intact.
UPDATE public.pre_consultations p SET country=c.name_ko
FROM public.moj_country_names c
WHERE lower(btrim(p.country))=ANY(c.aliases) AND p.country IS DISTINCT FROM c.name_ko;

CREATE OR REPLACE FUNCTION public.normalize_pre_consultation_countries()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,public AS $$
DECLARE
  matched public.moj_country_names%ROWTYPE;
  primary_dual boolean;
BEGIN
  IF TG_OP='INSERT' OR NEW.country IS DISTINCT FROM OLD.country OR NEW.in_korea IS DISTINCT FROM OLD.in_korea THEN
    IF NEW.in_korea THEN
      NEW.country=NULL;
    ELSIF NULLIF(btrim(NEW.country),'') IS NOT NULL THEN
      SELECT * INTO matched FROM public.moj_country_names
        WHERE lower(btrim(NEW.country))=ANY(aliases);
      IF NOT FOUND OR NOT matched.is_residence OR matched.code='100' THEN
        RAISE EXCEPTION 'Choose a valid country of residence abroad' USING ERRCODE='23514';
      END IF;
      NEW.country=matched.name_ko;
    ELSE
      NEW.country=NULL;
    END IF;
  END IF;

  IF NEW.nationality IS NOT NULL THEN
    SELECT * INTO matched FROM public.moj_country_names
      WHERE lower(btrim(NEW.nationality))=ANY(aliases);
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid nationality' USING ERRCODE='23514'; END IF;
    NEW.nationality=matched.name_ko;
    primary_dual=matched.supports_dual;

    IF NEW.has_dual_nationality IS NULL THEN
      RAISE EXCEPTION 'Dual nationality answer is required' USING ERRCODE='23514';
    END IF;
    IF NEW.has_dual_nationality THEN
      IF NOT primary_dual THEN
        RAISE EXCEPTION 'Selected nationality cannot have a second nationality' USING ERRCODE='23514';
      END IF;
      SELECT * INTO matched FROM public.moj_country_names
        WHERE lower(btrim(NEW.second_nationality))=ANY(aliases);
      IF NOT FOUND OR NOT matched.supports_dual OR matched.name_ko=NEW.nationality THEN
        RAISE EXCEPTION 'Choose a different second nationality' USING ERRCODE='23514';
      END IF;
      NEW.second_nationality=matched.name_ko;
    ELSIF NEW.second_nationality IS NOT NULL THEN
      RAISE EXCEPTION 'Second nationality requires dual nationality' USING ERRCODE='23514';
    END IF;
    IF NOT NEW.in_korea AND NEW.country IS NULL THEN
      RAISE EXCEPTION 'Country of residence is required abroad' USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS pre_consultations_normalize_countries ON public.pre_consultations;
CREATE TRIGGER pre_consultations_normalize_countries
BEFORE INSERT OR UPDATE OF in_korea,country,nationality,has_dual_nationality,second_nationality
ON public.pre_consultations FOR EACH ROW
EXECUTE FUNCTION public.normalize_pre_consultation_countries();

ALTER TABLE public.pre_consultations DROP CONSTRAINT IF EXISTS pre_consultations_nationality_pair;
ALTER TABLE public.pre_consultations ADD CONSTRAINT pre_consultations_nationality_pair CHECK (
  (nationality IS NULL AND has_dual_nationality IS NULL AND second_nationality IS NULL)
  OR (nationality IS NOT NULL AND has_dual_nationality IS FALSE AND second_nationality IS NULL)
  OR (nationality IS NOT NULL AND has_dual_nationality IS TRUE AND second_nationality IS NOT NULL AND nationality<>second_nationality)
);
ALTER TABLE public.pre_consultations DROP CONSTRAINT IF EXISTS pre_consultations_nationality_fk;
ALTER TABLE public.pre_consultations ADD CONSTRAINT pre_consultations_nationality_fk
  FOREIGN KEY (nationality) REFERENCES public.moj_country_names(name_ko);
ALTER TABLE public.pre_consultations DROP CONSTRAINT IF EXISTS pre_consultations_second_nationality_fk;
ALTER TABLE public.pre_consultations ADD CONSTRAINT pre_consultations_second_nationality_fk
  FOREIGN KEY (second_nationality) REFERENCES public.moj_country_names(name_ko);

NOTIFY pgrst, 'reload schema';
COMMIT;
