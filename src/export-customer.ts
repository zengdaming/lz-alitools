import {table2excel} from './sample-export-excel';
import { request,getCookie,formatTime,getcountryFullName,formatMobiles,formatPhoneNumber} from './utils';

/**
 * 导出客户信息。信息包括
 * 
 */
export default
class ExportCustomer {

  TB_TOKEN;

  constructor() {
    this.TB_TOKEN = getCookie('_tb_token_');
  }

  public run(){
    this.createButton();
  }

  private exportButtonDom:HTMLButtonElement = document.createElement('button');
  private createButton(){
    //=================================//
    //===在页面的左上角，创建导出按钮====//
    //================================//
    let exButton = this.exportButtonDom;
    exButton.classList.add('el-button');
    exButton.innerText = '导出所有客户';
    
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


  private exportDatas2excel() {
    // 定义行的数据标准
  const CELL_HEIGHT = '100'
  const CELL_WIDTH  = '100'
  const COLUMN =[
    {title:'公司名称', key:'companyName',  type:'text',height:CELL_HEIGHT,width:CELL_WIDTH},
    {title:'所属国家', key:'country',  type:'text',height:CELL_HEIGHT,width:CELL_WIDTH},
    {title:'客户等级', key:'highQualityLevel',     type:'text', height:CELL_HEIGHT},
    {title:'业务员',   key:'ownerName',     type:'text', height:CELL_HEIGHT},
    {title:'客户来源', key:'sourceList',       type:'text', height:CELL_HEIGHT},
    {title:'注册时间', key:'registerDate',       type:'text', height:CELL_HEIGHT},
    {title:'建档时间', key:'gmtCreate',       type:'text', height:CELL_HEIGHT},
    {title:'联系人名', key:'contactName',       type:'text', height:CELL_HEIGHT},
    {title:'邮箱地址', key:'email',       type:'text', height:CELL_HEIGHT},
    {title:'座机号码', key:'phone', type:'text', height:CELL_HEIGHT},
    {title:'手机号码', key:'mobiles', type:'text', height:CELL_HEIGHT},
    {title:'是否关注', key:'isFans',    type:'text', height:CELL_HEIGHT},
    {title:'关注时间', key:'focusTime',    type:'text', height:CELL_HEIGHT},
    {title:'有无询盘', key:'inquiryCount',    type:'text', height:CELL_HEIGHT},
  ];

  this.exportButtonDom.classList.add('is-disable'); // 点击后，显示禁用状态
  this.exportButtonDom.setAttribute("disabled", "");
  
  this.fetchDatas().then((datas)=>{
    table2excel ( COLUMN, datas, 'all-customers-'+new Date().toISOString().split('T')[0]);
  })
  .catch((error)=>{
    console.error('=========调用table2excel错误==========');
    console.error(error);
    throw(error);
  })
  .finally(()=>{
    // 恢复状态
    this.exportButtonDom.classList.remove('is-disable');
    this.exportButtonDom.removeAttribute("disabled");
    this.exportButtonDom.innerText='导出所有客户';
  });

  }

  /**
   * 获取客户数据。
   * 通过直接调用阿里后台的查询接口来获取数据。
   */
  private async fetchDatas() {
    // 获取信息的逻辑：
    // 1、逐页获取客户列表，获取customerId数据。
    // 2、通过customerId，查询客户的具体信息。

    // 除了获取数据外，还要展示处理进度。
    let   page      = 0;
    const size      = 10;//一次查询10条，这也是阿里允许查询的最大值
    let   totalPage = 0;
    let   allCustomerDetail = new Array();
    let   exButton = this.exportButtonDom;//_run()方法里不能直接用this.exportButtonDom，因为_run是嵌套的方法，this指向不是本class

    console.log('============开始获取客户列表========');
    console.log('当前地址：'+ window.location.href);
    let _this = this;
    await _run();
    return allCustomerDetail;

    // 使用递归的方式，一页一页得把所有数据查询出来
    async function _run(){
      //! 延迟设置（重要事情说3遍）
      //! 延迟设置（重要事情说3遍）
      //! 延迟设置（重要事情说3遍）
      await _this.sleep(2000);//每读取一页数据，故意暂停2秒，避免阿里限制访问
      page++;
      let respone:any = await _this.fetchCustomerListByPage(page,size);
      if( respone && !totalPage ) {
        // 获取总数并计算页数，用来显示处理进度
        totalPage = Math.ceil(respone.total/size);
      }

      // 在按钮上显示进度（_run()方法里不能直接用this.exportButtonDom，因为_run是嵌套的方法）
      exButton.innerText=`处理中,请耐心等候：${page}/${totalPage}页`;

      let data = respone.data;
      if( data && data.length > 0 ){
        // 拿到当前页的客户id数组
        let customerIdList = new Array( data.length );
        for (let i = 0; i < data.length; i++) {
          customerIdList[i] = data[i].customerId;
        }

        //获得当前页的客户的详情数据，然后合并到总数组中
        let detailList = await _this.fetchCustomerDetail( customerIdList );
        allCustomerDetail = allCustomerDetail.concat(detailList); // fix:这里应该可以优化内存，避免生成太多无用数组
        
        await _run(); //还有数据，通过递归，查询下一页的数据
      }
    }
  }

  /**
   * 根据客户ID，批量获取客户的详情
   * @param customerIdList 客户ID的列表
   */
  private async fetchCustomerDetail( customerIdList: Array<string> ) {
    let detailList = new Array( customerIdList.length );
    for (let i = 0; i < customerIdList.length; i++) {

      
      
      const customerId    = customerIdList[i];

      let detailPromise       = this.getCustomerDetail( customerId );//这一招是实现并发
      let historyPromise      = this.getVisitHistory(   customerId );//这一招是实现并发
      let inquiryCountPromise = this.inquiryCount( customerId );//这一招是实现并发
      const info          = await detailPromise;//这一招是实现并发
      const visitHistroy  = await historyPromise;//这一招是实现并发
      const inquiryCount  = await inquiryCountPromise;//这一招是实现并发

      const detailCO = info.customerDetailCO;
      const contact  = info.contactQueryCOList[0];

      // 开始把数据整合
      const detail = {
        companyName        : detailCO.companyName,
        country            : getcountryFullName(detailCO.country) || '未知国家',
        highQualityLevel   : detailCO.highQualityLevelTag || '--',
        ownerName          : detailCO.ownerName,
        //phone              : detailCO.phone.countryCode + '-' + detailCO.phone.areaCode + '-' + detailCO.phone.number,
        sourceList         : detailCO.sourceList ? detailCO.sourceList.toString() : '--', //来源，需要转换
        registerDate       : formatTime(detailCO.registerDate * 1000), //阿里的注册时间戳，是10位，js标准是13位时间戳，所以这里乘以1000
        gmtCreate          : detailCO.gmtCreate ? new Date(detailCO.gmtCreate).toLocaleString() : '--',  //建档时间
        contactName        : contact.firstName +' '+ contact.lastName,
        email              : contact.email ? contact.email[0] : '--',
        phone              : formatPhoneNumber(contact.phoneNumbers),
        mobiles            : formatMobiles(contact.mobiles),
        focusTime          : visitHistroy.focusTime ? new Date( visitHistroy.focusTime ).toLocaleString() : '--',
        isFans             : visitHistroy.isFans ? '是':'否',
        inquiryCount       : inquiryCount,
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
  private async fetchCustomerListByPage (page=1,size=10){
    let reqData  = `{"jsonArray":"[]","orderDescs":[{"col":"opp_gmt_modified","asc":false}],"pageNum":${page},"pageSize":${size}}`;
    // const tb_token = getCookie('_tb_token_');
    const url      = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerList.json?_tb_token_=${this.TB_TOKEN}`;

    const respone:any = await request(url,reqData,'post');
    // console.log('请求地址：'+url);
    // console.log(respone);
    return respone.data; // 数据的客户列表的数据list和total在data里，详情看《客户列表数的数据.json》
  }

  /**
   * 最近一年的询盘数
   */
  private async inquiryCount( customerId:string ) {
    const t = new Date().getTime();
    const url = `https://alicrm.alibaba.com/eggCrmQn/crm/icbuCustomerServiceI/listInquiries.json?include=true&customerId=${customerId}&pageNum=1&pageSize=200&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;

    try {
      const respone:any = await request(url);
      let count = respone.data.totalSize;
      if( count == undefined || count == null ) {
        const msg = '没有获取到询盘数，可能接口出错，或者调用太频繁被限制了'
        console.error(msg)
        throw new Error(msg);
      }
      if( count >0 ){
        return `有${count}个询盘`;
      }else{
        return '没询盘';
      }
    }
    catch (error) {
      return '获取失败';
    }    
  }

  private async getCustomerDetail( customerId:string ) {
    // const tb_token = getCookie('_tb_token_');
    const t = new Date().getTime();
    const url = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerAndContacts.json?customerId=${customerId}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;
    const respone:any = await request(url);

    return respone.data;
  }

  private async getVisitHistory( customerId:string ) {
    const t = new Date().getTime();
    const url = `https://alicrm.alibaba.com/eggCrmQn/crm/customerQueryServiceI/queryCustomerVisitHistory.json?customerId=${customerId}&_tb_token_=${this.TB_TOKEN}&__t__=${t}`;
    const respone:any = await request(url);

    return respone.data.data;
  }

  private sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))
}