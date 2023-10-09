import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  build:{
    //minify:true
  },
  plugins: [
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'npm/vite-plugin-monkey',
        //match: ['https://www2.alibaba.com/create_campaign.htm*'],
        match: [
          'https://www2.alibaba.com/*',
          //'https://www.alibaba.com/*',
          'https://message.alibaba.com/message/default.htm*',
          'https://hz-productposting.alibaba.com/*',
          'https://alicrm.alibaba.com/?spm=*'
        ],
        grant:['GM_xmlhttpRequest','unsafeWindow'],
        name:'龙泽-阿里巴巴工具集',
        //downloadURL:'http://resource.zengdm.cn/scripts/tm/alitools.user.js'
        updateURL:'http://resource.zengdm.cn/scripts/tm/alitools.user.js'
      },
    }),
  ],
});
