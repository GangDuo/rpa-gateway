var DefaultSubmitAction = (() => {
  function DefaultSubmitAction({path, fire, loading, output}) {
    this.path = path;
    this.fire = fire;
    this.loading = loading;
    this.output = output;
  }

  DefaultSubmitAction.prototype.enable = function() {
    var sock = new WebSocket('ws://' + window.location.host + this.path);
    sock.addEventListener('open', (e) => {
      console.log('接続成功');
    });
    sock.addEventListener('message', (e) => {
      var decodedBody = JSON.parse(e.data)
      console.log(decodedBody);
      if(decodedBody.data) {
        document.getElementById(this.output).innerHTML += decodedBody.data + '<br>'
      } else {
        document.getElementById(this.fire).removeAttribute("disabled")
        document.getElementById(this.loading).style.display='none';
      }
    });
    sock.addEventListener('close',(event) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
      }
    });
    sock.addEventListener('error', (error) => {
      console.log(`[error] ${error.message}`);
    });

    document.getElementById(this.fire).addEventListener('click', () => {
      if(document.getElementsByTagName('form')[0].reportValidity()) {
        document.getElementById(this.fire).setAttribute("disabled", true)
        document.getElementById(this.loading).style.display='';
        sock.send(JSON.stringify({data: 'from client'}));
      }
    })
  }

  return DefaultSubmitAction;
})();