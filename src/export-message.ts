import { request,formatTime,getCookie } from './utils';
import {table2excel} from './sample-export-excel';


/**
 * 导出所有询盘信息
 */
export default
class ExportMessage {

  // 导出按钮
  private exportButtonDom:HTMLButtonElement = document.createElement('button');

  private mySubjectRespone:any;

  constructor(){

    //  截胡【获取询盘数据】的ajax请求
    //  把数据存到下来，然后fetchDataFormHook方法直接读取
    //  参考资料1：https://juejin.cn/post/7013240739521888264
    //  参考资料2：https://stackoverflow.com/questions/5202296/add-a-hook-to-all-ajax-requests-on-a-page
    let _this = this;
    let open = window.XMLHttpRequest.prototype.open;
    //@ts-ignore
    window.XMLHttpRequest.prototype.open = function (method, url:strubg, async) {
      if ( url.includes("/message/ajax/feedback/subjectList.htm") ) {
        this.addEventListener('load',function(){
          _this.mySubjectRespone = JSON.parse(this.responseText);
        });
      }
      //@ts-ignore
      return open.apply(this, arguments);
    };
  }

  public run(){
    this.createButton();
  }

  private createButton(){
    //=================================//
    //===在页面的左上角，创建导出按钮====//
    //================================//
    let exButton = this.exportButtonDom;
    exButton.classList.add('el-button');
    exButton.innerText = '导出当前页的询盘';
    
    let buttonWarp = document.createElement('div');
    buttonWarp.appendChild(exButton);
    buttonWarp.setAttribute('style','position:absolute;left:450px;top:8px;z-index:99999');
    document.body.after(buttonWarp);

    let _this = this;
    exButton.onclick = function(event){
      try{
        _this.exportDatas2excel();
      }
      catch(error){
        // 所有的异常错误统一这里弹出错误提示给用户，其他地方只catch打印日志
        alert('导出失败，请联系开发者');
        throw(error);
      }
      event.stopPropagation();
    }
  }


  private exportDatas2excel(){
    // 定义行的数据标准
    const CELL_HEIGHT = '100'
    const CELL_WIDTH  = '100'
    const column =[
      {title:'产品图',   key:'pic',      type:'image',height:CELL_HEIGHT,width:CELL_WIDTH},
      {title:'产品ID',   key:'productId',type:'text', height:CELL_HEIGHT},
      {title:'产品名',   key:'name',     type:'text', height:CELL_HEIGHT},
      {title:'询价单号', key:'id',       type:'text', height:CELL_HEIGHT},
      {title:'客户名',   key:'customer', type:'text', height:CELL_HEIGHT},
      {title:'客户等级', key:'level',    type:'text', height:CELL_HEIGHT},
      {title:'所属国家', key:'country',  type:'text', height:CELL_HEIGHT},
      {title:'公司名称', key:'companyName',  type:'text', height:CELL_HEIGHT},
      {title:'座机',     key:'phone',        type:'text', height:CELL_HEIGHT},
      {title:'手机',     key:'mobileNumber', type:'text', height:CELL_HEIGHT},
      {title:'电子邮箱', key:'email',        type:'text', height:CELL_HEIGHT},
      {title:'负责人名', key:'owner',        type:'text', height:CELL_HEIGHT},
      {title:'创建时间', key:'createTime',   type:'text', height:CELL_HEIGHT},
      {title:'是否分配', key:'assigned',     type:'text', height:CELL_HEIGHT},
      {title:'商机来源', key:'source',       type:'text', height:CELL_HEIGHT},

    ];

    const BUTTON_DOM = this.exportButtonDom;

    BUTTON_DOM.classList.add('is-disable'); // 点击后，显示禁用状态
    BUTTON_DOM.setAttribute("disabled", "");
    //BUTTON_DOM.innerText='处理中...';
    this.fetchDataFormHook().then( (datas)=>{
      if(datas && datas.length > 0){//有数据才执行导出
        table2excel ( column, datas, '询盘数据-'+new Date().toISOString().split('T')[0]);
      }
    })
    .finally(()=>{
      BUTTON_DOM.classList.remove('is-disable'); // 恢复状态
      BUTTON_DOM.removeAttribute("disabled");
      BUTTON_DOM.innerText='导出当前页的询盘';
    })
  }

