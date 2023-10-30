/**
 * 利用GM_xmlhttpRequest请求json数据
 * @param url 要请求的地址
 * @param method 请求方法，例如:'post'或者'get',默认是'get'，
 * @returns JSON格式的回复数据
 */
export function request(url:string,data:any=null,method:string = 'get',contentType='application/json;charset=UTF-8') {
  return new Promise( (resolve, reject) => {
    //@ts-ignore
    GM_xmlhttpRequest({
      url:url,
      method :method,
      headers: {
        "Content-type": contentType
      },
      //responseType:'json',
      data:data,
      onload:function(xhr:any){
        resolve( JSON.parse(xhr.responseText) );
      },
      onerror: function(error:any) {
        reject(error);
      }
    });
  })
}

/**
   * 把时间戳转换成yyyy/MM/dd HH:mm:ss
   * @param {number} timestamp 时间戳
   */
export function formatTime(timestamp:number) {
  let t = new Date(timestamp);
  return t.toLocaleString();
}


/**
 * 获取cookie
 * 这方法是从微软MSDN里抄的。
 * 网址：https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie
 */
export function getCookie(sKey:string) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  }

/**
 * 格式化电话号码用，这是专门给导出客户信息用的
 * @param phoneNumbers 
 */
export function formatPhoneNumber( phoneNumbers:any ) {
  if( Array.isArray(phoneNumbers) && phoneNumbers.length>0 ){
    let p = phoneNumbers[0];
    let result = '';
    // 把国家、区号、号码，合并，因为【国家】【区码】不一定有，所有做如下处理
    result = p.number;
    result = p.areaCode    ? p.areaCode+'-'+result    : result;
    result = p.countryCode ? p.countryCode+'-'+result : result;

    return result;
  }
  return '--';
}

/**
 * 格式化手机电话号码用，这是专门给导出客户信息用的
 * @param {Array} mobiles 
 */
export function formatMobiles( mobiles:any ) {
  if( Array.isArray(mobiles) && mobiles.length > 0 ) {
    let area = mobiles[0].mobileCountryCode || '';
    let num  = mobiles[0].mobilePhoneNum || '';
    return area + ' ' + num;
  }
  return '--';
}

  /**
   * 通过国家简写，获取完整名字。
   * 具体数据来源：
   * https://accounts.alibaba.com/register/country.htm?isContainCN=true&_tb_token_=7eb573073b556&__t__=1685116158569&callback=jsonp_1685116158569_66104&_=1685116158569
   * @param key 国家简写
   */
export function getcountryFullName( key:any ){
  return cMap.get(key);
}

