const vscode = require('vscode');
const request = require('request');
const fs = require('fs');
const path = require('path');

/**
 * 从GitHub下载文件并将其重命名的函数。
 * @param {string} filepath 要下载的文件路径。
 */
function downloadFileFromGitHub(filepath) {
  // 构建GitHub API的请求URL
  let url = `https://raw.githubusercontent.com/dongye2738/ignore/main/${filepath}`;

  // 发送GET请求并将响应体保存到本地文件系统上
  request.get(url, (error, response, body) => {
    if (error) {
      vscode.window.showErrorMessage(`Failed to download file: ${error.message}`);
      return;
    }
    let filename = path.basename(filepath);
    // let newFilename = filename.startsWith('python-git.') ? '.gitignore' : '.dockerignore';
    let newFilename = '.' + filename.split('.').pop();
    fs.writeFile(newFilename, body, (error) => {
      if (error) {
        vscode.window.showErrorMessage(`Failed to save file: ${error.message}`);
        return;
      }
      vscode.window.showInformationMessage(`File saved as ${newFilename}`);
    });
  });
}

/**
 * 从GitHub下载pathfile.json文件并获取其内容。
 */
function getFileinfo() {
  // 构建GitHub API的请求URL
  let url = `https://raw.githubusercontent.com/dongye2738/ignore/main/fileinfo.json`;

  // 发送GET请求并将内容保存到变量中
  https.get(url, (response) => {
    let body = '';

    response.on('data', (chunk) => {
      body += chunk;
    });

    response.on('end', () => {
      let dict = JSON.parse(body);
      return dict;
      
    });
  }).on('error', (error) => {
    console.error(error.message);
    return '';
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
    // const fileinfo = {
    //   'python-git': 'ignore/git/python.gitignore',
    //   'python-docker': 'ignore/docker/python.dockerignore'
    // };
    let fileinfo = getFileinfo();

    if (!fileinfo) {
      vscode.window.showErrorMessage('文件列表内容为空！');
      return;
    }

    // 弹出快捷选项列表
    vscode.window.showQuickPick(Object.keys(fileinfo), { placeHolder: 'Select an ignore type:' }).then((selectedOption) => {
      if (!selectedOption) {
        return;
      }
      // 解析选择的选项并下载文件
      // let filepath = selectedOption === 'python-git' ? 'ignore/git/python.gitignore' : 'ignore/docker/python.dockerignore';
      let filepath = fileinfo[selectedOption];
      downloadFileFromGitHub(filepath);
    });
  }));
}

exports.activate = activate;
