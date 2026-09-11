/* Ministry of Justice country names, verified 2026-09-11.
 * Canonical storage: exact Korean labels in HiKorea.
 * Source: https://www.hikorea.go.kr/info/CheckExprYmdByPassNoR.pt
 * Active choices: https://www.visa.go.kr/ (plus Korea, North Korea, stateless/unknown).
 * English labels expand abbreviations for applicants; officialEn preserves the source.
 * Historical countries, ethnicity codes and international organisations are not offered.
 */
(function (root, factory) {
    var api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.MojCountries = api;
})(typeof window === 'undefined' ? this : window, function () {
    'use strict';
    var countries = [
  {
    "code": "101",
    "iso2": "AF",
    "ko": "아프가니스탄",
    "en": "Afghanistan",
    "officialEn": "AFGHANISTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "301",
    "iso2": "AL",
    "ko": "알바니아",
    "en": "Albania",
    "officialEn": "ALBANIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "502",
    "iso2": "DZ",
    "ko": "알제리",
    "en": "Algeria",
    "officialEn": "ALGERIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "302",
    "iso2": "AD",
    "ko": "안도라",
    "en": "Andorra",
    "officialEn": "ANDORRA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "503",
    "iso2": "AO",
    "ko": "앙골라",
    "en": "Angola",
    "officialEn": "ANGOLA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "201",
    "iso2": "AG",
    "ko": "앤티카바부다",
    "en": "Antigua and Barbuda",
    "officialEn": "ANTIGUA-BARBUDA",
    "residence": true,
    "dual": true,
    "aliases": [
      "앤티가 바부다"
    ]
  },
  {
    "code": "202",
    "iso2": "AR",
    "ko": "아르헨티나",
    "en": "Argentina",
    "officialEn": "ARGENTINA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "304",
    "iso2": "AM",
    "ko": "아르메니아",
    "en": "Armenia",
    "officialEn": "ARMENIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "404",
    "iso2": "AU",
    "ko": "오스트레일리아",
    "en": "Australia",
    "officialEn": "AUSTRALIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "303",
    "iso2": "AT",
    "ko": "오스트리아",
    "en": "Austria",
    "officialEn": "AUSTRIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "305",
    "iso2": "AZ",
    "ko": "아제르바이잔",
    "en": "Azerbaijan",
    "officialEn": "AZERBAIJAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "205",
    "iso2": "BS",
    "ko": "바하마",
    "en": "Bahamas",
    "officialEn": "BAHAMAS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "104",
    "iso2": "BH",
    "ko": "바레인",
    "en": "Bahrain",
    "officialEn": "BAHRAIN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "105",
    "iso2": "BD",
    "ko": "방글라데시",
    "en": "Bangladesh",
    "officialEn": "BANGLADESH",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "206",
    "iso2": "BB",
    "ko": "바베이도스",
    "en": "Barbados",
    "officialEn": "BARBADOS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "308",
    "iso2": "BY",
    "ko": "벨라루스",
    "en": "Belarus",
    "officialEn": "BELARUS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "306",
    "iso2": "BE",
    "ko": "벨기에",
    "en": "Belgium",
    "officialEn": "BELGIUM",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "207",
    "iso2": "BZ",
    "ko": "벨리즈",
    "en": "Belize",
    "officialEn": "BELIZE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "520",
    "iso2": "BJ",
    "ko": "베냉",
    "en": "Benin",
    "officialEn": "BENIN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "210",
    "iso2": "BM",
    "ko": "버뮤다",
    "en": "Bermuda",
    "officialEn": "BERMUDA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "106",
    "iso2": "BT",
    "ko": "부탄",
    "en": "Bhutan",
    "officialEn": "BHUTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "208",
    "iso2": "BO",
    "ko": "볼리비아",
    "en": "Bolivia",
    "officialEn": "BOLIVIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "309",
    "iso2": "BA",
    "ko": "보스니아-헤르체고비나",
    "en": "Bosnia and Herzegovina",
    "officialEn": "BOSNIA-HERCEGOVINA",
    "residence": true,
    "dual": true,
    "aliases": [
      "보스니아 헤르체고비나"
    ]
  },
  {
    "code": "506",
    "iso2": "BW",
    "ko": "보츠와나",
    "en": "Botswana",
    "officialEn": "BOTSWANA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "209",
    "iso2": "BR",
    "ko": "브라질",
    "en": "Brazil",
    "officialEn": "BRAZIL",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "318",
    "iso2": null,
    "ko": "영국외지민",
    "en": "British National Overseas",
    "officialEn": "BRITISH NATIONAL OVERSEAS",
    "residence": false,
    "dual": true,
    "aliases": []
  },
  {
    "code": "319",
    "iso2": null,
    "ko": "영국외지시민",
    "en": "British Overseas Citizen",
    "officialEn": "BRITISH OVERSEAS CITIZEN",
    "residence": false,
    "dual": true,
    "aliases": []
  },
  {
    "code": "317",
    "iso2": null,
    "ko": "영국해외영토시민",
    "en": "British Overseas Territories Citizen",
    "officialEn": "BRITISH OVERSEAS TERRITORIES CITIZEN",
    "residence": false,
    "dual": true,
    "aliases": []
  },
  {
    "code": "314",
    "iso2": null,
    "ko": "영국보호민",
    "en": "British Protected Person",
    "officialEn": "BRITISH PROTECTED PERSON",
    "residence": false,
    "dual": true,
    "aliases": []
  },
  {
    "code": "315",
    "iso2": null,
    "ko": "영국속국민",
    "en": "British Subject",
    "officialEn": "BRITISH SUBJECT",
    "residence": false,
    "dual": true,
    "aliases": []
  },
  {
    "code": "107",
    "iso2": "BN",
    "ko": "브루나이",
    "en": "Brunei",
    "officialEn": "BRUNEI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "307",
    "iso2": "BG",
    "ko": "불가리아",
    "en": "Bulgaria",
    "officialEn": "BULGARIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "589",
    "iso2": "BF",
    "ko": "부르키나파소",
    "en": "Burkina Faso",
    "officialEn": "BURKINA FASO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "507",
    "iso2": "BI",
    "ko": "부룬디",
    "en": "Burundi",
    "officialEn": "BURUNDI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "110",
    "iso2": "KH",
    "ko": "캄보디아",
    "en": "Cambodia",
    "officialEn": "CAMBODIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "510",
    "iso2": "CM",
    "ko": "카메룬",
    "en": "Cameroon",
    "officialEn": "CAMEROON",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "213",
    "iso2": "CA",
    "ko": "캐나다",
    "en": "Canada",
    "officialEn": "CANADA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "511",
    "iso2": null,
    "ko": "카나리아군도",
    "en": "Canary Islands",
    "officialEn": "CANARY IS.",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "512",
    "iso2": "CV",
    "ko": "카보베르데",
    "en": "Cabo Verde",
    "officialEn": "CAPE VERDE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "513",
    "iso2": "CF",
    "ko": "중앙아프리카공화국",
    "en": "Central African Republic",
    "officialEn": "CENTRAL AFRICA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "514",
    "iso2": "TD",
    "ko": "차드",
    "en": "Chad",
    "officialEn": "CHAD",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "214",
    "iso2": "CL",
    "ko": "칠레",
    "en": "Chile",
    "officialEn": "CHILE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "112",
    "iso2": "CN",
    "ko": "중국",
    "en": "China",
    "officialEn": "CHINA P. R.",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "120",
    "iso2": "HK",
    "ko": "홍콩",
    "en": "Hong Kong",
    "officialEn": "CHINA P. R.(HONG KONG)",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "142",
    "iso2": "MO",
    "ko": "마카오",
    "en": "Macao",
    "officialEn": "CHINA P. R.(MACAO)",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "113",
    "iso2": "TW",
    "ko": "타이완",
    "en": "Taiwan",
    "officialEn": "CHINA(TAIWAN)",
    "residence": true,
    "dual": true,
    "aliases": [
      "대만"
    ]
  },
  {
    "code": "215",
    "iso2": "CO",
    "ko": "콜롬비아",
    "en": "Colombia",
    "officialEn": "COLOMBIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "515",
    "iso2": "KM",
    "ko": "코모로",
    "en": "Comoros",
    "officialEn": "COMOROS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "517",
    "iso2": "CD",
    "ko": "콩고민주공화국",
    "en": "Democratic Republic of the Congo",
    "officialEn": "CONGO D R",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "412",
    "iso2": "CK",
    "ko": "쿡아일랜드",
    "en": "Cook Islands",
    "officialEn": "COOK IS.",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "216",
    "iso2": "CR",
    "ko": "코스타리카",
    "en": "Costa Rica",
    "officialEn": "COSTA RICA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "537",
    "iso2": "CI",
    "ko": "코트디부아르",
    "en": "Côte d'Ivoire",
    "officialEn": "COTE D'IVOIRE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "391",
    "iso2": "HR",
    "ko": "크로아티아",
    "en": "Croatia",
    "officialEn": "CROATIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "217",
    "iso2": "CU",
    "ko": "쿠바",
    "en": "Cuba",
    "officialEn": "CUBA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "114",
    "iso2": "CY",
    "ko": "키프로스",
    "en": "Cyprus",
    "officialEn": "CYPRUS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "310",
    "iso2": "CZ",
    "ko": "체코",
    "en": "Czechia",
    "officialEn": "CZECH",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "313",
    "iso2": "DK",
    "ko": "덴마크",
    "en": "Denmark",
    "officialEn": "DENMARK",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "521",
    "iso2": "DJ",
    "ko": "지부티",
    "en": "Djibouti",
    "officialEn": "DJIBOUTI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "220",
    "iso2": "DM",
    "ko": "도미니카연방",
    "en": "Dominica",
    "officialEn": "DOMINICA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "221",
    "iso2": "DO",
    "ko": "도미니카공화국",
    "en": "Dominican Republic",
    "officialEn": "DOMINICAN REP.",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "156",
    "iso2": "TL",
    "ko": "티모르민주공화국",
    "en": "Timor-Leste",
    "officialEn": "EAST-TIMOR",
    "residence": true,
    "dual": true,
    "aliases": [
      "동티모르"
    ]
  },
  {
    "code": "224",
    "iso2": "EC",
    "ko": "에콰도르",
    "en": "Ecuador",
    "officialEn": "ECUADOR",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "525",
    "iso2": "EG",
    "ko": "이집트",
    "en": "Egypt",
    "officialEn": "EGYPT",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "225",
    "iso2": "SV",
    "ko": "엘살바도르",
    "en": "El Salvador",
    "officialEn": "EL SALVADOR",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "526",
    "iso2": "GQ",
    "ko": "적도기니",
    "en": "Equatorial Guinea",
    "officialEn": "EQUATOR-GUINEA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "528",
    "iso2": "ER",
    "ko": "에리트레아",
    "en": "Eritrea",
    "officialEn": "ERITREA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "312",
    "iso2": "EE",
    "ko": "에스토니아",
    "en": "Estonia",
    "officialEn": "ESTONIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "579",
    "iso2": "SZ",
    "ko": "에스와티니",
    "en": "Eswatini",
    "officialEn": "ESWATINI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "527",
    "iso2": "ET",
    "ko": "에티오피아",
    "en": "Ethiopia",
    "officialEn": "ETHIOPIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "418",
    "iso2": "FJ",
    "ko": "피지",
    "en": "Fiji",
    "officialEn": "FIJI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "320",
    "iso2": "FI",
    "ko": "핀란드",
    "en": "Finland",
    "officialEn": "FINLAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "321",
    "iso2": "FR",
    "ko": "프랑스",
    "en": "France",
    "officialEn": "FRANCE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "530",
    "iso2": "GA",
    "ko": "가봉",
    "en": "Gabon",
    "officialEn": "GABON",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "531",
    "iso2": "GM",
    "ko": "감비아",
    "en": "Gambia",
    "officialEn": "GAMBIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "323",
    "iso2": "GE",
    "ko": "조지아",
    "en": "Georgia",
    "officialEn": "GEORGIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "324",
    "iso2": "DE",
    "ko": "독일",
    "en": "Germany",
    "officialEn": "GERMANY F.R",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "532",
    "iso2": "GH",
    "ko": "가나",
    "en": "Ghana",
    "officialEn": "GHANA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "326",
    "iso2": "GR",
    "ko": "그리스",
    "en": "Greece",
    "officialEn": "GREECE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "328",
    "iso2": "GL",
    "ko": "그린란드",
    "en": "Greenland",
    "officialEn": "GREENLAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "229",
    "iso2": "GD",
    "ko": "그레나다",
    "en": "Grenada",
    "officialEn": "GRENADA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "423",
    "iso2": "GU",
    "ko": "괌",
    "en": "Guam",
    "officialEn": "GUAM",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "231",
    "iso2": "GT",
    "ko": "과테말라",
    "en": "Guatemala",
    "officialEn": "GUATEMALA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "533",
    "iso2": "GN",
    "ko": "기니",
    "en": "Guinea",
    "officialEn": "GUINEA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "534",
    "iso2": "GW",
    "ko": "기니비사우",
    "en": "Guinea-Bissau",
    "officialEn": "GUINEA BISSAU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "232",
    "iso2": "GY",
    "ko": "가이아나",
    "en": "Guyana",
    "officialEn": "GUYANA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "235",
    "iso2": "HT",
    "ko": "아이티",
    "en": "Haiti",
    "officialEn": "HAITI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "390",
    "iso2": "VA",
    "ko": "교황청",
    "en": "Holy See",
    "officialEn": "HOLY SEE",
    "residence": true,
    "dual": true,
    "aliases": [
      "바티칸"
    ]
  },
  {
    "code": "236",
    "iso2": "HN",
    "ko": "온두라스",
    "en": "Honduras",
    "officialEn": "HONDURAS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "121",
    "iso2": null,
    "ko": "홍콩거주난민",
    "en": "Hong Kong Document of Identity",
    "officialEn": "HONG KONG D.I.",
    "residence": false,
    "dual": false,
    "aliases": []
  },
  {
    "code": "329",
    "iso2": "HU",
    "ko": "헝가리",
    "en": "Hungary",
    "officialEn": "HUNGARY",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "333",
    "iso2": "IS",
    "ko": "아이슬란드",
    "en": "Iceland",
    "officialEn": "ICELAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "124",
    "iso2": "IN",
    "ko": "인도",
    "en": "India",
    "officialEn": "INDIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "125",
    "iso2": "ID",
    "ko": "인도네시아",
    "en": "Indonesia",
    "officialEn": "INDONESIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "126",
    "iso2": "IR",
    "ko": "이란",
    "en": "Iran",
    "officialEn": "IRAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "127",
    "iso2": "IQ",
    "ko": "이라크",
    "en": "Iraq",
    "officialEn": "IRAQ",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "334",
    "iso2": "IE",
    "ko": "아일랜드",
    "en": "Ireland",
    "officialEn": "IRELAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "128",
    "iso2": "IL",
    "ko": "이스라엘",
    "en": "Israel",
    "officialEn": "ISRAEL",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "335",
    "iso2": "IT",
    "ko": "이탈리아",
    "en": "Italy",
    "officialEn": "ITALY",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "240",
    "iso2": "JM",
    "ko": "자메이카",
    "en": "Jamaica",
    "officialEn": "JAMAICA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "130",
    "iso2": "JP",
    "ko": "일본",
    "en": "Japan",
    "officialEn": "JAPAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "131",
    "iso2": "JO",
    "ko": "요르단",
    "en": "Jordan",
    "officialEn": "JORDAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "133",
    "iso2": "KZ",
    "ko": "카자흐스탄",
    "en": "Kazakhstan",
    "officialEn": "KAZAKHSTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "540",
    "iso2": "KE",
    "ko": "케냐",
    "en": "Kenya",
    "officialEn": "KENYA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "429",
    "iso2": "KI",
    "ko": "키리바시",
    "en": "Kiribati",
    "officialEn": "KIRIBATI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "135",
    "iso2": "KW",
    "ko": "쿠웨이트",
    "en": "Kuwait",
    "officialEn": "KUWAIT",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "134",
    "iso2": "KG",
    "ko": "키르기즈",
    "en": "Kyrgyzstan",
    "officialEn": "KYRGYZ REPUBLIC",
    "residence": true,
    "dual": true,
    "aliases": [
      "키르기스스탄"
    ]
  },
  {
    "code": "138",
    "iso2": "LA",
    "ko": "라오스",
    "en": "Laos",
    "officialEn": "LAOS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "339",
    "iso2": "LV",
    "ko": "라트비아",
    "en": "Latvia",
    "officialEn": "LATVIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "139",
    "iso2": "LB",
    "ko": "레바논",
    "en": "Lebanon",
    "officialEn": "LEBANON",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "542",
    "iso2": "LS",
    "ko": "레소토",
    "en": "Lesotho",
    "officialEn": "LESOTHO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "543",
    "iso2": "LR",
    "ko": "라이베리아",
    "en": "Liberia",
    "officialEn": "LIBERIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "544",
    "iso2": "LY",
    "ko": "리비아",
    "en": "Libya",
    "officialEn": "LIBYA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "340",
    "iso2": "LI",
    "ko": "리히텐슈타인",
    "en": "Liechtenstein",
    "officialEn": "LIECHTENSTEIN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "342",
    "iso2": "LT",
    "ko": "리투아니아",
    "en": "Lithuania",
    "officialEn": "LITHUANIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "341",
    "iso2": "LU",
    "ko": "룩셈부르크",
    "en": "Luxembourg",
    "officialEn": "LUXEMBOURG",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "343",
    "iso2": "MK",
    "ko": "북마케도니아",
    "en": "North Macedonia",
    "officialEn": "MACEDONIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "550",
    "iso2": "MG",
    "ko": "마다가스카르",
    "en": "Madagascar",
    "officialEn": "MADAGASCAR",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "551",
    "iso2": "MW",
    "ko": "말라위",
    "en": "Malawi",
    "officialEn": "MALAWI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "143",
    "iso2": "MY",
    "ko": "말레이시아",
    "en": "Malaysia",
    "officialEn": "MALAYSIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "144",
    "iso2": "MV",
    "ko": "몰디브",
    "en": "Maldives",
    "officialEn": "MALDIVES",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "552",
    "iso2": "ML",
    "ko": "말리",
    "en": "Mali",
    "officialEn": "MALI",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "344",
    "iso2": "MT",
    "ko": "몰타",
    "en": "Malta",
    "officialEn": "MALTA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "437",
    "iso2": "MH",
    "ko": "마샬군도",
    "en": "Marshall Islands",
    "officialEn": "MARSHALL ISLANDS",
    "residence": true,
    "dual": true,
    "aliases": [
      "마셜제도"
    ]
  },
  {
    "code": "553",
    "iso2": "MR",
    "ko": "모리타니",
    "en": "Mauritania",
    "officialEn": "MAURITANIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "554",
    "iso2": "MU",
    "ko": "모리셔스",
    "en": "Mauritius",
    "officialEn": "MAURITIUS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "248",
    "iso2": "MX",
    "ko": "멕시코",
    "en": "Mexico",
    "officialEn": "MEXICO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "435",
    "iso2": "FM",
    "ko": "미이크로네시아",
    "en": "Micronesia",
    "officialEn": "MICRONESIA",
    "residence": true,
    "dual": true,
    "aliases": [
      "미크로네시아"
    ]
  },
  {
    "code": "346",
    "iso2": "MD",
    "ko": "몰도바",
    "en": "Moldova",
    "officialEn": "MOLDOVA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "345",
    "iso2": "MC",
    "ko": "모나코",
    "en": "Monaco",
    "officialEn": "MONACO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "145",
    "iso2": "MN",
    "ko": "몽골",
    "en": "Mongolia",
    "officialEn": "MONGOLIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "347",
    "iso2": "ME",
    "ko": "몬테네그로",
    "en": "Montenegro",
    "officialEn": "MONTENEGRO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "555",
    "iso2": "MA",
    "ko": "모로코",
    "en": "Morocco",
    "officialEn": "MOROCCO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "556",
    "iso2": "MZ",
    "ko": "모잠비크",
    "en": "Mozambique",
    "officialEn": "MOZAMBIQUE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "108",
    "iso2": "MM",
    "ko": "미얀마",
    "en": "Myanmar",
    "officialEn": "MYANMAR",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "560",
    "iso2": "NA",
    "ko": "나미비아",
    "en": "Namibia",
    "officialEn": "NAMIBIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "441",
    "iso2": "NR",
    "ko": "나우루",
    "en": "Nauru",
    "officialEn": "NAURU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "148",
    "iso2": "NP",
    "ko": "네팔",
    "en": "Nepal",
    "officialEn": "NEPAL",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "350",
    "iso2": "NL",
    "ko": "네덜란드",
    "en": "Netherlands",
    "officialEn": "NETHERLANDS",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "443",
    "iso2": "NC",
    "ko": "뉴칼레도니아",
    "en": "New Caledonia",
    "officialEn": "NEW CALEDONIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "446",
    "iso2": "NZ",
    "ko": "뉴질랜드",
    "en": "New Zealand",
    "officialEn": "NEW ZEALAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "252",
    "iso2": "NI",
    "ko": "니카라과",
    "en": "Nicaragua",
    "officialEn": "NICARAGUA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "561",
    "iso2": "NE",
    "ko": "니제르",
    "en": "Niger",
    "officialEn": "NIGER",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "562",
    "iso2": "NG",
    "ko": "나이지리아",
    "en": "Nigeria",
    "officialEn": "NIGERIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "447",
    "iso2": "NU",
    "ko": "니우에",
    "en": "Niue",
    "officialEn": "NIUE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "352",
    "iso2": "NO",
    "ko": "노르웨이",
    "en": "Norway",
    "officialEn": "NORWAY",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "150",
    "iso2": "OM",
    "ko": "오만",
    "en": "Oman",
    "officialEn": "OMAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "153",
    "iso2": "PK",
    "ko": "파키스탄",
    "en": "Pakistan",
    "officialEn": "PAKISTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "451",
    "iso2": "PW",
    "ko": "팔라우",
    "en": "Palau",
    "officialEn": "PALAU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "154",
    "iso2": "PS",
    "ko": "팔레스타인",
    "en": "Palestine",
    "officialEn": "PALESTINE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "255",
    "iso2": "PA",
    "ko": "파나마",
    "en": "Panama",
    "officialEn": "PANAMA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "452",
    "iso2": "PG",
    "ko": "파푸아뉴기니",
    "en": "Papua New Guinea",
    "officialEn": "PAPUA NEW GUINEA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "256",
    "iso2": "PY",
    "ko": "파라과이",
    "en": "Paraguay",
    "officialEn": "PARAGUAY",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "257",
    "iso2": "PE",
    "ko": "페루",
    "en": "Peru",
    "officialEn": "PERU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "155",
    "iso2": "PH",
    "ko": "필리핀",
    "en": "Philippines",
    "officialEn": "PHILIPPINES",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "360",
    "iso2": "PL",
    "ko": "폴란드",
    "en": "Poland",
    "officialEn": "POLAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "361",
    "iso2": "PT",
    "ko": "포르투갈",
    "en": "Portugal",
    "officialEn": "PORTUGAL",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "258",
    "iso2": "PR",
    "ko": "푸에르토리코",
    "en": "Puerto Rico",
    "officialEn": "PUERTO RICO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "159",
    "iso2": "QA",
    "ko": "카타르",
    "en": "Qatar",
    "officialEn": "QATAR",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "337",
    "iso2": "XK",
    "ko": "코소보",
    "en": "Republic of Kosovo",
    "officialEn": "REPUBLIC OF KOSOVO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "367",
    "iso2": "RS",
    "ko": "세르비아",
    "en": "Serbia",
    "officialEn": "REPUBLIC OF SERBIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "580",
    "iso2": "SS",
    "ko": "남수단공화국",
    "en": "South Sudan",
    "officialEn": "REPUBLIC OF SOUTH SUDAN",
    "residence": true,
    "dual": true,
    "aliases": [
      "남수단"
    ]
  },
  {
    "code": "516",
    "iso2": "CG",
    "ko": "콩고",
    "en": "Republic of the Congo",
    "officialEn": "REPUBLIC OF THE CONGO",
    "residence": true,
    "dual": true,
    "aliases": [
      "콩고공화국"
    ]
  },
  {
    "code": "365",
    "iso2": "RO",
    "ko": "루마니아",
    "en": "Romania",
    "officialEn": "ROMANIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "366",
    "iso2": "RU",
    "ko": "러시아(연방)",
    "en": "Russia",
    "officialEn": "RUSSIA",
    "residence": true,
    "dual": true,
    "aliases": [
      "러시아"
    ]
  },
  {
    "code": "566",
    "iso2": "RW",
    "ko": "르완다",
    "en": "Rwanda",
    "officialEn": "RWANDA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "461",
    "iso2": "WS",
    "ko": "사모아",
    "en": "Samoa",
    "officialEn": "SAMOA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "371",
    "iso2": "SM",
    "ko": "산마리노",
    "en": "San Marino",
    "officialEn": "SAN MARINO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "571",
    "iso2": "ST",
    "ko": "상투메프린시페",
    "en": "Sao Tome and Principe",
    "officialEn": "SAOTOME-PRINCIPE",
    "residence": true,
    "dual": true,
    "aliases": [
      "상투메 프린시페"
    ]
  },
  {
    "code": "162",
    "iso2": "SA",
    "ko": "사우디아라비아",
    "en": "Saudi Arabia",
    "officialEn": "SAUDI ARABIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "572",
    "iso2": "SN",
    "ko": "세네갈",
    "en": "Senegal",
    "officialEn": "SENEGAL",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "573",
    "iso2": "SC",
    "ko": "세이셸",
    "en": "Seychelles",
    "officialEn": "SEYCHELLES",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "574",
    "iso2": "SL",
    "ko": "시에라리온",
    "en": "Sierra Leone",
    "officialEn": "SIERRA LEONE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "164",
    "iso2": "SG",
    "ko": "싱가포르",
    "en": "Singapore",
    "officialEn": "SINGAPORE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "368",
    "iso2": "SK",
    "ko": "슬로바크",
    "en": "Slovakia",
    "officialEn": "SLOVAK",
    "residence": true,
    "dual": true,
    "aliases": [
      "슬로바키아"
    ]
  },
  {
    "code": "370",
    "iso2": "SI",
    "ko": "슬로베니아",
    "en": "Slovenia",
    "officialEn": "SLOVENIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "463",
    "iso2": "SB",
    "ko": "솔로몬군도",
    "en": "Solomon Islands",
    "officialEn": "SOLOMON IS.",
    "residence": true,
    "dual": true,
    "aliases": [
      "솔로몬제도"
    ]
  },
  {
    "code": "575",
    "iso2": "SO",
    "ko": "소말리아",
    "en": "Somalia",
    "officialEn": "SOMALIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "576",
    "iso2": "ZA",
    "ko": "남아프리카공화국",
    "en": "South Africa",
    "officialEn": "SOUTH AFRICA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "372",
    "iso2": "ES",
    "ko": "스페인",
    "en": "Spain",
    "officialEn": "SPAIN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "111",
    "iso2": "LK",
    "ko": "스리랑카",
    "en": "Sri Lanka",
    "officialEn": "SRI LANKA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "262",
    "iso2": "KN",
    "ko": "세인트크리스토퍼네비스",
    "en": "Saint Kitts and Nevis",
    "officialEn": "ST. KITTS-NEVIS",
    "residence": true,
    "dual": true,
    "aliases": [
      "세인트키츠 네비스"
    ]
  },
  {
    "code": "263",
    "iso2": "LC",
    "ko": "세인트루시아",
    "en": "Saint Lucia",
    "officialEn": "ST. LUCIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "264",
    "iso2": "VC",
    "ko": "세인트빈센트그레나딘",
    "en": "Saint Vincent and the Grenadines",
    "officialEn": "ST. VINCENT",
    "residence": true,
    "dual": true,
    "aliases": [
      "세인트빈센트 그레나딘"
    ]
  },
  {
    "code": "578",
    "iso2": "SD",
    "ko": "수단",
    "en": "Sudan",
    "officialEn": "SUDAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "265",
    "iso2": "SR",
    "ko": "수리남",
    "en": "Suriname",
    "officialEn": "SURINAM",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "375",
    "iso2": "SJ",
    "ko": "스발바르",
    "en": "Svalbard and Jan Mayen",
    "officialEn": "SVALBARD AND JAN MAYEN I.",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "373",
    "iso2": "SE",
    "ko": "스웨덴",
    "en": "Sweden",
    "officialEn": "SWEDEN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "374",
    "iso2": "CH",
    "ko": "스위스",
    "en": "Switzerland",
    "officialEn": "SWITZERLAND",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "165",
    "iso2": "SY",
    "ko": "시리아",
    "en": "Syria",
    "officialEn": "SYRIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "169",
    "iso2": "TJ",
    "ko": "타지키스탄",
    "en": "Tajikistan",
    "officialEn": "TAJIKISTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "583",
    "iso2": "TZ",
    "ko": "탄자니아",
    "en": "Tanzania",
    "officialEn": "TANZANIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "170",
    "iso2": "TH",
    "ko": "타이",
    "en": "Thailand",
    "officialEn": "THAILAND",
    "residence": true,
    "dual": true,
    "aliases": [
      "태국"
    ]
  },
  {
    "code": "584",
    "iso2": "TG",
    "ko": "토고",
    "en": "Togo",
    "officialEn": "TOGO",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "473",
    "iso2": "TO",
    "ko": "통가",
    "en": "Tonga",
    "officialEn": "TONGA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "268",
    "iso2": "TT",
    "ko": "트리니다드토바고",
    "en": "Trinidad and Tobago",
    "officialEn": "TRINIDAD-TOBAGO",
    "residence": true,
    "dual": true,
    "aliases": [
      "트리니다드 토바고"
    ]
  },
  {
    "code": "585",
    "iso2": "TN",
    "ko": "튀니지",
    "en": "Tunisia",
    "officialEn": "TUNISIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "171",
    "iso2": "TR",
    "ko": "튀르키예",
    "en": "Türkiye",
    "officialEn": "TURKIYE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "172",
    "iso2": "TM",
    "ko": "투르크메니스탄",
    "en": "Turkmenistan",
    "officialEn": "TURKMENISTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "475",
    "iso2": "TV",
    "ko": "투발루",
    "en": "Tuvalu",
    "officialEn": "TUVALU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "180",
    "iso2": "AE",
    "ko": "아랍에미리트연합",
    "en": "United Arab Emirates",
    "officialEn": "U.A.E",
    "residence": true,
    "dual": true,
    "aliases": [
      "아랍에미리트"
    ]
  },
  {
    "code": "588",
    "iso2": "UG",
    "ko": "우간다",
    "en": "Uganda",
    "officialEn": "UGANDA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "378",
    "iso2": "UA",
    "ko": "우크라이나",
    "en": "Ukraine",
    "officialEn": "UKRAINE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "316",
    "iso2": "GB",
    "ko": "영국",
    "en": "United Kingdom",
    "officialEn": "UNITED KINGDOM",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "275",
    "iso2": "US",
    "ko": "미국",
    "en": "United States",
    "officialEn": "UNITED STATES",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "274",
    "iso2": "UY",
    "ko": "우루과이",
    "en": "Uruguay",
    "officialEn": "URUGUAY",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "181",
    "iso2": "UZ",
    "ko": "우즈베키스탄",
    "en": "Uzbekistan",
    "officialEn": "UZBEKISTAN",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "485",
    "iso2": "VU",
    "ko": "바누아투",
    "en": "Vanuatu",
    "officialEn": "VANUATU",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "280",
    "iso2": "VE",
    "ko": "베네수엘라",
    "en": "Venezuela",
    "officialEn": "VENEZUELA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "185",
    "iso2": "VN",
    "ko": "베트남",
    "en": "Vietnam",
    "officialEn": "VIETNAM",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "191",
    "iso2": "YE",
    "ko": "예멘공화국",
    "en": "Yemen",
    "officialEn": "YEMEN",
    "residence": true,
    "dual": true,
    "aliases": [
      "예멘"
    ]
  },
  {
    "code": "595",
    "iso2": "ZM",
    "ko": "잠비아",
    "en": "Zambia",
    "officialEn": "ZAMBIA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "565",
    "iso2": "ZW",
    "ko": "짐바브웨",
    "en": "Zimbabwe",
    "officialEn": "ZIMBABWE",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "100",
    "iso2": "KR",
    "ko": "한국",
    "en": "Republic of Korea",
    "officialEn": "REPUBLIC OF KOREA",
    "residence": true,
    "dual": true,
    "aliases": [
      "대한민국"
    ]
  },
  {
    "code": "118",
    "iso2": "KP",
    "ko": "북한",
    "en": "Democratic People's Republic of Korea",
    "officialEn": "DEMOCRATIC PEOPLE'S REPUBLIC OF KOREA",
    "residence": true,
    "dual": true,
    "aliases": []
  },
  {
    "code": "600",
    "iso2": null,
    "ko": "무국적",
    "en": "Stateless",
    "officialEn": "STATELESS",
    "residence": false,
    "dual": false,
    "aliases": []
  },
  {
    "code": "999",
    "iso2": null,
    "ko": "국적불명",
    "en": "Unknown nationality",
    "officialEn": "UNKNOWN NATIONALITY",
    "residence": false,
    "dual": false,
    "aliases": []
  }
];
    function find(value) {
        var key = String(value || '').trim().toLocaleLowerCase();
        if (!key) return null;
        return countries.find(function (c) {
            return [c.ko, c.en, c.officialEn, c.code, c.iso2].concat(c.aliases).some(function (v) {
                return v && v.toLocaleLowerCase() === key;
            });
        }) || null;
    }
    function normalize(value) { var c = find(value); return c ? c.ko : ''; }
    function escape(value) {
        return String(value).replace(/[&<>"']/g, function (c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }
    function options(lang, kind, excluded) {
        var isKo = lang === 'ko';
        return countries.filter(function (c) {
            return c.ko !== excluded && (kind !== 'residence' || (c.residence && c.iso2 !== 'KR')) &&
                (kind !== 'second' || c.dual);
        }).sort(function (a,b) { return (isKo ? a.ko : a.en).localeCompare(isKo ? b.ko : b.en, isKo ? 'ko' : 'en'); })
          .map(function (c) { return '<option value="' + escape(c.ko) + '">' + escape(isKo ? c.ko : c.en) + '</option>'; }).join('');
    }
    function validate(d) {
        var nationality = find(d.nationality), second = find(d.second_nationality), country = find(d.country);
        if (typeof d.in_korea !== 'boolean') throw new Error('Choose whether you are in Korea.');
        if (!nationality) throw new Error('Choose your current nationality.');
        if (typeof d.has_dual_nationality !== 'boolean') throw new Error('Choose whether you hold dual nationality.');
        if (d.has_dual_nationality && (!nationality.dual || !second || !second.dual || nationality.ko === second.ko)) {
            throw new Error('Choose a different second nationality.');
        }
        if (!d.in_korea && (!country || !country.residence || country.iso2 === 'KR')) {
            throw new Error('Choose your current country of residence abroad.');
        }
        return {
            country: d.in_korea ? null : country.ko,
            nationality: nationality.ko,
            has_dual_nationality: d.has_dual_nationality,
            second_nationality: d.has_dual_nationality ? second.ko : null
        };
    }
    return {countries:countries, find:find, normalize:normalize, options:options, validate:validate};
});
