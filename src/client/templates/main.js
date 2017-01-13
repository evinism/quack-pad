/*
  I have no clue what this format is but here we go!!!
*/

/*
  HAD:
  <link rel="stylesheet" href="${cssPath}">
  <script type="text/javascript" src="${jsPath}"></script>
*/

function script({readOnly, noteId, }){
  if(!readOnly){
    function debounce(func, wait, immediate) {
      var timeout;
      return function() {
        var context = this, args = arguments;
          var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
          };
          var callNow = immediate && !timeout;
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    };

    function throttle (callback, limit) {
      var wait = false;                 // Initially, we're not waiting
      return function () {              // We return a throttled function
        if (!wait) {                  // If we're not waiting
          callback.call();          // Execute users function
          wait = true;              // Prevent future invocations
          setTimeout(function () {  // After a period of time
              wait = false;         // And allow future invocations
          }, limit);
        }
      }
    }
    var area = document.querySelector('textarea');
    // initialize websockets:

    var HOST = location.origin.replace(/^http/, 'ws');
    var ws = new WebSocket(HOST);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'register',
        id: noteId,
      }));
    };

    ws.onmessage = (message) => {
      area.value = message.data;
    }

    function save(){
      // For now do these in parallel
      ws.send(JSON.stringify({
        type: 'update',
        id: noteId,
        content: area.value,
      }));

      // But don't obvs do them in parallel later
      fetch('./', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({content: area.value})
      });
    }

    area.addEventListener('input', throttle(save, 500), false);
  }
}

module.exports = ({cssPath, jsPath, content, readOnly, noteId}) => `
<!DOCTYPE html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <style>
      html {
        height: calc(100% - 20px);
      }
      body {
        height: 100%;
        background-color: #12141c;
      }
      textarea {
        width: calc(100% - 20px);
        height: 100%;
        font-size: 22px;
        border: none;
        background-color: transparent;
        resize: none;
        outline: none;
        color: #eeeeee;
        border-left: 3px solid #33333a;
        margin-left: 10px;
        padding-left: 10px;
      }
      .new-note {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 25px;
          font-weight: bold;
          background-color: rgba(238, 238, 238, 0.40);
          display: block;
          width: 30px;
          height: 30px;
          line-height: 26px;
          text-align: center;
          border-radius: 15px;
          text-decoration: none;
          color: black;
      }
      .new-note:hover {
        background-color: rgba(238, 238, 238, 0.60);
      }
    </style>
  </head>
  <body>
    <textarea autofocus id="notepad" name="notepad">${content}</textarea>
    <a class="new-note" href='/new/' target="_blank">+</a>
    <script>
      // some seriously quick and dirty metaprogramming
      (${script.toString()})(${JSON.stringify({readOnly, noteId})});
    </script>
  </body>
</html>
`;
