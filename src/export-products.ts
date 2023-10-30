import {table2excel} from './sample-export-excel';
import { request } from './utils';

/**
 * 导出所有产品信息的功能。
 * 针对的页面是https://hz-productposting.alibaba.com/product/manage_products.htm*
 */
export default
class ExportProducts {
  // private const enum LAYER_TYPE_ENUM{

  // }
  private exportButtonDom:HTMLButtonElement = document.createElement('button');

  public run(){
    this.createButton();
  }

  private createButton(){
    //=================================//
    //===在页面的左上角，创建导出按钮====//
    //================================//
    let exButton = this.exportButtonDom;
    exButton.classList.add('el-button');
    exButton.innerText = '导出所有产品';
    
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
    {title:'产品图',   key:'absImageUrl',      type:'image',height:CELL_HEIGHT,width:CELL_WIDTH},
    {title:'产品图名字',   key:'absImageName',  type:'text',height:CELL_HEIGHT,width:CELL_WIDTH},
    {title:'产品名',   key:'subject',     type:'text', height:CELL_HEIGHT},
    {title:'产品ID',  key:'id',       type:'text', height:CELL_HEIGHT},
    {title:'1级分组', key:'groupName1',       type:'text', height:CELL_HEIGHT},
    {title:'2级分组', key:'groupName2',       type:'text', height:CELL_HEIGHT},
    {title:'3级分组', key:'groupName3',       type:'text', height:CELL_HEIGHT},
    {title:'产品分层', key:'powerScoreLayer', type:'text', height:CELL_HEIGHT},
    {title:'产品类型', key:'tradeType',    type:'text', height:CELL_HEIGHT},
    {title:'产品价格', key:'fobPrice',    type:'text', height:CELL_HEIGHT},
    {title:'负责人',   key:'ownerMemberName',    type:'text', height:CELL_HEIGHT},
    {title:'更新时间', key:'gmtModified',    type:'text', height:CELL_HEIGHT},
    {title:'质量分', key:'finalScore',    type:'text', height:CELL_HEIGHT},
    {title:'产品状态', key:'displayStatus',  type:'text', height:CELL_HEIGHT},
    {title:'月曝光量', key:'showNum',  type:'text', height:CELL_HEIGHT},
    {title:'月点击量', key:'clickNum',  type:'text', height:CELL_HEIGHT},
    {title:'月曝光量', key:'showNum',  type:'text', height:CELL_HEIGHT},
    {title:'查看详情', key:'detailUrl',  type:'link', height:CELL_HEIGHT},
    {title:'产品链接', key:'detailUrl',  type:'text', height:CELL_HEIGHT},
  ];

  this.exportButtonDom.classList.add('is-disable'); // 点击后，显示禁用状态
  this.exportButtonDom.setAttribute("disabled", "");
  
