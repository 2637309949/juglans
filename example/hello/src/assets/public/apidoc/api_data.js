define({ "api": [
  {
    "type": "get",
    "url": "/hello",
    "title": "验证接口",
    "group": "Test",
    "description": "<p>有Token验证机制</p>",
    "success": {
      "examples": [
        {
          "title": "HTTP/1.1 200 OK",
          "content": "HTTP/1.1 200 OK\n {\n     \"errcode\": null,\n     \"errmsg\": null,\n     \"data\": \"hello:test\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/test.js",
    "groupTitle": "Test",
    "name": "GetHello"
  },
  {
    "type": "get",
    "url": "/test",
    "title": "测试接口",
    "group": "Test",
    "description": "<p>无Token验证机制</p>",
    "success": {
      "examples": [
        {
          "title": "HTTP/1.1 200 OK",
          "content": "HTTP/1.1 200 OK\n {\n     \"errcode\": null,\n     \"errmsg\": null,\n     \"data\": \"test\"\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/test.js",
    "groupTitle": "Test",
    "name": "GetTest"
  },
  {
    "type": "get",
    "url": "/user/aux/manager",
    "title": "用户角色",
    "group": "Test",
    "description": "<p>有Token验证机制</p>",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>用户名</p>"
          }
        ]
      }
    },
    "success": {
      "examples": [
        {
          "title": "HTTP/1.1 200 OK",
          "content": "HTTP/1.1 200 OK\n {\n     \"errcode\": null,\n     \"errmsg\": null,\n     \"data\": true\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/routes/test.js",
    "groupTitle": "Test",
    "name": "GetUserAuxManager"
  },
  {
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "varname1",
            "description": "<p>No type.</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "varname2",
            "description": "<p>With type.</p>"
          }
        ]
      }
    },
    "type": "",
    "url": "",
    "version": "0.0.0",
    "filename": "src/assets/public/apidoc/main.js",
    "group": "d__K11_repo_Juglans_example_hello_src_assets_public_apidoc_main_js",
    "groupTitle": "d__K11_repo_Juglans_example_hello_src_assets_public_apidoc_main_js",
    "name": ""
  }
] });
