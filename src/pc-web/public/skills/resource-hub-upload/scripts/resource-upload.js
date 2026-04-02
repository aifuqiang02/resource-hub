#!/usr/bin/env node

/**
 * 臻享资源平台 - AI 协同上传脚本
 * 
 * 使用方式：
 *   node resource-upload.js <command> [options]
 * 
 * 注意：脚本已内置 userKey，下载时已自动替换
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const LOCAL_API_BASE_URL = 'http://localhost:40251';
const PRODUCTION_API_BASE_URL = 'https://api.tx07.cn/resource-hub';
const API_BASE_URL = process.env.API_BASE_URL || LOCAL_API_BASE_URL;
const API_VERSION = '/api/v1';
const USER_KEY = '{{USER_KEY}}';

function createClient(userKey) {
  const isHttps = API_BASE_URL.startsWith('https');
  const protocol = isHttps ? https : http;

  function request(method, endpoint, body, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, `${isHttps ? 'https' : 'http'}://${API_BASE_URL}`);
      const reqOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method,
        headers: {
          'x-user-key': userKey,
          'Accept': 'application/json',
        },
      };

      let requestBody = null;

      if (body && options.multipart) {
        const fileName = path.basename(body.filePath);
        const fileContent = fs.readFileSync(body.filePath);
        const ext = path.extname(fileName).toLowerCase();
        const mimeTypes = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp' };
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        const boundary = '----FormBoundary' + Date.now().toString(16);

        const header = Buffer.from(
          `--${boundary}\r\n` +
          `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n` +
          `Content-Type: ${contentType}\r\n\r\n`
        );
        const footer = Buffer.from(`\r\n--${boundary}--\r\n`);

        requestBody = Buffer.concat([header, fileContent, footer]);
        reqOptions.headers['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
        reqOptions.headers['Content-Length'] = requestBody.length;
      } else if (body) {
        reqOptions.headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(body);
        reqOptions.headers['Content-Length'] = Buffer.byteLength(requestBody);
      }

      const req = protocol.request(reqOptions, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.code === 0 || parsed.code === 200) {
              resolve(parsed.data);
            } else {
              reject(new Error(parsed.msg || 'Request failed'));
            }
          } catch {
            reject(new Error(`Failed to parse response: ${data}`));
          }
        });
      });

      req.on('error', reject);
      if (requestBody) req.write(requestBody);
      req.end();
    });
  }

  return {
    uploadImage: (filePath) => request('POST', `${API_VERSION}/open/uploads/publish-image`, { filePath }, { multipart: true }),
    createResource: (payload) => request('POST', `${API_VERSION}/open/resources`, payload),
    listResources: (params = {}) => {
      const query = new URLSearchParams();
      if (params.page) query.set('page', params.page);
      if (params.pageSize) query.set('pageSize', params.pageSize);
      if (params.status) query.set('status', params.status);
      const queryString = query.toString();
      return request('GET', `${API_VERSION}/open/resources/mine${queryString ? '?' + queryString : ''}`);
    },
    updateResource: (resourceId, payload) => request('PATCH', `${API_VERSION}/open/resources/${resourceId}`, payload),
    deleteResource: (resourceId) => request('DELETE', `${API_VERSION}/open/resources/${resourceId}`),
  };
}

// CLI
const [, , command, ...args] = process.argv;

if (!command) {
  console.log(`
 臻享资源平台 - AI 协同上传脚本

 使用方式：
   node resource-upload.js <command> [options]

 环境变量：
   API_BASE_URL   默认 ${LOCAL_API_BASE_URL}
                  正式环境可用 ${PRODUCTION_API_BASE_URL}

 命令：
   upload-image <filePath>              - 上传截图
   create <title> <category> <jsonFile> - 创建资源
   list [status]                        - 获取资源列表
   update <resourceId> <jsonFile>       - 更新资源
   delete <resourceId>                 - 删除资源

 示例：
   node resource-upload.js upload-image ./screenshot.png
   node resource-upload.js create "标题" "分类" ./payload.json
 `);
  process.exit(1);
}

const client = createClient(USER_KEY);

async function main() {
  try {
    switch (command) {
      case 'upload-image': {
        const filePath = args[0];
        if (!filePath) throw new Error('请提供文件路径');
        const result = await client.uploadImage(filePath);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'create': {
        const [title, category, jsonFile] = args;
        if (!title || !category) throw new Error('请提供标题、分类');
        const payload = { title, category };
        if (jsonFile) Object.assign(payload, JSON.parse(fs.readFileSync(jsonFile, 'utf-8')));
        const result = await client.createResource(payload);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'list': {
        const [status] = args;
        const result = await client.listResources({ status });
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'update': {
        const [resourceId, jsonFile] = args;
        if (!resourceId) throw new Error('请提供资源ID');
        let payload = {};
        if (jsonFile) payload = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        const result = await client.updateResource(resourceId, payload);
        console.log(JSON.stringify(result, null, 2));
        break;
      }

      case 'delete': {
        const [resourceId] = args;
        if (!resourceId) throw new Error('请提供资源ID');
        await client.deleteResource(resourceId);
        console.log('删除成功');
        break;
      }

      default:
        console.error(`未知命令: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

main();
