import './style.css';
import ExportKeyword  from './export-keywork';
import ExportProducts from './export-products'
import ExportMessage  from './export-message';
import ExportCustomer from './export-customer';
// import typescriptLogo from './typescript.svg';
// import viteLogo from './vite.svg';
// import { setupCounter } from './counter';
// import {GM_cookie} from '$';

(() => {
  // const app = document.createElement('div');
  // document.body.append(app);
  // return app;

  
  window.addEventListener('load',()=>{
    //在页面加载完成0.5秒后，再加载功能按钮，这样是为了尽量保证页面内容完整，按钮能正确添加到适合的位置
    setTimeout(function(){
      loadStricps();
    },500)
  })
  
  // loadStricps();

  /**
   * 根据网页地址，加载针对不通页面的工具。
   * 每当增加一种功能，都需要在这个方法里增加逻辑。
   * TODO 考虑采用自动加载的方案（类似自动路由或者注解路由）。目前功能少的时候，可以先按目前这个方案
   */
  function loadStricps() {
    let currentUrl = window.location.href;
    //关键词页面
    // if( currentUrl.includes('www2.alibaba.com/create_campaign.htm') ){
    if( currentUrl.includes('www2.alibaba.com/ads/create.htm') ){
      let exportKeyword:ExportKeyword = new ExportKeyword();
      exportKeyword.run();
      console.log('===加载关键词页面===');
    }


    // 产品导出
    if( currentUrl.includes('hz-productposting.alibaba.com/product/manage_products.htm') ){
      let exportProducts:ExportProducts = new ExportProducts();
      exportProducts.run();
    }

    // 询盘导出
    if( currentUrl.includes('message.alibaba.com/message/default.htm') ){
      let exportMessage:ExportMessage = new ExportMessage();
      exportMessage.run();
    }

    // 客户导出
    if( currentUrl.includes('#my-customer') ){
      console.log('===========================================');
      console.log('===========加载阿里工具：客户导出============');
      console.log('===========================================');
      let exportCustomer:ExportCustomer = new ExportCustomer();
      exportCustomer.run();
    }
  }

  

})();