const cMap = new Map();

  cMap.set("AF", "Afghanistan");
  cMap.set("ALA", "Aland Islands");
  cMap.set("AL", "Albania");
  cMap.set("GBA", "Alderney");
  cMap.set("DZ", "Algeria");
  cMap.set("AS", "American Samoa");
  cMap.set("AD", "Andorra");
  cMap.set("AO", "Angola");
  cMap.set("AI", "Anguilla");
  cMap.set("AQ", "Antarctica");
  cMap.set("AG", "Antigua and Barbuda");
  cMap.set("AR", "Argentina");
  cMap.set("AM", "Armenia");
  cMap.set("AW", "Aruba");
  cMap.set("ASC", "Ascension Island");
  cMap.set("AU", "Australia");
  cMap.set("AT", "Austria");
  cMap.set("AZ", "Azerbaijan");
  cMap.set("BS", "Bahamas");
  cMap.set("BH", "Bahrain");
  cMap.set("BD", "Bangladesh");
  cMap.set("BB", "Barbados");
  cMap.set("BY", "Belarus");
  cMap.set("BE", "Belgium");
  cMap.set("BZ", "Belize");
  cMap.set("BJ", "Benin");
  cMap.set("BM", "Bermuda");
  cMap.set("BT", "Bhutan");
  cMap.set("BO", "Bolivia");
  cMap.set("BA", "Bosnia and Herzegovina");
  cMap.set("BW", "Botswana");
  cMap.set("BV", "Bouvet Island");
  cMap.set("BR", "Brazil");
  cMap.set("IO", "British Indian Ocean Territory");
  cMap.set("BN", "Brunei Darussalam");
  cMap.set("BG", "Bulgaria");
  cMap.set("BF", "Burkina Faso");
  cMap.set("BI", "Burundi");
  cMap.set("KH", "Cambodia");
  cMap.set("CM", "Cameroon");
  cMap.set("CA", "Canada");
  cMap.set("CV", "Cape Verde");
  cMap.set("KY", "Cayman Islands");
  cMap.set("CF", "Central African Republic");
  cMap.set("TD", "Chad");
  cMap.set("CL", "Chile");
  cMap.set("CN", "China");
  cMap.set("CX", "Christmas Island");
  cMap.set("CC", "Cocos (Keeling) Islands");
  cMap.set("CO", "Colombia");
  cMap.set("KM", "Comoros");
  cMap.set("ZR", "Congo The Democratic Republic Of The");
  cMap.set("CG", "Congo The Republic of Congo");
  cMap.set("CK", "Cook Islands");
  cMap.set("CR", "Costa Rica");
  cMap.set("CI", "Cote D'Ivoire");
  cMap.set("HR", "Croatia (local name, Hrvatska)");
  cMap.set("CU", "Cuba");
  cMap.set("CW", "Curacao");
  cMap.set("CY", "Cyprus");
  cMap.set("CZ", "Czech Republic");
  cMap.set("DK", "Denmark");
  cMap.set("DJ", "Djibouti");
  cMap.set("DM", "Dominica");
  cMap.set("DO", "Dominican Republic");
  cMap.set("TP", "East Timor");
  cMap.set("EC", "Ecuador");
  cMap.set("EG", "Egypt");
  cMap.set("SV", "El Salvador");
  cMap.set("GQ", "Equatorial Guinea");
  cMap.set("ER", "Eritrea");
  cMap.set("EE", "Estonia");
  cMap.set("ET", "Ethiopia");
  cMap.set("FK", "Falkland Islands (Malvinas)");
  cMap.set("FO", "Faroe Islands");
  cMap.set("FJ", "Fiji");
  cMap.set("FI", "Finland");
  cMap.set("FR", "France");
  cMap.set("FX", "France Metropolitan");
  cMap.set("GF", "French Guiana");
  cMap.set("PF", "French Polynesia");
  cMap.set("TF", "French Southern Territories");
  cMap.set("GA", "Gabon");
  cMap.set("GM", "Gambia");
  cMap.set("GE", "Georgia");
  cMap.set("DE", "Germany");
  cMap.set("GH", "Ghana");
  cMap.set("GI", "Gibraltar");
  cMap.set("GR", "Greece");
  cMap.set("GL", "Greenland");
  cMap.set("GD", "Grenada");
  cMap.set("GP", "Guadeloupe");
  cMap.set("GU", "Guam");
  cMap.set("GT", "Guatemala");
  cMap.set("GGY", "Guernsey");
  cMap.set("GN", "Guinea");
  cMap.set("GW", "Guinea-Bissau");
  cMap.set("GY", "Guyana");
  cMap.set("HT", "Haiti");
  cMap.set("HM", "Heard and Mc Donald Islands");
  cMap.set("HN", "Honduras");
  cMap.set("HK", "Hong Kong S.A.R.");
  cMap.set("HU", "Hungary");
  cMap.set("IS", "Iceland");
  cMap.set("IN", "India");
  cMap.set("ID", "Indonesia");
  cMap.set("IR", "Iran (Islamic Republic of)");
  cMap.set("IQ", "Iraq");
  cMap.set("IE", "Ireland");
  cMap.set("IM", "Isle of Man");
  cMap.set("IL", "Israel");
  cMap.set("IT", "Italy");
  cMap.set("JM", "Jamaica");
  cMap.set("JP", "Japan");
  cMap.set("JEY", "Jersey");
  cMap.set("JO", "Jordan");
  cMap.set("KZ", "Kazakhstan");
  cMap.set("KE", "Kenya");
  cMap.set("KI", "Kiribati");
  cMap.set("KS", "Kosovo");
  cMap.set("KW", "Kuwait");
  cMap.set("KG", "Kyrgyzstan");
  cMap.set("LA", "Lao People's Democratic Republic");
  cMap.set("LV", "Latvia");
  cMap.set("LB", "Lebanon");
  cMap.set("LS", "Lesotho");
  cMap.set("LR", "Liberia");
  cMap.set("LY", "Libya");
  cMap.set("LI", "Liechtenstein");
  cMap.set("LT", "Lithuania");
  cMap.set("LU", "Luxembourg");
  cMap.set("MO", "Macao S.A.R.");
  cMap.set("MK", "Macedonia");
  cMap.set("MG", "Madagascar");
  cMap.set("MW", "Malawi");
  cMap.set("MY", "Malaysia");
  cMap.set("MV", "Maldives");
  cMap.set("ML", "Mali");
  cMap.set("MT", "Malta");
  cMap.set("MH", "Marshall Islands");
  cMap.set("MQ", "Martinique");
  cMap.set("MR", "Mauritania");
  cMap.set("MU", "Mauritius");
  cMap.set("YT", "Mayotte");
  cMap.set("MX", "Mexico");
  cMap.set("FM", "Micronesia");
  cMap.set("MD", "Moldova");
  cMap.set("MC", "Monaco");
  cMap.set("MN", "Mongolia");
  cMap.set("MNE", "Montenegro");
  cMap.set("MS", "Montserrat");
  cMap.set("MA", "Morocco");
  cMap.set("MZ", "Mozambique");
  cMap.set("MM", "Myanmar");
  cMap.set("NA", "Namibia");
  cMap.set("NR", "Nauru");
  cMap.set("NP", "Nepal");
  cMap.set("NL", "Netherlands");
  cMap.set("AN", "Netherlands Antilles");
  cMap.set("NC", "New Caledonia");
  cMap.set("NZ", "New Zealand");
  cMap.set("NI", "Nicaragua");
  cMap.set("NE", "Niger");
  cMap.set("NG", "Nigeria");
  cMap.set("NU", "Niue");
  cMap.set("NF", "Norfolk Island");
  cMap.set("KP", "North Korea");
  cMap.set("MP", "Northern Mariana Islands");
  cMap.set("NO", "Norway");
  cMap.set("OM", "Oman");
  cMap.set("Other", "Other Country");
  cMap.set("PK", "Pakistan");
  cMap.set("PW", "Palau");
  cMap.set("PS", "Palestine");
  cMap.set("PA", "Panama");
  cMap.set("PG", "Papua New Guinea");
  cMap.set("PY", "Paraguay");
  cMap.set("PE", "Peru");
  cMap.set("PH", "Philippines");
  cMap.set("PN", "Pitcairn");
  cMap.set("PL", "Poland");
  cMap.set("PT", "Portugal");
  cMap.set("QA", "Qatar");
  cMap.set("RE", "Reunion");
  cMap.set("RO", "Romania");
  cMap.set("RU", "Russian Federation");
  cMap.set("RW", "Rwanda");
  cMap.set("BLM", "Saint Barthelemy");
  cMap.set("KN", "Saint Kitts and Nevis");
  cMap.set("LC", "Saint Lucia");
  cMap.set("MAF", "Saint Martin");
  cMap.set("VC", "Saint Vincent and the Grenadines");
  cMap.set("WS", "Samoa");
  cMap.set("SM", "San Marino");
  cMap.set("ST", "Sao Tome and Principe");
  cMap.set("SA", "Saudi Arabia");
  cMap.set("SCT", "Scotland");
  cMap.set("SN", "Senegal");
  cMap.set("SRB", "Serbia");
  cMap.set("SC", "Seychelles");
  cMap.set("SL", "Sierra Leone");
  cMap.set("SG", "Singapore");
  cMap.set("SX", "Sint Maarten");
  cMap.set("SK", "Slovakia (Slovak Republic)");
  cMap.set("SI", "Slovenia");
  cMap.set("SB", "Solomon Islands");
  cMap.set("SO", "Somalia");
  cMap.set("ZA", "South Africa");
  cMap.set("SGS", "South Georgia and the South Sandwich Islands");
  cMap.set("KR", "South Korea");
  cMap.set("SS", "South Sudan");
  cMap.set("ES", "Spain");
  cMap.set("LK", "Sri Lanka");
  cMap.set("SH", "St. Helena");
  cMap.set("PM", "St. Pierre and Miquelon");
  cMap.set("SD", "Sudan");
  cMap.set("SR", "Suriname");
  cMap.set("SJ", "Svalbard and Jan Mayen Islands");
  cMap.set("SZ", "Swaziland");
  cMap.set("SE", "Sweden");
  cMap.set("CH", "Switzerland");
  cMap.set("SY", "Syrian Arab Republic");
  cMap.set("TW", "Taiwan China");
  cMap.set("TJ", "Tajikistan");
  cMap.set("TZ", "Tanzania");
  cMap.set("TH", "Thailand");
  cMap.set("TLS", "Timor-Leste");
  cMap.set("TG", "Togo");
  cMap.set("TK", "Tokelau");
  cMap.set("TO", "Tonga");
  cMap.set("TT", "Trinidad and Tobago");
  cMap.set("TN", "Tunisia");
  cMap.set("TR", "Turkey");
  cMap.set("TM", "Turkmenistan");
  cMap.set("TC", "Turks and Caicos Islands");
  cMap.set("TV", "Tuvalu");
  cMap.set("UG", "Uganda");
  cMap.set("UA", "Ukraine");
  cMap.set("AE", "United Arab Emirates");
  cMap.set("UK", "United Kingdom");
  cMap.set("US", "United States");
  cMap.set("UM", "United States Minor Outlying Islands");
  cMap.set("UY", "Uruguay");
  cMap.set("UZ", "Uzbekistan");
  cMap.set("VU", "Vanuatu");
  cMap.set("VA", "Vatican City State (Holy See)");
  cMap.set("VE", "Venezuela");
  cMap.set("VN", "Vietnam");
  cMap.set("VG", "Virgin Islands (British)");
  cMap.set("VI", "Virgin Islands (U.S.)");
  cMap.set("WF", "Wallis And Futuna Islands");
  cMap.set("EH", "Western Sahara");
  cMap.set("YE", "Yemen");
  cMap.set("YU", "Yugoslavia");
  cMap.set("ZM", "Zambia");
  cMap.set("EAZ", "Zanzibar");
  cMap.set("ZW", "Zimbabwe");
  