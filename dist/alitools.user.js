// ==UserScript==
// @name         龙泽-阿里巴巴工具集
// @namespace    npm/vite-plugin-monkey
// @version      0.2.1.5b
// @author       zdm
// @description  这个是阿里巴巴后台的辅助工具：1、导出询盘。2、导出关键词。3、导出所有产品信息。4、导出客户信息
// @icon         https://vitejs.dev/logo.svg
// @downloadURL  https://raw.githubusercontent.com/zengdaming/lz-alitools/main/dist/alitools.user.js
// @updateURL    https://raw.githubusercontent.com/zengdaming/lz-alitools/main/dist/alitools.user.js
// @match        https://www2.alibaba.com/*
// @match        https://message.alibaba.com/message/default.htm*
// @match        https://hz-productposting.alibaba.com/*
// @match        https://alicrm.alibaba.com/?spm=*
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

(o=>{const e=document.createElement("style");e.dataset.source="vite-plugin-monkey",e.textContent=o,document.head.append(e)})(" .el-button{display:inline-block;line-height:1;white-space:nowrap;cursor:pointer;background-color:#67c23a;border:1px solid #67c23a;color:#fff;text-align:center;box-sizing:border-box;outline:none;margin:0;transition:.1s;font-weight:500;padding:12px 20px;font-size:14px;border-radius:4px}.el-button:hover{background:#85ce61;border-color:#85ce61}.is-disable{background-color:#b3e19d;border-color:#b3e19d;cursor:not-allowed} ");

