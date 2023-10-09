import { table2excel } from './sample-export-excel';
/**
 * 阿里营销页的关键词导出功能。
 * 导出的excel的内容如下
 * 【买家搜索词】	【推广评分】
 */
export default
  class ExportKeyword {
  //=========================================//
  //============变量、常量定义================//
  //=========================================//

  private TITLE_SETTING = [
    { title: '买家搜索词', key: 'bidword', type: 'text', height: 100 },
    { title: '推广评分', key: 'star', type: 'text', height: 100 },
  ];

  private BUTTON_DOM: any; // 导出按钮的dom

  private keyWorkData: any = null;

  constructor() {

    //  截胡https://www2.alibaba.com/api/recommend/bidword/keywordInfo/v2请求
    //  参考资料1：https://juejin.cn/post/7013240739521888264
    //  参考资料2：https://stackoverflow.com/questions/5202296/add-a-hook-to-all-ajax-requests-on-a-page
  }

  public run() {
    this.createButton();

    let _this = this;
    //@ts-ignore
    let originalFetch = unsafeWindow.fetch;

    // ! 重点是要用unsafeWindow
    //@ts-ignore
    unsafeWindow.fetch = function (url: string, options) {
      // 在发送请求之前，判断URL是否匹配特定条件
      if (url.includes('bidword/keywordInfo')) {
        //@ts-ignore
        return originalFetch.apply(this, arguments)
          .then( async function (response:Response) {
            let responseClone = response.clone();
            _this.keyWorkData  = await response.json();
            return responseClone;
          })
          .catch(function (error:any) {
            console.error('Fetch error:', error);
            throw error;
          });
      } else {
        // 如果URL不匹配条件，直接调用原始的fetch函数
        //@ts-ignore
        return originalFetch.apply(this, arguments);
      }
    };
  }

  /**
   * 在页面上适当的位置创建导出按钮
   */
  private createButton() {
    let buttonContent = '导出关键词数据';
    let button = document.createElement('span');
    button.innerHTML = `<button class="el-button">${buttonContent}</button>`;
    //button.setAttribute('style','position:relative;');
    button.setAttribute('style', 'position:absolute;left:450px;top:8px;z-index:99999');
    //document.body.after(button);
    this.BUTTON_DOM = button.querySelector('button');
    //绑定导出方法
    this.BUTTON_DOM.addEventListener('click', () => {
      this.exportDatas2excel();
    });
    //@ts-ignore
    document.querySelector('#scibp-header').appendChild(button);
  }

  private exportDatas2excel() {
    
    if( !this.keyWorkData ){
      alert('💔请在页面上弄出关键词后，再导出');
      return;
    }

    let data = this.keyWorkData.data;
    if( !data || !Array.isArray(data) ){
      alert('💔没有截获到关键词数据，\r\n请刷新页面重试');
      return;
    }

    table2excel(
      this.TITLE_SETTING,
      data,
      'keywork-star-' + new Date().toISOString().split('T')[0] //这个是导出的文件名
    );
    
    let count = data.length;
    alert(`✅成功导出${count}个关键词`);
  }
}
