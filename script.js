//拡張機能のアイコンをクリックしたとき
chrome.action.onClicked.addListener(function(tab){
  genText(tab);
});

// コンテキストメニューがクリックされたときのイベント
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === "NoSelection") {
    genText(tab);
  } else if (info.menuItemId === "Selection") {
    genQuoteText(info, tab);
  }
});

// 既存のコンテキストメニューを全て削除
chrome.contextMenus.removeAll(function() {
  //何も選択しない場合のコンテキストメニュー
  chrome.contextMenus.create({
    id: "NoSelection",
    title : "Share to twitter",
    contexts : ["page"],
    type : "normal"
  });

  //文字を選択した場合のコンテキストメニュー
  chrome.contextMenus.create({
    id: "Selection",
    title : "Share to twitter",
    contexts : ["selection"],
    type : "normal"
  });
});
//何も選択してない時のテキスト
function genText(tab){
  var strtmp = getLen(tab.title);
  const MAX_LENGTH = 257;
  if(strtmp.strLength >= MAX_LENGTH){
    var text = cutStr(tab.title, strtmp.strArray, strtmp.strLength);
  }else{
    var text = tab.title;
  }
  genURL(tab, text);
}

//文字を選択した時のテキスト
//文字数がオーバーしそうなときは末尾を切り捨てる
function genQuoteText(info, tab){
  var strtmp = getLen(info.selectionText);
  const MAX_LENGTH = 255;
  if(strtmp.strLength >= MAX_LENGTH){
    var text = "\"" + cutStr(info.selectionText, strtmp.strArray, strtmp.strLength) + "\"";
  }else{
    var text = "\"" + info.selectionText + "\"";
  }
  genURL(tab, text);
}

//Twitter共有ページURLを生成
function genURL(tab, text){
  const template = 'https://twitter.com/intent/tweet?';
  let title = 'text=' + text;
  title = encodeURI(title);
  let url = '&url=' + tab.url;
  url = encodeURI(url);
  let tweetURL = template + title + url;
  chrome.tabs.create({url: tweetURL});
}


//半角英数字を1文字
//それ以外の文字（全角英数字、日本語（半角カナを含む））を2文字
//とした時の文字列の長さを取得
//argument
//  str: Strings
//return:
//  strLength: Integer
//  strArray: Array
function getLen(str){
  let strArray = [];
  let strLength = 0;
  for(let i = 0; i <= str.length; i++){
    let chr = str.charCodeAt(i);
    if(chr >= 0x0 && chr < 0x81){
      strLength += 1;
      strArray[i] = 1;
    }else{
      strLength += 2;
      strArray[i] = 2;
    }
  }
  return {"strLength": strLength, "strArray": strArray};
}

//TwitterではURLを固定23文字とする仕様なので280 - 23 = 257
//よって257文字以内に収める
//argument
//  str: Strings
//  strArray: Array
//  strLength: Integer
//return:
//  -1: Error
//  str: Strings
function cutStr(str, strArray, strLength){
  for(let i = str.length; strLength >= MAX_LENGTH; i--){
    if(strArray[i] == 1){
      str = str.slice(0, -1);
      strLength -= 1;
    }else if(strArray[i] == 2){
      str = str.slice(0, -1);
      strLength -= 2;
    }else{
      return -1;
    }
    console.log(strLength);
  }
  return str;
}