(function () {
  'use strict';

  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };
  const getExplorer = () => {
    let explorer = window.navigator.userAgent;
    if (explorer.indexOf("MSIE") >= 0) {
      return "ie";
    } else if (explorer.indexOf("Firefox") >= 0) {
      return "Firefox";
    } else if (explorer.indexOf("Chrome") >= 0) {
      return "Chrome";
    } else if (explorer.indexOf("Opera") >= 0) {
      return "Opera";
    } else if (explorer.indexOf("Safari") >= 0) {
      return "Safari";
    }
  };
  const exportToExcel = (data, name) => {
    if (getExplorer() == "ie") {
      tableToIE(data);
    } else {
      tableToNotIE(data, name);
    }
  };
  const tableToIE = (data, name) => {
    let curTbl = data;
    let oXL = new ActiveXObject("Excel.Application");
    let oWB = oXL.Workbooks.Add();
    let xlsheet = oWB.Worksheets(1);
    let sel = document.body.createTextRange();
    sel.moveToElementText(curTbl);
    sel.select;
    sel.execCommand("Copy");
    xlsheet.Paste();
    oXL.Visible = true;
    try {
      let fname2 = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
    } catch (e) {
      print("Nested catch caught " + e);
    } finally {
      oWB.SaveAs(fname);
      oWB.Close(savechanges = false);
      oXL.Quit();
      oXL = null;
      window.setInterval("Cleanup();", 1);
      window.setInterval("Cleanup();", 1);
    }
  };
  const tableToNotIE = function() {
    const uri = "data:application/vnd.ms-excel;base64,", template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
    const base64 = function(s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    };
    const format = (s, c) => {
      return s.replace(
        /{(\w+)}/g,
        (m, p) => {
          return c[p];
        }
      );
    };
    return (table, name) => {
      const ctx = {
        worksheet: name,
        table
      };
      const url = uri + base64(format(template, ctx));
      if (navigator.userAgent.indexOf("Firefox") > -1) {
        window.location.href = url;
      } else {
        const aLink = document.createElement("a");
        aLink.href = url;
        aLink.download = name || "";
        let event;
        if (window.MouseEvent) {
          event = new MouseEvent("click");
        } else {
          event = document.createEvent("MouseEvents");
          event.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
      }
    };
  }();
  const table2excel = (column, data, excelName) => {
    const typeMap = {
      image: getImageHtml,
      text: getTextHtml,
      link: getLinkHtml
    };
    let thead = column.reduce((result, item) => {
      result += `<th>${item.title}</th>`;
      return result;
    }, "");
    thead = `<thead><tr>${thead}</tr></thead>`;
    let tbody = data.reduce((result, row) => {
      const temp = column.reduce((tds, col) => {
        tds += typeMap[col.type || "text"](row[col.key], col);
        return tds;
      }, "");
      result += `<tr>${temp}</tr>`;
      return result;
    }, "");
    tbody = `<tbody>${tbody}</tbody>`;
    const table = thead + tbody;
    exportToExcel(table, excelName);
    function getTextHtml(val) {
      return `<td style="text-align: center">${val}</td>`;
    }
    function getLinkHtml(url, options) {
      return `<td style="text-align: center"><a href="${url}">${options.title}</a></td>`;
    }
    function getImageHtml(val, options) {
      let RATIO = 1;
      options = Object.assign({ width: 40, height: 60 }, options);
      if (!val) {
        return `<td style="width: ${options.width * RATIO + 6}px; height: ${options.height * RATIO + 6}px; text-align: center; vertical-align: middle"></td>`;
      } else {
        return `<td style="width: ${options.width * RATIO + 6}px; height: ${options.height * RATIO + 6}px; text-align: center; vertical-align: middle"><img src="${val}" style="height:100%" /></td>`;
      }
    }
  };
  class ExportKeyword {
    constructor() {
      //=========================================//
      //============变量、常量定义================//
      //=========================================//
      __publicField(this, "TITLE_SETTING", [
        { title: "买家搜索词", key: "bidword", type: "text", height: 100 },
        { title: "推广评分", key: "star", type: "text", height: 100 }
      ]);
      __publicField(this, "BUTTON_DOM");
      // 导出按钮的dom
      __publicField(this, "keyWorkData", null);
    }
    run() {
      this.createButton();
      let _this = this;
      let originalFetch = unsafeWindow.fetch;
      unsafeWindow.fetch = function(url, options) {
        if (url.includes("bidword/keywordInfo")) {
          return originalFetch.apply(this, arguments).then(async function(response) {
            let responseClone = response.clone();
            _this.keyWorkData = await response.json();
            return responseClone;
          }).catch(function(error) {
            console.error("Fetch error:", error);
            throw error;
          });
        } else {
          return originalFetch.apply(this, arguments);
        }
      };
    }
    /**
     * 在页面上适当的位置创建导出按钮
     */
    createButton() {
      let buttonContent = "导出关键词数据";
      let button = document.createElement("span");
      button.innerHTML = `<button class="el-button">${buttonContent}</button>`;
      button.setAttribute("style", "position:absolute;left:450px;top:8px;z-index:99999");
      this.BUTTON_DOM = button.querySelector("button");
      this.BUTTON_DOM.addEventListener("click", () => {
        this.exportDatas2excel();
      });
      document.querySelector("#scibp-header").appendChild(button);
    }
    exportDatas2excel() {
      if (!this.keyWorkData) {
        alert("💔请在页面上弄出关键词后，再导出");
        return;
      }
      let data = this.keyWorkData.data;
      if (!data || !Array.isArray(data)) {
        alert("💔没有截获到关键词数据，\r\n请刷新页面重试");
        return;
      }
      table2excel(
        this.TITLE_SETTING,
        data,
        "keywork-star-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        //这个是导出的文件名
      );
      let count = data.length;
      alert(`✅成功导出${count}个关键词`);
    }
  }
  function request(url, data = null, method = "get", contentType = "application/json;charset=UTF-8") {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        url,
        method,
        headers: {
          "Content-type": contentType
        },
        //responseType:'json',
        data,
        onload: function(xhr) {
          resolve(JSON.parse(xhr.responseText));
        },
        onerror: function(error) {
          reject(error);
        }
      });
    });
  }
  function formatTime(timestamp) {
    let t = new Date(timestamp);
    return t.toLocaleString();
  }
  function getCookie(sKey) {
    return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[-.+*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
  }
  function formatPhoneNumber(phoneNumbers) {
    if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      let p = phoneNumbers[0];
      let result = "";
      result = p.number;
      result = p.areaCode ? p.areaCode + "-" + result : result;
      result = p.countryCode ? p.countryCode + "-" + result : result;
      return result;
    }
    return "--";
  }
  function formatMobiles(mobiles) {
    if (Array.isArray(mobiles) && mobiles.length > 0) {
      let area = mobiles[0].mobileCountryCode || "";
      let num = mobiles[0].mobilePhoneNum || "";
      return area + " " + num;
    }
    return "--";
  }
  function getcountryFullName(key) {
    return cMap.get(key);
  }
  const cMap = /* @__PURE__ */ new Map();
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
  class ExportProducts {
    constructor() {
      // private const enum LAYER_TYPE_ENUM{
      // }
      __publicField(this, "exportButtonDom", document.createElement("button"));
    }
    run() {
      this.createButton();
    }
    createButton() {
      let exButton = this.exportButtonDom;
      exButton.classList.add("el-button");
      exButton.innerText = "导出所有产品";
      let buttonWarp = document.createElement("div");
      buttonWarp.appendChild(exButton);
      buttonWarp.setAttribute("style", "position:absolute;left:450px;top:8px;z-index:99999");
      document.body.after(buttonWarp);
      let _this = this;
      exButton.onclick = function(event) {
        try {
          _this.exportDatas2excel();
        } catch (error) {
          alert("导出失败，请联系开发者");
          throw error;
        }
        event.stopPropagation();
      };
    }
    exportDatas2excel() {
      const CELL_HEIGHT = "100";
      const CELL_WIDTH = "100";
      const COLUMN = [
        { title: "产品图", key: "absImageUrl", type: "image", height: CELL_HEIGHT, width: CELL_WIDTH },
        { title: "产品图名字", key: "absImageName", type: "text", height: CELL_HEIGHT, width: CELL_WIDTH },
        { title: "产品名", key: "subject", type: "text", height: CELL_HEIGHT },
        { title: "产品ID", key: "id", type: "text", height: CELL_HEIGHT },
        { title: "1级分组", key: "groupName1", type: "text", height: CELL_HEIGHT },
        { title: "2级分组", key: "groupName2", type: "text", height: CELL_HEIGHT },
        { title: "3级分组", key: "groupName3", type: "text", height: CELL_HEIGHT },
        { title: "产品分层", key: "powerScoreLayer", type: "text", height: CELL_HEIGHT },
        { title: "产品类型", key: "tradeType", type: "text", height: CELL_HEIGHT },
        { title: "产品价格", key: "fobPrice", type: "text", height: CELL_HEIGHT },
        { title: "负责人", key: "ownerMemberName", type: "text", height: CELL_HEIGHT },
        { title: "更新时间", key: "gmtModified", type: "text", height: CELL_HEIGHT },
        { title: "质量分", key: "finalScore", type: "text", height: CELL_HEIGHT },
        { title: "产品状态", key: "displayStatus", type: "text", height: CELL_HEIGHT },
        { title: "月曝光量", key: "showNum", type: "text", height: CELL_HEIGHT },
        { title: "月点击量", key: "clickNum", type: "text", height: CELL_HEIGHT },
        { title: "月曝光量", key: "showNum", type: "text", height: CELL_HEIGHT },
        { title: "查看详情", key: "detailUrl", type: "link", height: CELL_HEIGHT },
        { title: "产品链接", key: "detailUrl", type: "text", height: CELL_HEIGHT }
      ];
      this.exportButtonDom.classList.add("is-disable");
      this.exportButtonDom.setAttribute("disabled", "");
      this.fetchDatas().then((datas) => {
        return this.formatDatas(datas);
      }).then((datas) => {
        table2excel(COLUMN, datas, "all-products-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
      }).catch((error) => {
        console.error("=========调用table2excel错误==========");
        console.error(error);
        throw error;
      }).finally(() => {
        this.exportButtonDom.classList.remove("is-disable");
        this.exportButtonDom.removeAttribute("disabled");
        this.exportButtonDom.innerText = "导出所有产品";
      });
    }
    /**
     * 获取所有产品的信息。
     * 通过直接调用阿里后台的产品查询接口来获取数据。
     */
    async fetchDatas() {
      let page = 0;
      const size = 50;
      let totalPage = 0;
      let allProducts = new Array();
      let exButton = this.exportButtonDom;
      await _run();
      return allProducts;
      async function _run() {
        page++;
        let respone = await ExportProducts.fetchProductsDataByPage(page, size);
        if (respone && !totalPage) {
          totalPage = Math.ceil(respone.count / size);
        }
        if (respone.products && respone.products.length > 0) {
          allProducts = allProducts.concat(respone.products);
          exButton.innerText = `处理中：${page}/${totalPage}`;
          await _run();
        }
      }
    }
    formatDatas(allProducts) {
      const [IMG_RESIZE_W, IMG_RESIZE_H] = [100, 100];
      const IMG_RESIZE_PARAM = `_${IMG_RESIZE_W}x${IMG_RESIZE_H}.jpg`;
      let LayerEnum;
      ((LayerEnum2) => {
        LayerEnum2["superHighQuality"] = "爆品";
        LayerEnum2["potential"] = "潜力品";
        LayerEnum2["highQuality"] = "实力优品";
        LayerEnum2["ordinary"] = "低分品";
      })(LayerEnum || (LayerEnum = {}));
      let datas = new Array();
      for (const product of allProducts) {
        let absImageUrl = product.absImageUrl ? product.absImageUrl + IMG_RESIZE_PARAM : null;
        let paths = product.absImageUrl.split("/");
        let absImageName = paths[paths.length - 1];
        let subject = product.subject;
        let id = product.id;
        let powerScoreLayer = LayerEnum[product.powerScoreLayer];
        powerScoreLayer = powerScoreLayer ? powerScoreLayer : "-";
        let tradeType = product.tradeType == "rts" ? "Ready to ship" : product.tradeType == "notRts" ? "Customization" : "未知类型";
        let displayStatus = product.displayStatus == "y" ? "已上架" : product.displayStatus == "n" ? "下架" : "其他状态";
        let detailUrl = product.detailUrl;
        let fobPrice = product.fobPrice;
        let ownerMemberName = product.ownerMemberName;
        let gmtModified = product.gmtModified;
        let finalScore = Math.floor(product.finalScore * 100) / 100;
        let showNum = product.showNum;
        let clickNum = product.clickNum;
        let fbNum = product.fbNum;
        let groupName1 = product.groupName1;
        let groupName2 = product.groupName2;
        let groupName3 = product.groupName3;
        datas.push(
          { absImageUrl, absImageName, subject, id, powerScoreLayer, tradeType, displayStatus, detailUrl, fobPrice, ownerMemberName, gmtModified, finalScore, showNum, groupName1, groupName2, groupName3, clickNum, fbNum }
        );
      }
      return datas;
    }
    /**
     * 
     * @param page 要查询第几页的产品，默认1
     * @param size 每页查询的梳理，默认50（阿里后台最大一次性查50个）
     * @returns 接口返回的原始Respone
     */
    static async fetchProductsDataByPage(page = 1, size = 50) {
      let url = `https://hz-productposting.alibaba.com/product/managementproducts/asyQueryProductsList.do?statisticsType=month&repositoryType=all&imageType=all&showPowerScore=&showType=onlyMarket&status=approved&page=${page}&size=${size}`;
      let respone = await request(url);
      return respone;
    }
  }
  class ExportMessage {
    constructor() {
      // 导出按钮
      __publicField(this, "exportButtonDom", document.createElement("button"));
      __publicField(this, "mySubjectRespone");
      let _this = this;
      let open = window.XMLHttpRequest.prototype.open;
      window.XMLHttpRequest.prototype.open = function(method, url, async) {
        if (url.includes("/message/ajax/feedback/subjectList.htm")) {
          this.addEventListener("load", function() {
            _this.mySubjectRespone = JSON.parse(this.responseText);
          });
        }
        return open.apply(this, arguments);
      };
    }
    run() {
      this.createButton();
    }
    createButton() {
      let exButton = this.exportButtonDom;
      exButton.classList.add("el-button");
      exButton.innerText = "导出当前页的询盘";
      let buttonWarp = document.createElement("div");
      buttonWarp.appendChild(exButton);
      buttonWarp.setAttribute("style", "position:absolute;left:450px;top:8px;z-index:99999");
      document.body.after(buttonWarp);
      let _this = this;
      exButton.onclick = function(event) {
        try {
          _this.exportDatas2excel();
        } catch (error) {
          alert("导出失败，请联系开发者");
          throw error;
        }
        event.stopPropagation();
      };
    }
    exportDatas2excel() {
      const CELL_HEIGHT = "100";
      const CELL_WIDTH = "100";
      const column = [
        { title: "产品图", key: "pic", type: "image", height: CELL_HEIGHT, width: CELL_WIDTH },
        { title: "产品ID", key: "productId", type: "text", height: CELL_HEIGHT },
        { title: "产品名", key: "name", type: "text", height: CELL_HEIGHT },
        { title: "询价单号", key: "id", type: "text", height: CELL_HEIGHT },
        { title: "客户名", key: "customer", type: "text", height: CELL_HEIGHT },
        { title: "客户等级", key: "level", type: "text", height: CELL_HEIGHT },
        { title: "所属国家", key: "country", type: "text", height: CELL_HEIGHT },
        { title: "公司名称", key: "companyName", type: "text", height: CELL_HEIGHT },
        { title: "座机", key: "phone", type: "text", height: CELL_HEIGHT },
        { title: "手机", key: "mobileNumber", type: "text", height: CELL_HEIGHT },
        { title: "电子邮箱", key: "email", type: "text", height: CELL_HEIGHT },
        { title: "负责人名", key: "owner", type: "text", height: CELL_HEIGHT },
        { title: "创建时间", key: "createTime", type: "text", height: CELL_HEIGHT },
        { title: "是否分配", key: "assigned", type: "text", height: CELL_HEIGHT },
        { title: "商机来源", key: "source", type: "text", height: CELL_HEIGHT },
        { title: "商机分类", key: "feedbackType", type: "text", height: CELL_HEIGHT }
      ];
      const BUTTON_DOM = this.exportButtonDom;
      BUTTON_DOM.classList.add("is-disable");
      BUTTON_DOM.setAttribute("disabled", "");
      this.fetchDataFormHook().then((datas) => {
        if (datas && datas.length > 0) {
          table2excel(column, datas, "询盘数据-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
        }
      }).finally(() => {
        BUTTON_DOM.classList.remove("is-disable");
        BUTTON_DOM.removeAttribute("disabled");
        BUTTON_DOM.innerText = "导出当前页的询盘";
      });
    }
    /**
     * 通过截胡ajax的方法，获取询盘数据。
     * 首先截胡的url是/message/ajax/feedback/subjectList.htm，获得询盘列表
     * 然后再通过这个接口，获得每个客户的详情：https://alicrm.alibaba.com/jsonp/customerPluginQueryServiceI/queryCustomerInfo.json?buyerAccountId=
     * @param {Array} datas 处理后的数据，存到这个变量中
     */
    async fetchDataFormHook() {
      let list = null;
      let datas = new Array();
      if (this.mySubjectRespone == void 0 || this.mySubjectRespone.code != 200) {
        list = unsafeWindow.feedbackListResponse.list;
      } else if (Array.isArray(this.mySubjectRespone.data.list)) {
        list = this.mySubjectRespone.data.list;
      } else {
        alert("没有任何数据，请重试");
        return;
      }
      let finishCount = 0;
      const IMG_RESIZE_PARAM = `_100x100.jpg`;
      for (const feedback of list) {
        let data = feedback[0];
        let name = data.subject;
        let productId = data.productInfo ? data.productInfo[0].productId : "无产品ID";
        let pic = data.productInfo ? data.productInfo[0].imageUrl + IMG_RESIZE_PARAM : null;
        let id = data.requestNo;
        let customer = data.sender.name;
        let country = data.sender.countryName;
        let createTime = formatTime(data.createTime);
        let assigned = data.distributeStatus == 2 ? "YES" : "NO";
        let owner = data.ownerName;
        let source = this.getSourceName(data.source);
        let feedbackType = this.getFeedBackType(data.feedbackType);
        let companyName, email, phone, mobileNumber, level;
        let buyerInfo = null;
        buyerInfo = await this.getBuyerInfo(data.sender.secAccountId);
        if (buyerInfo) {
          level = buyerInfo.highQualityLevelTag || "NA";
          companyName = buyerInfo.companyName || "NA";
          email = buyerInfo.buyerContactInfo.email || "NA";
          phone = buyerInfo.buyerContactInfo.phoneNumber || "NA";
          mobileNumber = buyerInfo.buyerContactInfo.mobileNumber || "NA";
        }
        datas.push(
          { id, productId, name, createTime, assigned, pic, customer, level, country, owner, companyName, email, phone, mobileNumber, source, feedbackType }
        );
        this.exportButtonDom.innerText = `导出中：${++finishCount}/${list.length}`;
      }
      return datas;
    }
    getSourceName(type) {
      switch (type) {
        case "CONTACT_MKT_KHT_CUSTOMER_TOUCH":
          return "Recommend Quotation";
        case "RFQ":
          return "RFQ商机";
        default:
          return type;
      }
    }
    getFeedBackType(type) {
      switch (type) {
        case 6:
          return "TM商机";
        default:
          return "询盘商机";
      }
    }
    async getBuyerInfo(buyerAccountId) {
      const tb_token = getCookie("_tb_token_");
      let reqUrl = `https://alicrm.alibaba.com/jsonp/customerPluginQueryServiceI/queryCustomerInfo.json?buyerAccountId=${buyerAccountId}&_tb_token_=${tb_token}`;
      try {
        let response = await request(reqUrl);
        let info = response.data.data.buyerInfo;
        return info;
      } catch (error) {
        alert("导出失败：查询客户详细信息出错");
        throw error;
      }
    }
  }
  class ExportCustomer {
    constructor() {
      __publicField(this, "TB_TOKEN");
      __publicField(this, "exportButtonDom", document.createElement("button"));
      __publicField(this, "sleep", (delay) => new Promise((resolve) => setTimeout(resolve, delay)));
      this.TB_TOKEN = getCookie("_tb_token_");
    }
    run() {
      this.createButton();
    }
    createButton() {
      let exButton = this.exportButtonDom;
      exButton.classList.add("el-button");
      exButton.innerText = "导出所有客户";
      let buttonWarp = document.createElement("div");
      buttonWarp.appendChild(exButton);
      buttonWarp.setAttribute("style", "position:absolute;left:450px;top:8px;z-index:99999");
      document.body.after(buttonWarp);
      let _this = this;
      exButton.onclick = function(event) {
        try {
          _this.exportDatas2excel();
        } catch (error) {
          alert("导出失败，请联系开发者");
          throw error;
        }
        event.stopPropagation();
      };
    }
    exportDatas2excel() {
      const CELL_HEIGHT = "100";
      const CELL_WIDTH = "100";
      const COLUMN = [
        { title: "公司名称", key: "companyName", type: "text", height: CELL_HEIGHT, width: CELL_WIDTH },
        { title: "所属国家", key: "country", type: "text", height: CELL_HEIGHT, width: CELL_WIDTH },
        { title: "客户等级", key: "highQualityLevel", type: "text", height: CELL_HEIGHT },
        { title: "业务员", key: "ownerName", type: "text", height: CELL_HEIGHT },
        { title: "客户来源", key: "sourceList", type: "text", height: CELL_HEIGHT },
        { title: "注册时间", key: "registerDate", type: "text", height: CELL_HEIGHT },
        { title: "建档时间", key: "gmtCreate", type: "text", height: CELL_HEIGHT },
        { title: "联系人名", key: "contactName", type: "text", height: CELL_HEIGHT },
        { title: "邮箱地址", key: "email", type: "text", height: CELL_HEIGHT },
        { title: "座机号码", key: "phone", type: "text", height: CELL_HEIGHT },
        { title: "手机号码", key: "mobiles", type: "text", height: CELL_HEIGHT },
        { title: "是否关注", key: "isFans", type: "text", height: CELL_HEIGHT },
        { title: "关注时间", key: "focusTime", type: "text", height: CELL_HEIGHT },
        { title: "有无询盘", key: "inquiryCount", type: "text", height: CELL_HEIGHT }
      ];
      this.exportButtonDom.classList.add("is-disable");
      this.exportButtonDom.setAttribute("disabled", "");
      this.fetchDatas().then((datas) => {
        table2excel(COLUMN, datas, "all-customers-" + (/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
      }).catch((error) => {
        console.error("=========调用table2excel错误==========");
        console.error(error);
        throw error;
      }).finally(() => {
        this.exportButtonDom.classList.remove("is-disable");
        this.exportButtonDom.removeAttribute("disabled");
        this.exportButtonDom.innerText = "导出所有客户";
      });
    }
    /**
     * 获取客户数据。
     * 通过直接调用阿里后台的查询接口来获取数据。
     */
    async fetchDatas() {
      let page = 0;
      const size = 10;
      let totalPage = 0;
      let allCustomerDetail = new Array();
      let exButton = this.exportButtonDom;
      console.log("============开始获取客户列表========");
      console.log("当前地址：" + window.location.href);
      let _this = this;
      await _run();
      return allCustomerDetail;
      async function _run() {
        //! 延迟设置（重要事情说3遍）
        //! 延迟设置（重要事情说3遍）
        //! 延迟设置（重要事情说3遍）
        await _this.sleep(2e3);
        page++;
        let respone = await _this.fetchCustomerListByPage(page, size);
        if (respone && !totalPage) {
          totalPage = Math.ceil(respone.total / size);
        }
        exButton.innerText = `处理中,请耐心等候：${page}/${totalPage}页`;
        let data = respone.data;
        if (data && data.length > 0) {
          let customerIdList = new Array(data.length);
          for (let i = 0; i < data.length; i++) {
            customerIdList[i] = data[i].customerId;
          }
          let detailList = await _this.fetchCustomerDetail(customerIdList);
          allCustomerDetail = allCustomerDetail.concat(detailList);
          await _run();
        }
      }
    }
    /**
     * 根据客户ID，批量获取客户的详情
     * @param customerIdList 客户ID的列表
     */
    async fetchCustomerDetail(customerIdList) {
      let detailList = new Array(customerIdList.length);
      for (let i = 0; i < customerIdList.length; i++) {
        const customerId = customerIdList[i];
        let detailPromise = this.getCustomerDetail(customerId);
        let historyPromise = this.getVisitHistory(customerId);
        let inquiryCountPromise = this.inquiryCount(customerId);
        const info = await detailPromise;
        const visitHistroy = await historyPromise;
        const inquiryCount = await inquiryCountPromise;
        const detailCO = info.customerDetailCO;
        const contact = info.contactQueryCOList[0];
        const detail = {
          companyName: detailCO.companyName,
          country: getcountryFullName(detailCO.country) || "未知国家",
          highQualityLevel: detailCO.highQualityLevelTag || "--",
          ownerName: detailCO.ownerName,
          //phone              : detailCO.phone.countryCode + '-' + detailCO.phone.areaCode + '-' + detailCO.phone.number,
          sourceList: detailCO.sourceList ? detailCO.sourceList.toString() : "--",
          //来源，需要转换
          registerDate: formatTime(detailCO.registerDate * 1e3),
          //阿里的注册时间戳，是10位，js标准是13位时间戳，所以这里乘以1000
          gmtCreate: detailCO.gmtCreate ? new Date(detailCO.gmtCreate).toLocaleString() : "--",
          //建档时间
          contactName: contact.firstName + " " + contact.lastName,
          email: contact.email ? contact.email[0] : "--",
          phone: formatPhoneNumber(contact.phoneNumbers),
          mobiles: formatMobiles(contact.mobiles),
          focusTime: visitHistroy.focusTime ? new Date(visitHistroy.focusTime).toLocaleString() : "--",
          isFans: visitHistroy.isFans ? "是" : "否",
          inquiryCount
        };
        detailList[i] = detail;
      }
      return detailList;
    }
    /**
     * 
     * @param page 要查询第几页的客户，默认1
     * @param size 每页查询的数量，默认50（阿里后台最大一次性查50个）
     * @returns 接口返回的原始Respone
     */
    async fetchCustomerListByPage(page = 1, size = 10) {
      let reqData = `{"jsonArray":"[]","orderDescs":[{"col":"opp_gmt_modified","asc":false}],"pageNum":${page},"pageSize":${size}}`;
      const url = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerList.json?_tb_token_=${this.TB_TOKEN}`;
      const respone = await request(url, reqData, "post");
      return respone.data;
    }
    /**
     * 最近一年的询盘数
     */
    async inquiryCount(customerId) {
      const t = (/* @__PURE__ */ new Date()).getTime();
      const url = `https://alicrm.alibaba.com/eggCrmQn/crm/icbuCustomerServiceI/listInquiries.json?include=true&customerId=${customerId}&pageNum=1&pageSize=200&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;
      try {
        const respone = await request(url);
        let count = respone.data.totalSize;
        if (count == void 0 || count == null) {
          const msg = "没有获取到询盘数，可能接口出错，或者调用太频繁被限制了";
          console.error(msg);
          throw new Error(msg);
        }
        if (count > 0) {
          return `有${count}个询盘`;
        } else {
          return "没询盘";
        }
      } catch (error) {
        return "获取失败";
      }
    }
    async getCustomerDetail(customerId) {
      const t = (/* @__PURE__ */ new Date()).getTime();
      const url = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerAndContacts.json?customerId=${customerId}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;
      const respone = await request(url);
      return respone.data;
    }
    async getVisitHistory(customerId) {
      const t = (/* @__PURE__ */ new Date()).getTime();
      const url = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerVisitHistory.json?customerId=${customerId}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;
      const respone = await request(url);
      return respone.data.data;
    }
  }
  (() => {
    window.addEventListener("load", () => {
      setTimeout(function() {
        loadStricps();
      }, 500);
    });
    function loadStricps() {
      let currentUrl = window.location.href;
      if (currentUrl.includes("www2.alibaba.com/ads/create.htm")) {
        let exportKeyword = new ExportKeyword();
        exportKeyword.run();
        console.log("===加载关键词页面===");
      }
      if (currentUrl.includes("hz-productposting.alibaba.com/product/manage_products.htm")) {
        let exportProducts = new ExportProducts();
        exportProducts.run();
      }
      if (currentUrl.includes("message.alibaba.com/message/default.htm")) {
        let exportMessage = new ExportMessage();
        exportMessage.run();
      }
      if (currentUrl.includes("#my-customer")) {
        console.log("===========================================");
        console.log("===========加载阿里工具：客户导出============");
        console.log("===========================================");
        let exportCustomer = new ExportCustomer();
        exportCustomer.run();
      }
    }
  })();

})();
