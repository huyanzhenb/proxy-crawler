const axios = require('axios');
const qs = require('qs');
const { createClient } = require('@supabase/supabase-js');

// 请求的目标 URL
const url = 'https://api.pyproxy.com/g/proxy_up/free_proxy_ip_list';

// 请求体数据（根据实际需求填充）
const data = qs.stringify({
  lang: '',     // 空语言参数
  page: 1,      // 当前页是1
  limit: 5000 // 每页显示条数
});

// 配置请求头
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Accept': 'text/html, */*; q=0.01',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    'Origin': 'https://www.pyproxy.com',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'sec-ch-ua': '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-site'
  }

// 创建 Supabase 客户端
const supabase = createClient(
  'https://crvpziqyfhhcqnxdkapn.supabase.co',
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNydnB6aXF5ZmhoY3FueGRrYXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc0ODE1OTgsImV4cCI6MjAzMzA1NzU5OH0.wvoTqQCOuoo8UVK-R7iyXXO99Nq0q0cSHzcu3wNNL7I"
);

// 发送 POST 请求
axios.post(url, data, { headers })
  .then(async response => {
    let proxyList = response.data.ret_data.list;
    
    // 插入前查询总数
    const { data: beforeData, error: countError } = await supabase
      .from('free_proxy_list_test')
      .select('*', { count: 'exact' });
    
    const beforeCount = beforeData?.length || 0;
    console.log('插入前表中数据总数:', beforeCount);

    // 使用 Map 根据 IP 去重
    const uniqueProxies = Array.from(
      new Map(proxyList.map(item => [item.ip, item])).values()
    );
    
    // 将数据格式化为符合表结构的格式
    const insertData = uniqueProxies.map(proxy => ({
      address: `${proxy.ip}:${proxy.port}`,
      country: proxy.area,
      protocol: proxy.protocol?.toUpperCase(),
      anonymity_level: proxy.anonymity || 'unknown',
      ping: proxy.latency ? (proxy.latency / 1000).toFixed(2) : null,
    }));
    console.log(insertData)
    // 批量插入数据
    const { data, error } = await supabase
      .from('free_proxy_list_test')
      .insert(insertData)
      .select();

    if (error) {
      console.error('数据插入错误:', error);
    } else {
      console.log('成功插入数据条数:', data.length);
    }

    // 插入后查询总数
    const { data: afterData, error: afterCountError } = await supabase
      .from('free_proxy_list_test')
      .select('*', { count: 'exact' });
    
    const afterCount = afterData?.length || 0;
    console.log('插入后表中数据总数:', afterCount);
  })
  .catch(error => {
    console.error('请求发生错误:', error);
  });