  /**
   * 通过截胡ajax的方法，获取询盘数据。
   * 首先截胡的url是/message/ajax/feedback/subjectList.htm，获得询盘列表
   * 然后再通过这个接口，获得每个客户的详情：https://alicrm.alibaba.com/jsonp/customerPluginQueryServiceI/queryCustomerInfo.json?buyerAccountId=
   * @param {Array} datas 处理后的数据，存到这个变量中
   */
  private async fetchDataFormHook( ) {

    let list = null;
    let datas = new Array();
    if( this.mySubjectRespone == undefined || this.mySubjectRespone.code!=200){
      //可能是第一次进入该页面，所以直接读取页面缓存
      //当进入询盘页面的时候，阿里会把最前的20个询盘，存在window.feedbackListResponse.list。
      //@ts-ignore
      list = unsafeWindow.feedbackListResponse.list;//油猴要读取原始页面的window,是用unsafeWindow，数据请参考【列表数据的例子.json文件】
    }
    else if( Array.isArray(this.mySubjectRespone.data.list) ){
      list = this.mySubjectRespone.data.list;
    }
    else{
      alert('没有任何数据，请重试');
      return;
    }

    const enum sourceEnum {
      RFQ                             = 'RFQ商机',
      CONTACT_MKT_KHT_CUSTOMER_TOUCH  = 'Recommend Quotation'
    }

    let finishCount = 0;//完成计数：用来在按钮上显示进度的
    const IMG_RESIZE_PARAM = `_100x100.jpg`;
    for (const feedback of list) {
      let data       = feedback[0]; //😝阿里确实把内容放二维数组里
      let name       = data.subject;
      let productId  = data.productInfo ? data.productInfo[0].productId : '无产品ID';
      let pic        = data.productInfo ? data.productInfo[0].imageUrl+IMG_RESIZE_PARAM : null;//图片加上缩小尺寸的处理
      let id         = data.requestNo;
      let customer   = data.sender.name;
      let country    = data.sender.countryName;
      //let level      = data.sender.userNewLevelIcon?data.sender.userNewLevelIcon:null; //用户有可能无等级
      let createTime = formatTime(data.createTime);
      let assigned   = data.distributeStatus==2?'YES':'NO';//0-RFQ,2-manager,
      let owner      = data.ownerName;
      //@ts-ignore
      let source     = sourceEnum[data.source] || '' ;//没有对应定义就显示空
      //=====获取客户信息====//
      let companyName, email, phone,mobileNumber,level;
      let buyerInfo = null;
      buyerInfo = await this.getBuyerInfo( data.sender.secAccountId );
      if( buyerInfo ) {
        level       = buyerInfo.highQualityLevelTag || "NA";
        companyName = buyerInfo.companyName || "NA";
        email       = buyerInfo.buyerContactInfo.email || "NA";
        phone       = buyerInfo.buyerContactInfo.phoneNumber  || "NA";
        mobileNumber= buyerInfo.buyerContactInfo.mobileNumber || "NA";
      }

      datas.push(
        {id,productId,name,createTime,assigned,pic,customer,level,country,owner,companyName, email, phone,mobileNumber,source}
      )

      // 在按钮上显示进度：{完成数}/{总数}
      this.exportButtonDom.innerText=`导出中：${++finishCount}/${list.length}`;
    }
    return datas;
  }

  private async getBuyerInfo( buyerAccountId:any ) {
    const tb_token=getCookie('_tb_token_');
    let reqUrl=`https://alicrm.alibaba.com/jsonp/customerPluginQueryServiceI/queryCustomerInfo.json?buyerAccountId=${buyerAccountId}&_tb_token_=${tb_token}`;
    try{
      let response:any = await request(reqUrl);//返回的数据例子，参考【客户信息数据例子.json文件】
      let info         = response.data.data.buyerInfo;
      return info;
    } catch ( error ) {
      alert('导出失败：查询客户详细信息出错');
      throw(error)
    }
  }

}