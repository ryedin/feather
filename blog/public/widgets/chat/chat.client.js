(function() {
  
  feather.ns("blog");
  
  var chatChannel = feather.socket.subscribe("blog:chat");

  blog.chat = feather.widget.create({
    name: "blog.chat",
    path: "widgets/chat/",
    prototype: {
      notifier: null,
      initialize: function($super, options) {
        $super(options);
        if (window.Audio) { //window reference required to avoid breaking error during check if undefined
          this.notifier = new Audio();
          this.notifier.src = '/widgets/chat/notify.wav';
          this.notifier.load();
        }
      },
      onReady: function() {
        var me = this;
            
        //cache the message template
        this.messageTemplate = this.templates.findById("message");
        
        this.bindUI();
        
        /**
         * update the UI when other clients connect
         */
        chatChannel.on("connection", function(args) {
          alert("connection");
        });
        
        /**
         * respond to other clients' messages
         */
        chatChannel.on("chat", function(args) {
          me.newMessage({
            name: args.name,
            message: args.message,
            remote: true
          });
        });
      },
      bindUI: function() {
        var me = this,
            domEvents = this.domEvents,
            namebox = me.get("#namebox"),
            chatbox = me.get("#chatbox");

        namebox.focus(function() {
          namebox.unbind();
          namebox[0].value = "";
          namebox.removeClass("grey");
        });
        
        chatbox.focus(function() {
          chatbox.unbind('focus');
          chatbox[0].value = "";
          chatbox.removeClass("grey");
        });
        
        var sendMessage = function() {
          var data = {
            message: chatbox[0].value,
            name: namebox[0].value,
            remote: false
          };
          me.newMessage(data);
          chatChannel.send("chat", data);
        };
        
        /**
         * binding the chat button to update local ui 
         * as well as broadcast to other clients that might be connected
         */
        domEvents.bind(me.get("#chatBtn"), "click", sendMessage);
        domEvents.bind(chatbox, "keyup", function(e) {
          var e = window.event || e;
          if (e.keyCode == 13) {
            sendMessage();
          }
        });
      },
      newMessage: function(data) {
        var conversation = this.get("#conversation");
        $.tmpl(this.messageTemplate.tmpl, data).appendTo(conversation);
        conversation.scrollTop(conversation.height());
        if (data.remote && this.notifier) {
          this.notifier.load();
          this.notifier.play();
        }
      }
    } // end prototype
  });
})();
