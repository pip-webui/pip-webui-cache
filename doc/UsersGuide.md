# Pip.WebUI.Cache User's Guide

## <a name="contents"></a> Contents
- [Installing](#install)
- [Questions and bugs](#issues)


## <a name="install"></a> Installing

Add dependency to **pip-webui** into your **bower.json** or **package.json** file depending what you use.
```javascript
"dependencies": {
  ...
  "pip-webui": "*"
  ...
}
```

Alternatively you can install **pip-webui** manually using **bower**:
```bash
bower install pip-webui
```

or install it using **npm**:
```bash
npm install pip-webui
```

Include **pip-webui** files into your web application.
```html
<link rel="stylesheet" href=".../pip-webui-lib.min.css"/>
<link rel="stylesheet" href=".../pip-webui.min.css"/>
...
<script src=".../pip-webui-lib.min.js"></script>
```

Register **pipCache** module in angular module dependencies.
```javascript
angular.module('myApp', [..., 'pipCache']);
```

Configure models in provider:
```javascript
...
function getPhotosKey(groups) { return groups && groups.length > 1 && groups[1]; }
function extractPhotosPagination(params) {
    var res = {};
    var pars = _.cloneDeep(params);
    if (params) {
        if (params.hasOwnProperty('p') && params.hasOwnProperty('l'))  {
            res.limit = parseInt(params.l, 10);
            res.offset = (parseInt(params.p, 10) - 1) * res.limit;
            delete pars.l;
            delete pars.p;
        }
    }
    return [res, pars];
}
...
angular.module('myApp', [..., 'pipCache'])
  .config(function(..., pipCacheConfigProvider) {
    pipCacheConfigProvider.enableLogs = true;
    pipCacheConfigProvider.models.push({
        name: 'photos',
        options: {
            maxAge: 1000 * 60 * 2, // 2 minutes
            key: 'id' // key 'id'
        },
        interceptors: {
            item: {
                match: new RegExp('photos/([^\/]+)$'), // Catch all requests and look for id
                getKey: getPhotosKey // return 'id' from RexExp match
            },
            collection: {
                match: new RegExp('photos'), // Catch all requests and look for 'photos' in request
                extractPagination: extractPhotosPagination // Custom params handler
            }
        }
    });
  });
```


## <a name="issues"></a> Questions and bugs

If you have any questions regarding the module, you can ask them using our 
[discussion forum](https://groups.google.com/forum/#!forum/pip-webui).

Bugs related to this module can be reported using [github issues](https://github.com/pip-webui/pip-webui-cache/issues).
