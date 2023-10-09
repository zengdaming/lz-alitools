  //==========================================================================================================//
  //=================下面是导出excel的工具；处理图片的代码，我个人做了单元大小适应windows系统屏幕比例===============//
  //==========================================================================================================//

  let idTmr;
  const getExplorer = () => {
    let explorer = window.navigator.userAgent;
    //ie
    if (explorer.indexOf("MSIE") >= 0) {
      return 'ie';
    }
    //firefox
  
    else if (explorer.indexOf("Firefox") >= 0) {
      return 'Firefox';
    }
    //Chrome
    else if (explorer.indexOf("Chrome") >= 0) {
      return 'Chrome';
    }
    //Opera
    else if (explorer.indexOf("Opera") >= 0) {
      return 'Opera';
    }
    //Safari
    else if (explorer.indexOf("Safari") >= 0) {
      return 'Safari';
    }
  }
  // 判断浏览器是否为IE
  const exportToExcel = (data, name) => {
  
    // 判断是否为IE
    if (getExplorer() == 'ie') {
      tableToIE(data, name)
    } else {
      tableToNotIE(data, name)
    }
  }
  
  const Cleanup = () => {
    window.clearInterval(idTmr);
  }
  
  // ie浏览器下执行
  const tableToIE = (data, name) => {
    let curTbl = data;
    let oXL = new ActiveXObject("Excel.Application");
  
    //创建AX对象excel
    let oWB = oXL.Workbooks.Add();
    //获取workbook对象
    let xlsheet = oWB.Worksheets(1);
    //激活当前sheet
    let sel = document.body.createTextRange();
    sel.moveToElementText(curTbl);
    //把表格中的内容移到TextRange中
    sel.select;
    //全选TextRange中内容
    sel.execCommand("Copy");
    //复制TextRange中内容
    xlsheet.Paste();
    //粘贴到活动的EXCEL中
  
    oXL.Visible = true;
    //设置excel可见属性
  
    try {
      let fname = oXL.Application.GetSaveAsFilename("Excel.xls", "Excel Spreadsheets (*.xls), *.xls");
    } catch (e) {
      print("Nested catch caught " + e);
    } finally {
      oWB.SaveAs(fname);
  
      oWB.Close(savechanges = false);
      //xls.visible = false;
      oXL.Quit();
      oXL = null;
      // 结束excel进程，退出完成
      window.setInterval("Cleanup();", 1);
      idTmr = window.setInterval("Cleanup();", 1);
    }
  }
  
  // 非ie浏览器下执行
  const tableToNotIE = (function () {
    // 编码要用utf-8不然默认gbk会出现中文乱码
    const uri = 'data:application/vnd.ms-excel;base64,',
      template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>';
  
    const base64 = function (s) {
      return window.btoa(unescape(encodeURIComponent(s)));
    }
  
    const format = (s, c) => {
      return s.replace(/{(\w+)}/g,
        (m, p) => {
          return c[p];
        })
    }
  
    return (table, name) => {
      const ctx = {
        worksheet: name,
        table
      }
  
      const url = uri + base64(format(template, ctx));
  
      if (navigator.userAgent.indexOf("Firefox") > -1){
        window.location.href = url
      } else {
        const aLink = document.createElement('a');
        aLink.href = url;
        aLink.download = name || '';
        let event;
        if (window.MouseEvent) {
          event = new MouseEvent('click');
        } else {
          event = document.createEvent('MouseEvents');
          event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        }
        aLink.dispatchEvent(event);
      }
    }
  })()
  
  // 导出函数
  const table2excel = (column, data, excelName) => {
    const typeMap = {
      image: getImageHtml,
      text: getTextHtml,
      link: getLinkHtml
    }
  
    let thead = column.reduce((result, item) => {
      result += `<th>${item.title}</th>`
      return result
    }, '')
  
    thead = `<thead><tr>${thead}</tr></thead>`
  
    let tbody = data.reduce((result, row) => {
      const temp = column.reduce((tds, col) => {
        tds += typeMap[col.type || 'text'](row[col.key], col)
        return tds
      }, '')
      result += `<tr>${temp}</tr>`
      return result
    }, '')
  
    tbody = `<tbody>${tbody}</tbody>`
  
    const table = thead + tbody
  
    // 导出表格
    exportToExcel(table, excelName)
  
    function getTextHtml(val) {
      return `<td style="text-align: center">${val}</td>`
    }
  
    function getLinkHtml(url, options) {
      return `<td style="text-align: center"><a href="${url}">${options.title}</a></td>`
    }
  
    function getImageHtml(val, options) {
      let RATIO = 1.5;
      options = Object.assign({width: 40*RATIO, height: 60*RATIO}, options)
      if(!val){
        return  `<td style="width: ${options.width*RATIO+6}px; height: ${options.height*RATIO+6}px; text-align: center; vertical-align: middle"></td>`
        // return  `<td style="text-align: center; vertical-align: middle"></td>`
      }else {
        return `<td style="width: ${options.width*RATIO+6}px; height: ${options.height*RATIO+6}px; text-align: center; vertical-align: middle"><img src="${val}" height=${options.height} /></td>`
      }
    }
  }

  export {table2excel};