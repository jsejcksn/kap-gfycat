"use strict";Object.defineProperty(exports,"__esModule",{value:!0});const fs=require("fs"),got_1=require("got");class GfycatApi{constructor(t,e){this.clientId=t,this.clientSecret=e}async authenticate(){const t=await got_1.default("https://api.gfycat.com/v1/oauth/token",{body:JSON.stringify({client_id:this.clientId,client_secret:this.clientSecret,grant_type:"client_credentials"}),headers:{"Content-Type":"application/json"},method:"post"}),e=JSON.parse(t.body);return this.accessToken=e.access_token,this.accessToken}async checkUploadStatus(){const t=`https://api.gfycat.com/v1/gfycats/fetch/status/${this.gfyname}`,e=await got_1.default(t),a=JSON.parse(e.body);if(!a.task)throw new Error;return a}async getUploadId(){const t=await got_1.default("https://api.gfycat.com/v1/gfycats",{headers:{Authorization:`Bearer ${this.accessToken}`},method:"post"}),e=JSON.parse(t.body);return this.gfyname=e.gfyname,this.gfyname}async uploadFile(t){const e=`https://filedrop.gfycat.com/${this.gfyname}`;await got_1.default(e,{body:fs.createReadStream(t),method:"put"})}}exports.GfycatApi=GfycatApi,exports.default=GfycatApi;