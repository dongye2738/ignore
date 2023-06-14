const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

let file_dist = {
  "python-git": "ignore/git/python.gitignore",
  "python-docker": "ignore/docker/python.dockerignore",
  "node-git": "ignore/git/node.gitignore"
}

/**
 * 从GitHub下载文件并将其重命名的函数。
 * @param {string} filepath 要下载的文件路径。
 */
function downloadFileFromGitHub(filepath) {
  // 构建GitHub API的请求URL
  let url = `https://gitee.com/miosy1996/ignore/raw/main/${filepath}`;

  let filename = path.basename(filepath);
  let newFilename = '.' + filename.split('.').pop();

  axios.get(url)
  .then(response => {
    fs.writeFile(newFilename, response.data, err => {
      if (err) {
        vscode.window.showInformationMessage(`${err}`);
      } else {
        vscode.window.showInformationMessage(`Data written to file ${newFilename}`);
      }
    });
  })
  .catch(error => {
    // console.error(error);
    vscode.window.showInformationMessage(`${error}`);
  });
}

/**
 * 从GitHub下载pathfile.json文件并获取其内容。
 */
async function getFileinfo() {
  // 构建GitHub API的请求URL
  // let url = `https://raw.githubusercontent.com/dongye2738/ignore/main/fileinfo.json`;
  let url = `https://gitee.com/miosy1996/ignore/raw/main/fileinfo.json`;

  return await axios.get(url)
    .then(response => {
      return response.data;
    })
    .catch(error => {
      // console.error(error);
      vscode.window.showInformationMessage(`${error}`);
    });
}

/**
 * 插件被激活时的函数。
 * @param {vscode.ExtensionContext} context 插件上下文。
 */
function activate(context) {
  // 注册插件命令
  context.subscriptions.push(vscode.commands.registerCommand('extension.addIgnore', () => {

    // 获取最新文件列表
    const fileinfo = {
      'python-git': 'ignore/git/python.gitignore',
      'python-docker': 'ignore/docker/python.dockerignore'
    };

    getFileinfo().then(data => {
      // 判断返回值是否为空
      if (typeof data === 'undefined' || data === null) {
        vscode.window.showInformationMessage(`data is undefined ${data}`);
        data = file_dist
      }

      let keys = Object.keys(data);
      console.log('keys', keys);
      vscode.window.showInformationMessage(`keys: ${keys}`);

      // 弹出快捷选项列表
      vscode.window.showQuickPick(keys, { placeHolder: 'Select an ignore type:' }).then((selectedOption) => {
        if (!selectedOption) {
          return;
        }
        // 解析选择的选项并下载文件
        downloadFileFromGitHub(data[keys[1]]);
      });
    });

  }));
}

exports.activate = activate;