  this.fetchDatas().then((datas)=>{
    return this.formatDatas(datas)
  })
  .then((datas)=>{
    table2excel ( COLUMN, datas, 'all-products-'+new Date().toISOString().split('T')[0]);
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
    this.exportButtonDom.innerText='导出所有产品';
  });

  }

  /**
   * 获取所有产品的信息。
   * 通过直接调用阿里后台的产品查询接口来获取数据。
   */
  private async fetchDatas() {
    // 除了获取数据外，还要展示处理进度。
    let   page      = 0;
    const size      = 50;//一次查询50条，这也是阿里允许查询的最大值
    let   totalPage = 0;
    let   allProducts = new Array();
    let   exButton = this.exportButtonDom;//_run()方法里不能直接用this.exportButtonDom，因为_run是嵌套的方法，this指向不是本class
    await _run();
    return allProducts;

    // 使用递归的方式，一页一页得把所有产品数据查询出来
    // PS:这里可以改造成多线程的方式来获取数据。产品数少于1500的时候，单线程的性能是能OK的
    async function _run(){
      page++;
      let respone:any = await ExportProducts.fetchProductsDataByPage(page,size);
      if( respone && !totalPage ) {
        // 获取总数并计算页数，用来显示处理进度
        totalPage = Math.ceil(respone.count/size);
      }
      if( respone.products && respone.products.length > 0 ){
      // if( page < 2 ){
        allProducts = allProducts.concat(respone.products);
        // 在按钮上显示进度（_run()方法里不能直接用this.exportButtonDom，因为_run是嵌套的方法）
        exButton.innerText=`处理中：${page}/${totalPage}`;
        await _run(); //还有数据，通过递归，查询下一页的数据
      }
    }
  }

  private formatDatas(allProducts:Array<any>){
    // 重置图片LOGO大小的请求参数，这个是阿里自己的图片处理方法，例如把图片压缩成200x200，那么图片的url结尾加上_200x200.jpg
    // 例如：原始图片的地址是：https://alibaba/xxx/abc.jpg，我们只要200尺寸的，就请求https://alibaba/xxx/abc.jpg_200x200.jpg
    // 目前调试，发现它只支持等长宽，100整数的调整。支持：100x100,200x200，不支持：150x150,200x100
    const [IMG_RESIZE_W, IMG_RESIZE_H] = [100, 100];//ES6的解构赋值法，同时定义和赋值多个变量
    const IMG_RESIZE_PARAM = `_${IMG_RESIZE_W}x${IMG_RESIZE_H}.jpg`;//图片处理的完整参数，在图片地址加上这个就能实现压缩
    // const SCREEN_RATIO =2;
    const enum LayerEnum {
      superHighQuality = '爆品',
      potential        = '潜力品',
      highQuality      = '实力优品',
      ordinary         = '低分品'
    }
    let datas = new Array();
    for( const product of allProducts ){
      let absImageUrl     = product.absImageUrl ? product.absImageUrl+IMG_RESIZE_PARAM: null;
      let paths           = product.absImageUrl.split('/');
      let absImageName    = paths[paths.length-1]
      let subject         = product.subject;
      let id              = product.id;
      //@ts-ignore
      let powerScoreLayer = LayerEnum[product.powerScoreLayer];
          powerScoreLayer = powerScoreLayer ? powerScoreLayer : '-'; //下架的产品时没有产品分层的，在excel里显示'-'，
      let tradeType       = product.tradeType     == 'rts'?'Ready to ship':product.tradeType == 'notRts'?'Customization':'未知类型';
      let displayStatus   = product.displayStatus == 'y'?'已上架':product.displayStatus == 'n'?'下架':'其他状态';
      let detailUrl       = product.detailUrl;

      let fobPrice        = product.fobPrice;                          //价格
      let ownerMemberName = product.ownerMemberName;                   //负责人
      let gmtModified     = product.gmtModified;                       //更新时间
      let finalScore      = Math.floor( product.finalScore*100 )/100;  //质量及整体评分（因为后台返回的数，可能有超多小数，我们只保留2位）
      let showNum         = product.showNum;                           //月曝光量
      let clickNum        = product.clickNum;                          //月点击
      let fbNum           = product.fbNum;                             //月反馈
      let groupName1      = product.groupName1;                        //产品分组1
      let groupName2      = product.groupName2;                        //产品分组2
      let groupName3      = product.groupName3;                        //产品分组3

      datas.push(
        {absImageUrl,absImageName,subject,id,powerScoreLayer,tradeType,displayStatus,detailUrl,fobPrice,ownerMemberName,gmtModified,finalScore,showNum,groupName1,groupName2,groupName3,clickNum,fbNum}
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
  private static async fetchProductsDataByPage (page=1,size=50){
    let url = `https://hz-productposting.alibaba.com/product/managementproducts/asyQueryProductsList.do?statisticsType=month&repositoryType=all&imageType=all&showPowerScore=&showType=onlyMarket&status=approved&page=${page}&size=${size}`;
    let respone = await request(url);
    // console.log('请求地址：'+url);
    // console.log(respone);
    return respone;
  }
}