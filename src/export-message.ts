import { request,formatTime,getCookie, formatMobiles, formatPhoneNumber } from './utils';
import {table2excel} from './sample-export-excel';


/**
 * 导出所有询盘信息
 */
export default
class ExportMessage {

  // 导出按钮
  private exportButtonDom:HTMLButtonElement = document.createElement('button');

  private mySubjectRespone:any;

  private readonly TB_TOKEN = getCookie('_tb_token_');

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
      {title:'商机分类', key:'feedbackType', type:'text', height:CELL_HEIGHT},
    ];

    const BUTTON_DOM = this.exportButtonDom;

    BUTTON_DOM.classList.add('is-disable'); // 点击后，显示禁用状态
    BUTTON_DOM.setAttribute("disabled", "");
    //BUTTON_DOM.innerText='处理中...';
    let exportCount = 0;
    this.fetchDataFormHook().then( (datas)=>{
      if(datas && datas.length > 0){//有数据才执行导出
        exportCount = datas.length;
        table2excel ( column, datas, '询盘数据-'+new Date().toISOString().split('T')[0]);
      }
    })
    .finally(()=>{
      BUTTON_DOM.classList.remove('is-disable'); // 恢复状态
      BUTTON_DOM.removeAttribute("disabled");
      BUTTON_DOM.innerText='导出当前页的询盘';
      alert(`导出完成，导出了${exportCount}条数据`);
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

    // const enum sourceEnum {
    //   RFQ                             = 'RFQ商机',
    //   CONTACT_MKT_KHT_CUSTOMER_TOUCH  = 'Recommend Quotation'
    // }

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
      let countryCode= data.sender.countryCode;
      //let level      = data.sender.userNewLevelIcon?data.sender.userNewLevelIcon:null; //用户有可能无等级
      let createTime = formatTime(data.createTime);
      let assigned   = data.distributeStatus==2?'YES':'NO';//0-RFQ,2-manager,
      let owner      = data.ownerName;
      //@ts-ignore
      let source       = this.getSourceName(data.source);
      let feedbackType = this.getFeedBackType(data.feedbackType);
      //=====获取客户信息====//
      let companyName, email, phone,mobileNumber,level;
      let buyerInfo = null;
      buyerInfo = await this.getBuyerInfo( customer, countryCode);
      if( buyerInfo ) {
        // 以下是符合2024-01-15的代码
        level       = buyerInfo.level || '--';
        companyName = buyerInfo.companyName;
        email       = buyerInfo.email;
        phone       = buyerInfo.phone;
        mobileNumber= buyerInfo.mobileNumber;
      }

      datas.push(
        {id,productId,name,createTime,assigned,pic,customer,level,country,owner,companyName, email, phone,mobileNumber,source,feedbackType}
      )

      // 在按钮上显示进度：{完成数}/{总数}
      this.exportButtonDom.innerText=`导出中：${++finishCount}/${list.length}`;
    }
    return datas;
  }

  private getSourceName(type:any){
    switch(type){
      case 'CONTACT_MKT_KHT_CUSTOMER_TOUCH':  return 'Recommend Quotation';
      case 'RFQ':  return 'RFQ商机';
      default: return type;
    }
  }
  private getFeedBackType(type:any){
    switch(type){
      case 6:  return 'TM商机';
      default: return '询盘商机';//!!!目前发现，除了6之外，都是询盘商机，未来可能要改
    }
  }

  /**
   * 根据客户的名字和国家国家码，获取准确的客户的信息。  
   * 注意，客户的名字可能是空的。  
   * @param customerName 客户的名字
   * @param countryCode 客户所属的国家代码，例如“CA”，“US”
   * @returns 查询的结果
   */
  private async getBuyerInfo( customerName:string, countryCode:string ) {


    // console.log(`开始查询客户[${customerName}]的信息`);
    let customerList = null;
    try{
      customerList = await this.searchCustomerByName(customerName);
    }catch{
      return {
        companyName :'查询客户名出错',
        email       :'查询客户名出错',
        phone       :'查询客户名出错',
        mobileNumber:'查询客户名出错',
        level       :'查询客户名出错',
      }
    }

    if( !customerList ){
      return {
        companyName :'空白客户名',
        email       :'空白客户名',
        phone       :'空白客户名',
        mobileNumber:'空白客户名',
        level       :'空白客户名',
      };
    }

    if( customerList.length === 0 ) { // 该客户，很可能没有添加到客户池里
      return {
        companyName :'可能还没添加客户',
        email       :'可能还没添加客户',
        phone       :'可能还没添加客户',
        mobileNumber:'可能还没添加客户',
        level       :'可能还没添加客户',
      };
    }

    if( customerList.length > 4 ){
      // 重复的太多了，不精细查询了，让用户人工处理
      return {
        companyName: '超过4个同名客户', email: '超过4个同名客户', phone: '超过4个同名客户', mobileNumber: '超过4个同名客户', level: '超过4个同名客户',
      };
    }

    const matchCountrycustomerList = [];
    for (let i = 0; i < customerList.length; i++) {
      // 遇到同名的联系人，通过国家代码来确定具体是哪个客户
      const customer = customerList[i];
      const customerDetail = await this.getCustomerDetail(customer.customerId);
      if( customerDetail.countryCode === countryCode ) {
        matchCountrycustomerList.push(customerDetail);
      }
    }

    if( matchCountrycustomerList.length === 0){
      return {
        companyName: '没有找到客户', email: '没有找到客户', phone: '没有找到客户', mobileNumber: '没有找到客户', level: '没有找到客户',
      }
    }
    else if(matchCountrycustomerList.length === 1) {
      return matchCountrycustomerList[0];
    }
    else{
      return {
        companyName: '多个同名同国家客户', email: '多个同名同国家客户', phone: '多个同名同国家客户', mobileNumber: '多个同名同国家客户', level: '多个同名同国家客户',
      };
    }
  }

  private async getCustomerDetail(customerId:string){

    const buyerInfo = {
      companyName :'获取失败',
      email       :'获取失败',
      phone       :'获取失败',
      mobileNumber:'获取失败',
      level       :'获取失败',
      countryCode : null,
    };

    const t = new Date().getTime();
    let reqUrl= `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerAndContacts.json?customerId=${customerId}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`
    try{
      const response:any = await request(reqUrl,null,'get','application/x-www-form-urlencoded; charset=UTF-8');//返回的数据例子，参考【客户信息数据例子.json文件】
      // console.log(`请求url：${reqUrl}`);
      // console.log(response);
      const queryCO         = response.data.contactQueryCOList[0];
      const detailCO        = response.data.customerDetailCO;
      // console.log(detailCO);
      buyerInfo.companyName = detailCO.companyName;
      buyerInfo.level       = detailCO.highQualityLevelTag;
      buyerInfo.countryCode = detailCO.country;

      if( Array.isArray(queryCO.email) && queryCO.email[0] ){
        buyerInfo.email = queryCO.email[0];
      }else{
        buyerInfo.email = '--';
      }

      buyerInfo.phone        = formatPhoneNumber(queryCO.phoneNumbers)
      buyerInfo.mobileNumber = formatMobiles( queryCO.mobileNumber )

      return buyerInfo;

    } catch ( error ) {
      console.error('导出失败：查询客户详细信息出错',error);
      // alert('导出失败：查询客户详细信息出错');
      return buyerInfo;
    }
  }


  /**
   * 
   * @param name 要查询的客户的名字
   * @returns 查询成功返回结果数组，如果查询失败返回null
   */
  private async searchCustomerByName(name:string) {

    //名字是空的，就不处理，因为这个查询会出错
    if( !name || name.trim()==='' ){
      return null;
    }
    const t = new Date().getTime();
    name = encodeURI(name);
    const serachURL = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryMainSearchList.json?content=${name}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`

    // console.log('按名字查询客户的URL：',serachURL);
    const response:any = await request(serachURL);
    // console.log('按名字查询客户的结果是：',response);
    if( !response.success ){
      return null;
    }
    
    const data:any = response.data.data;
    if( !data || !Array.isArray(data) ) {
      return null ;
    }

    const result = [];
    
    for (let i = 0; i < data.length; i++) {
      const customer = data[i];
      result.push({
        customerId: customer.customerId,
        companyName: customer.companyName,
      });
    }

    return result;
  }
}

