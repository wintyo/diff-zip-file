(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{149:function(e,t,n){var content=n(169);"string"==typeof content&&(content=[[e.i,content,""]]),content.locals&&(e.exports=content.locals);(0,n(58).default)("89964174",content,!0,{sourceMap:!1})},166:function(e,t,n){e.exports=function(){return new Worker(n.p+"e0b5544640f0ed90970d.worker.js")}},167:function(e,t,n){e.exports=function(){return new Worker(n.p+"cfe2382ded319d347194.worker.js")}},168:function(e,t,n){"use strict";var r=n(149);n.n(r).a},169:function(e,t,n){(t=n(57)(!1)).push([e.i,".zip-upload[data-v-2a6e492f]{display:-webkit-box;display:flex;min-height:300px}.zip-upload__block[data-v-2a6e492f]{padding:10px;width:50%}.zip-upload__block+.zip-upload__block[data-v-2a6e492f]{border-left:2px solid #ccc}.file-list__item.-add[data-v-2a6e492f]{color:#00f}.file-list__item.-change[data-v-2a6e492f]{color:green}.file-list__item.-delete[data-v-2a6e492f]{color:red}",""]),e.exports=t},172:function(e,t,n){"use strict";n.r(t);n(77),n(39),n(33),n(16),n(55);var r=n(170),o=n(48),l=(n(72),n(74),n(150),n(160),n(94)),c=n(163),f=n(164),d=new Uint8Array([239,187,191]),v=function(){function e(){Object(c.a)(this,e)}return Object(f.a)(e,null,[{key:"download",value:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"text/plain",data="text/plain"===n||"text/csv"===n?[d,t]:[t],r=new Blob(data,{type:n});if(window.navigator.msSaveOrOpenBlob)window.navigator.msSaveOrOpenBlob(r,e);else{var element=document.createElement("a");element.href=window.URL.createObjectURL(r),element.setAttribute("download",e),element.click(),window.URL.revokeObjectURL(element.href)}}}]),e}();n(165);function m(e){var i,t,n=e.length,r=-1,o=[];for(i=0;i<n;++i)(t=e.charCodeAt(i))<=127?o[++r]=t:t<=2047?(o[++r]=192|t>>>6,o[++r]=128|63&t):t<=65535?(o[++r]=224|t>>>12,o[++r]=128|t>>>6&63,o[++r]=128|63&t):(o[++r]=240|t>>>18,o[++r]=128|t>>>12&63,o[++r]=128|t>>>6&63,o[++r]=128|63&t);return o}var _=n(166),h=n.n(_),w=n(167),O=n.n(w);function y(object,e){var t=Object.keys(object);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(object);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(object,e).enumerable}))),t.push.apply(t,n)}return t}n(161).Zlib.Unzip,n(162).Zlib.Zip;var z=l.TypedVue.typedExtend({data:function(){return{zipFileInfoListA:[],zipFileInfoListB:[],progressA:"",progressB:""}},computed:{_diffZipFileMap:function(){var e=this,t={};return this.$data.zipFileInfoListA.forEach((function(n){var r=e.$data.zipFileInfoListB.find((function(e){return n.fileName===e.fileName}));r?!function(e,t){if(e.length!==t.length)return!1;for(var i=0;i<e.length;i++)if(e[i]!==t[i])return!1;return!0}(n.binaryData,r.binaryData)?t[n.fileName]="change":t[n.fileName]="same":t[n.fileName]="delete"})),this.$data.zipFileInfoListB.filter((function(e){return!t[e.fileName]})).forEach((function(e){t[e.fileName]="add"})),t}},methods:{onUpload:function(e,label){var t=this;if(e.currentTarget.files){var n=e.currentTarget.files[0],r=new FileReader;r.onloadend=function(){r.result&&function(data){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=new h.a;t.addEventListener("message",(function(n){var r=n.data.status;"progress"===r&&e.progress&&e.progress(n.data),"complete"===r&&(e.complete&&e.complete(n.data),t.terminate())})),t.postMessage(data)}({fileBinary:new Uint8Array(r.result)},{progress:function(data){var progress="".concat(data.loaded,"/").concat(data.total);"A"===label?t.$data.progressA=progress:t.$data.progressB=progress},complete:function(data){var e=data.zipFileInfoList;"A"===label?t.$data.zipFileInfoListA=e:t.$data.zipFileInfoListB=e}})},r.readAsArrayBuffer(n)}},onDownloadButtonClick:function(){var e=this,t=this.$data.zipFileInfoListB.filter((function(t){return["add","change"].includes(e._diffZipFileMap[t.fileName])})).map((function(e){return function(e){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?y(Object(source),!0).forEach((function(t){Object(o.a)(e,t,source[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(source)):y(Object(source)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(source,t))}))}return e}({},e,{fileName:"changed/".concat(e.fileName)})})),n=this.$data.zipFileInfoListA.filter((function(t){return["delete"].includes(e._diffZipFileMap[t.fileName])})).map((function(e){return e.fileName}));!function(data){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},t=new O.a;t.addEventListener("message",(function(n){var r=n.data.status;"progress"===r&&e.progress&&e.progress(n.data),"complete"===r&&(e.complete&&e.complete(n.data),t.terminate())})),t.postMessage(data)}({zipFiles:[].concat(Object(r.a)(t),[{fileName:"deleteFileNames.txt",binaryData:m(n.join("\n"))}])},{complete:function(data){var e=data.compressData;v.download("diff.zip",e,"application/zip")}})}}}),F=(n(168),n(23)),component=Object(F.a)(z,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("div",{staticClass:"zip-upload"},[n("div",{staticClass:"zip-upload__block"},[n("div",[e._v("BEFORE")]),n("input",{attrs:{type:"file"},on:{change:function(t){e.onUpload(t,"A")}}}),n("span",[e._v("progress: "+e._s(e.$data.progressA))]),n("ul",{staticClass:"file-list"},[e._l(e.$data.zipFileInfoListA,(function(t){return[n("li",{staticClass:"file-list__item",class:{"-delete":"delete"===e._diffZipFileMap[t.fileName]}},[e._v(e._s(t.fileName))])]}))],2)]),n("div",{staticClass:"zip-upload__block"},[n("div",[e._v("AFTER")]),n("input",{attrs:{type:"file"},on:{change:function(t){e.onUpload(t,"B")}}}),n("span",[e._v("progress: "+e._s(e.$data.progressB))]),n("ul",{staticClass:"file-list"},[e._l(e.$data.zipFileInfoListB,(function(t){return[n("li",{staticClass:"file-list__item",class:{"-add":"add"===e._diffZipFileMap[t.fileName],"-change":"change"===e._diffZipFileMap[t.fileName]}},[e._v(e._s(t.fileName))])]}))],2)])]),n("div",[n("button",{on:{click:e.onDownloadButtonClick}},[e._v("差分ダウンロード")])])])}),[],!1,null,"2a6e492f",null);t.default=component.exports}}]);